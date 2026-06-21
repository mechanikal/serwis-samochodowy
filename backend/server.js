const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const db = require("./db");
const connectMongo = require("./mongo");

const Client = require("./models/client");
const Vehicle = require("./models/vehicle");
const Visit = require("./models/visit");
const Fault = require("./models/fault");
const Service = require("./models/service");
const diagnosis = require("./models/diagnosis");
const Part = require("./models/part");
const Notification = require("./models/notification");
const Mechanic = require("./models/mechanic");

connectMongo();

const app = express();
const PORT = process.env.PORT;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) return res.status(401).json({ message: "Brak autoryzacji" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Nieprawidłowy lub wygasły token" });
    req.user = user;
    next();
  });
};

const requireRole =
  (...roles) =>
    (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: "Brak uprawnień do tej operacji" });
      }
      next();
    };

app.use(cors());
app.use(express.json());

/** Timezone-safe yyyy-MM-dd formatter (uses local date parts, not UTC) */
function toLocalDateStr(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

app.get("/", (req, res) => {
  res.send("API works");
});

app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const sql = `
            SELECT id, username, email, password_hash, role, first_name, last_name
            FROM users
            WHERE email = ? OR username = ?
            LIMIT 1
        `;
    const [rows] = await db.promise().query(sql, [identifier, identifier]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Zalogowano pomyślnie",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/register", async (req, res) => {
  const { username, email, password, first_name, last_name, phone } = req.body;

  try {
    // Validate required fields
    if (!username || !email || !password || !first_name || !last_name || !phone) {
      return res.status(400).json({ message: "Wszystkie pola są wymagane" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Nieprawidłowy format adresu e-mail" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: "Hasło musi mieć co najmniej 6 znaków" });
    }

    // Check for duplicate username or email
    const nameEmailCheck = `
            SELECT COUNT(*) AS cnt FROM users
                WHERE email = ? OR username = ?
        `;

    const [rows] = await db.promise().query(nameEmailCheck, [email, username]);

    if (rows[0].cnt > 0) {
      return res
        .status(409)
        .json({ message: "Email lub nazwa użytkownika już istnieje" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
            INSERT INTO users
                (username, email, password_hash, first_name, last_name, phone, role)
            VALUES (?, ?, ?, ?, ?, ?, 'user')
        `;

    const [result] = await db.promise().query(
      sql,
      [username, email, hashedPassword, first_name, last_name, phone],
    );

    // Create corresponding MongoDB Client document so the user can use client features immediately
    await Client.create({
      userId: result.insertId,
      name: first_name,
      lastName: last_name
    });

    res.json({
      message: "Użytkownik utworzony",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Błąd serwera podczas rejestracji" });
  }
});

app.get(
  "/api/clients",
  authenticateToken,
  requireRole("mechanic"),
  async (req, res) => {
    try {
      const clients = await Client.find();

      const clientsData = await Promise.all(
        clients.map(async (client) => {
          const vehicles = await Vehicle.find({ clientId: client._id });
          const visits = await Visit.find({ clientId: client._id });

          return {
            _id: client._id,
            firstName: client.name,
            lastName: client.lastName,
            vehicles: vehicles.map((v) => ({
              brand: v.brand,
              registration: v.registration,
            })),
            visits: visits.map((v) => ({
              serviceName: v.title,
              status: v.status,
              date: toLocalDateStr(v.date),
            })),
          };
        }),
      );

      res.json(clientsData);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },
);

app.get("/api/visits", authenticateToken, async (req, res) => {
  try {
    // Mechanics see all visits; regular users only see date/time for slot availability
    if (req.user.role === "mechanic" || req.user.role === "admin") {
      const visits = await Visit.find().populate("clientId").populate("vehicleId");
      const visitsData = visits.map((v) => ({
        _id: v._id,
        date: toLocalDateStr(v.date),
        time: v.time,
        serviceName: v.title,
        clientName: v.clientId
          ? `${v.clientId.name} ${v.clientId.lastName}`
          : "Nieznany",
        status: v.status,
        vehicle: v.vehicleId ? {
          brand: v.vehicleId.brand,
          model: v.vehicleId.model,
          year: v.vehicleId.year,
          registration: v.vehicleId.registration,
          VIN: v.vehicleId.VIN
        } : null,
        description: v.description
      }));
      res.json(visitsData);
    } else {
      // Regular users only get date/time for schedule-visit slot checking
      const visits = await Visit.find().select("date time");
      const visitsData = visits.map((v) => ({
        date: toLocalDateStr(v.date),
        time: v.time,
      }));
      res.json(visitsData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/api/visits", authenticateToken, requireRole("user"), async (req, res) => {
  try {
    const { vehicle, date, time, description } = req.body;
    if (!vehicle || !date || !time || !description) {
      return res.status(400).json({ message: "Wszystkie pola są wymagane" });
    }

    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Nie znaleziono klienta" });
    }

    // Verify vehicle belongs to client
    const vehicleDoc = await Vehicle.findOne({ _id: vehicle, clientId: client._id });
    if (!vehicleDoc) {
      return res.status(403).json({ message: "Pojazd nie należy do klienta" });
    }

    // Parse date as local midnight to avoid timezone shift
    const [year, month, day] = date.split('-').map(Number);
    const visitDate = new Date(year, month - 1, day);

    // Check if time slot is already taken
    const existingVisit = await Visit.findOne({
      date: {
        $gte: new Date(year, month - 1, day, 0, 0, 0),
        $lt: new Date(year, month - 1, day + 1, 0, 0, 0)
      },
      time: time
    });
    if (existingVisit) {
      return res.status(409).json({ message: "Wybrany termin jest już zajęty" });
    }

    const visit = await Visit.create({
      vehicleId: vehicleDoc._id,
      clientId: client._id,
      title: description.substring(0, 80),
      status: 'nadchodzące',
      date: visitDate,
      time: time,
      description: description
    });

    res.status(201).json({ message: "Wizyta umówiona", visitId: visit._id });
  } catch (err) {
    console.error("Create visit error:", err);
    res.status(500).send("Server error");
  }
});

app.delete(
  "/api/visits/:id",
  authenticateToken,
  requireRole("mechanic"),
  async (req, res) => {
    try {
      const deleted = await Visit.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Wizyta nie znaleziona" });
      }
      res.json({ message: "Wizyta usunięta" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

app.patch(
  "/api/visits/:id/status",
  authenticateToken,
  requireRole("mechanic"),
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Brak statusu" });
      }

      const visit = await Visit.findById(req.params.id);
      if (!visit) {
        return res.status(404).json({ message: "Wizyta nie znaleziona" });
      }

      visit.status = status;
      await visit.save();

      // Create a notification for the client
      await Notification.create({
        visitId: visit._id,
        clientId: visit.clientId,
        newVisitStatus: status,
        status: 'unread',
        date: new Date()
      });

      res.json({ message: "Status zaktualizowany pomyślnie", visit });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

app.get("/api/mechanic/visits/:id/diagnosis", authenticateToken, requireRole("mechanic"), async (req, res) => {
  try {
    const existingDiagnosis = await diagnosis.findOne({ visitId: req.params.id });
    if (!existingDiagnosis) {
      return res.json(null);
    }
    res.json(existingDiagnosis);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Endpoints for diagnosis dictionary data
app.get("/api/faults", authenticateToken, requireRole("mechanic"), async (req, res) => {
  try {
    const faults = await Fault.find();
    res.json(faults);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.get("/api/services", authenticateToken, requireRole("mechanic"), async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.get("/api/parts", authenticateToken, requireRole("mechanic"), async (req, res) => {
  try {
    const parts = await Part.find();
    res.json(parts);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.put("/api/visits/:id/diagnosis", authenticateToken, requireRole("mechanic"), async (req, res) => {
  try {
    const { diagnosisDescription, faults, requiredServices, requiredParts } = req.body;
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Wizyta nie znaleziona" });
    }

    const mechanic = await Mechanic.findOne({ userId: req.user.id });
    if (!mechanic) {
      return res.status(403).json({ message: "Mechanic not found" });
    }

    let totalPrice = 0;
    requiredServices.forEach(item => {
      totalPrice += Number(item.price) || 0;
    });
    requiredParts.forEach(item => {
      totalPrice += Number(item.price) || 0;
    });

    // Find if diagnosis already exists, otherwise create
    let existingDiagnosis = await diagnosis.findOne({ visitId: visit._id });
    if (existingDiagnosis) {
      existingDiagnosis.diagnosisDescription = diagnosisDescription;
      existingDiagnosis.faults = faults;
      existingDiagnosis.requiredServices = requiredServices;
      existingDiagnosis.requiredParts = requiredParts;
      existingDiagnosis.totalPrice = totalPrice;
      existingDiagnosis.accepted = false;
      existingDiagnosis.mechanicId = mechanic._id;
      await existingDiagnosis.save();
    } else {
      await diagnosis.create({
        visitId: visit._id,
        mechanicId: mechanic._id,
        diagnosisDescription,
        faults,
        requiredServices,
        requiredParts,
        totalPrice,
        accepted: false
      });
    }

    res.json({ message: "Kosztorys zapisany", totalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get(
  "/api/stats",
  authenticateToken,
  requireRole("admin", "mechanic"),
  async (req, res) => {
    try {
      // Aggregate real fault counts from Diagnosis documents
      const faultAgg = await diagnosis.aggregate([
        { $unwind: "$faults" },
        { $group: { _id: "$faults", count: { $sum: 1 } } }
      ]);
      const faults = await Fault.find();
      const faultStats = faults.map((f) => {
        const agg = faultAgg.find(a => a._id.toString() === f._id.toString());
        return {
          name: f.name || "Fault",
          count: (agg ? agg.count : 0).toString(),
        };
      });

      // Aggregate real service counts from Diagnosis documents
      const serviceAgg = await diagnosis.aggregate([
        { $unwind: "$requiredServices" },
        { $group: { _id: "$requiredServices", count: { $sum: 1 } } }
      ]);
      const services = await Service.find();
      const serviceStats = services.map((s) => {
        const agg = serviceAgg.find(a => a._id.toString() === s._id.toString());
        return {
          name: s.name || "Usługa",
          count: (agg ? agg.count : 0).toString(),
        };
      });

      if (faultStats.length === 0) {
        faultStats.push({ name: "Brak danych usterek", count: "0" });
      }
      if (serviceStats.length === 0) {
        serviceStats.push({ name: "Brak danych usług", count: "0" });
      }

      res.json({
        faults: faultStats,
        services: serviceStats,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Błąd serwera");
    }
  },
);

app.get(
  "/api/client-cars",
  authenticateToken,
  requireRole("user"),
  async (req, res) => {
    try {
      const client = await Client.findOne({ userId: req.user.id });
      if (!client) {
        return res.status(404).json({ message: "Nie znaleziono klienta" });
      }
      const cars = await Vehicle.find({ clientId: client._id });
      const carData = await Promise.all(
        cars.map(async (c) => ({
          brand: c.brand,
          model: c.model,
          year: c.year,
          registration: c.registration,
          VIN: c.VIN,
          _id: c._id,
          visits: await Visit.find({ vehicleId: c._id }).select(" date serviceName status description")
        }))
      );
      res.json(carData);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// --- Client Vehicle CRUD ---

app.post(
  "/api/client-cars",
  authenticateToken,
  requireRole("user"),
  async (req, res) => {
    try {
      const client = await Client.findOne({ userId: req.user.id });
      if (!client) {
        return res.status(404).json({ message: "Nie znaleziono klienta" });
      }

      const { brand, model, year, registration, VIN } = req.body;
      if (!brand || !model || !registration || !VIN) {
        return res.status(400).json({ message: "Wszystkie pola są wymagane" });
      }

      const vehicle = await Vehicle.create({
        clientId: client._id,
        brand,
        model,
        year: year || null,
        registration,
        VIN
      });

      res.status(201).json({ message: "Pojazd dodany", vehicle });
    } catch (err) {
      console.error("Add vehicle error:", err);
      if (err.code === 11000) {
        return res.status(409).json({ message: "Pojazd z taką rejestracją lub VIN już istnieje" });
      }
      res.status(500).send("Server error");
    }
  }
);

app.put(
  "/api/client-cars/:id",
  authenticateToken,
  requireRole("user"),
  async (req, res) => {
    try {
      const client = await Client.findOne({ userId: req.user.id });
      if (!client) {
        return res.status(404).json({ message: "Nie znaleziono klienta" });
      }

      const vehicle = await Vehicle.findOne({ _id: req.params.id, clientId: client._id });
      if (!vehicle) {
        return res.status(404).json({ message: "Pojazd nie znaleziony lub brak dostępu" });
      }

      const { brand, model, year, registration, VIN } = req.body;
      if (brand) vehicle.brand = brand;
      if (model) vehicle.model = model;
      if (year !== undefined) vehicle.year = year;
      if (registration) vehicle.registration = registration;
      if (VIN) vehicle.VIN = VIN;

      await vehicle.save();
      res.json({ message: "Pojazd zaktualizowany", vehicle });
    } catch (err) {
      console.error("Update vehicle error:", err);
      if (err.code === 11000) {
        return res.status(409).json({ message: "Pojazd z taką rejestracją lub VIN już istnieje" });
      }
      res.status(500).send("Server error");
    }
  }
);

app.delete(
  "/api/client-cars/:id",
  authenticateToken,
  requireRole("user"),
  async (req, res) => {
    try {
      const client = await Client.findOne({ userId: req.user.id });
      if (!client) {
        return res.status(404).json({ message: "Nie znaleziono klienta" });
      }

      const vehicle = await Vehicle.findOne({ _id: req.params.id, clientId: client._id });
      if (!vehicle) {
        return res.status(404).json({ message: "Pojazd nie znaleziony lub brak dostępu" });
      }

      // Check if vehicle has active visits
      const activeVisits = await Visit.find({
        vehicleId: vehicle._id,
        status: { $nin: ['zakończone', 'anulowane'] }
      });
      if (activeVisits.length > 0) {
        return res.status(409).json({ message: "Nie można usunąć pojazdu z aktywnymi wizytami" });
      }

      await Vehicle.findByIdAndDelete(vehicle._id);
      res.json({ message: "Pojazd usunięty" });
    } catch (err) {
      console.error("Delete vehicle error:", err);
      res.status(500).send("Server error");
    }
  }
);

app.get("/api/client-visits", authenticateToken, requireRole("user"), async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Nie znaleziono klienta" });
    }
    const visits = await Visit.find({ clientId: client._id })
      .populate("vehicleId", 'brand model registration VIN');
    const visitsData = visits.map((v) => ({
      _id: v._id,
      date: toLocalDateStr(v.date),
      time: v.time,
      serviceName: v.title,
      clientName: `${client.name} ${client.lastName}`,
      status: v.status,
      vehicle: v.vehicleId ? {
        model: v.vehicleId.model,
        brand: v.vehicleId.brand,
        registration: v.vehicleId.registration,
        VIN: v.vehicleId.VIN
      } : null,
      description: v.description
    }));
    res.json(visitsData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// --- Client Visit Actions ---

app.post("/api/client-visits/accept/:id", authenticateToken, requireRole("user"), async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Nie znaleziono klienta" });
    }

    const visit = await Visit.findOne({ _id: req.params.id, clientId: client._id });
    if (!visit) {
      return res.status(404).json({ message: "Wizyta nie znaleziona lub brak dostępu" });
    }

    // Only allow accepting when waiting for estimate approval
    if (visit.status !== 'oczekiwanie na zatwierdzenie kosztorysu') {
      return res.status(400).json({ message: "Kosztorys nie oczekuje na zatwierdzenie" });
    }

    // Mark diagnosis as accepted
    const diag = await diagnosis.findOne({ visitId: visit._id });
    if (diag) {
      diag.accepted = true;
      await diag.save();
    }

    // Advance visit status to "w trakcie naprawy"
    visit.status = 'w trakcie naprawy';
    await visit.save();

    res.json({ message: "Kosztorys zatwierdzony", visit });
  } catch (err) {
    console.error("Accept estimate error:", err);
    res.status(500).send("Server error");
  }
});

app.post("/api/client-visits/cancel/:id", authenticateToken, requireRole("user"), async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Nie znaleziono klienta" });
    }

    const visit = await Visit.findOne({ _id: req.params.id, clientId: client._id });
    if (!visit) {
      return res.status(404).json({ message: "Wizyta nie znaleziona lub brak dostępu" });
    }

    // Only allow cancellation for early statuses
    const cancellableStatuses = ['nadchodzące', 'oczekiwanie na kosztorys', 'oczekiwanie na zatwierdzenie kosztorysu'];
    if (!cancellableStatuses.includes(visit.status)) {
      return res.status(400).json({ message: "Nie można anulować wizyty w tym statusie" });
    }

    visit.status = 'anulowane';
    await visit.save();

    res.json({ message: "Wizyta anulowana", visit });
  } catch (err) {
    console.error("Cancel visit error:", err);
    res.status(500).send("Server error");
  }
});

app.get("/api/car-visits/:id", authenticateToken, requireRole("user"), async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Nie znaleziono klienta" });
    }

    const car = await Vehicle.findOne({ _id: req.params.id, clientId: client._id });
    if (!car) {
      return res.status(403).json({ message: 'Brak dostępu do tego pojazdu' });
    }

    const visits = await Visit.find({ vehicleId: car._id });
    const visitsData = visits.map((v) => ({
      _id: v._id,
      date: toLocalDateStr(v.date),
      time: v.time,
      serviceName: v.title,
      status: v.status,
      description: v.description
    }));
    res.json(visitsData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/visit-diagnosis/:id", authenticateToken, requireRole("user"), async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Nie znaleziono klienta" });
    }

    const visit = await Visit.findOne({ _id: req.params.id, clientId: client._id });
    if (!visit) {
      return res.status(403).json({ message: 'Brak dostępu do tej wizyty' });
    }
    const estimate = await diagnosis.findOne({ visitId: visit._id })
      .populate("faults")
      .populate("requiredServices.serviceId")
      .populate("requiredParts.partId");
    if (estimate == null) {
      return res.status(404).json({ message: "Brak diagnozy dla wizyty" });
    }
    const diagnosisData = {
      diagnosisDescription: estimate.diagnosisDescription,
      faults: estimate.faults,
      requiredServices: estimate.requiredServices,
      requiredParts: estimate.requiredParts,
      totalPrice: estimate.totalPrice,
      accepted: estimate.accepted ? estimate.accepted : false,
    };
    res.json(diagnosisData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// --- Notifications ---

app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Nie znaleziono klienta" });
    }

    const notifications = await Notification.find({ clientId: client._id })
      .sort({ date: -1 })
      .populate("visitId", "title date time");

    const data = notifications.map(n => ({
      _id: n._id,
      title: n.visitId ? `Wizyta: ${n.visitId.title}` : 'Aktualizacja wizyty',
      body: `Status zmieniony na: ${n.newVisitStatus}`,
      time: n.date,
      status: n.status
    }));

    res.json(data);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).send("Server error");
  }
});

app.delete("/api/notifications/:id", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
      return res.status(404).json({ message: "Nie znaleziono klienta" });
    }

    const notification = await Notification.findOne({ _id: req.params.id, clientId: client._id });
    if (!notification) {
      return res.status(404).json({ message: "Powiadomienie nie znalezione" });
    }

    await Notification.findByIdAndDelete(notification._id);
    res.json({ message: "Powiadomienie usunięte" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
