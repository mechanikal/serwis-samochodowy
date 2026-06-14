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
    const nameEmailCheck = `
            SELECT COUNT(*) FROM users
                WHERE email = ? OR username = ?
        `;

    const [result] = db.query(nameEmailCheck, [email, username]);

    if (result.count > 0) {
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

    db.query(
      sql,
      [username, email, hashedPassword, first_name, last_name, phone],
      (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }

        res.send({
          message: "Użytkownik utworzony",
          id: result.insertId,
        });
      },
    );
  } catch (err) {
    res.status(500).send(err);
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
              date: new Date(v.date).toLocaleDateString(),
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
    const visits = await Visit.find().populate("clientId");
    const visitsData = visits.map((v) => ({
      _id: v._id,
      date: new Date(v.date).toISOString().split("T")[0], // yyyy-mm-dd
      time: v.time,
      serviceName: v.title,
      clientName: v.clientId
        ? `${v.clientId.name} ${v.clientId.lastName}`
        : "Nieznany",
      status: v.status,
    }));
    res.json(visitsData);
  } catch (err) {
    console.error(err);
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
      const Notification = require("./models/notification");
      await Notification.create({
          visitId:        visit._id,
          newVisitStatus: status,
          status:         status === 'zakończone' ? 'read' : 'unread',
          date:           new Date()
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

    const Mechanic = require("./models/mechanic");
    const mechanic = await Mechanic.findOne({ userId: req.user.id });
    if (!mechanic) {
      return res.status(403).json({ message: "Mechanic not found" });
    }

    // Calculate total price from services and parts in DB to avoid client-side tampering
    const servicesData = await Service.find({ _id: { $in: requiredServices } });
    const partsData = await Part.find({ _id: { $in: requiredParts } });
    
    let totalPrice = 0;
    requiredServices.forEach(id => {
      const s = servicesData.find(sd => sd._id.toString() === id);
      if (s) totalPrice += s.price;
    });
    requiredParts.forEach(id => {
      const p = partsData.find(pd => pd._id.toString() === id);
      if (p) totalPrice += p.price;
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
  requireRole("admin","mechanic"),
  async (req, res) => {
    try {
      const faults = await Fault.find();

      const faultStats = faults.map((u) => ({
        name: u.name || "Fault",
        count: Math.floor(Math.random() * 20).toString(),
      }));

      const services = await Service.find();
      const serviceStats = services.map((u) => ({
        name: u.name || "Usługa",
        count: Math.floor(Math.random() * 30).toString(),
      }));

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
      cars.map(async(c)=>({
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

app.get("/api/client-visits", authenticateToken, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    if (!client) {
        return res.status(404).json({ message: "Nie znaleziono klienta" });
      }
    const visits = await Visit.find({ clientId: client._id })
      .populate("vehicleId", 'brand model registration VIN');
    const visitsData = visits.map((v) => ({
      _id: v._id,
      date: new Date(v.date).toISOString().split("T")[0], // yyyy-mm-dd
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

app.get("/api/car-visits/:id", authenticateToken, async (req, res) => {
  try {
    const car = await Vehicle.findOne({ _id: req.params.id }).populate("clientId");
    const client = await Client.findOne({ userId: req.user.id });
    if (!visit.clientId._id.equals(client._id)) {
      return res.status(403).json({ message: 'Brak dostępu do tej wizyty' });
    }
    
    const visitsData = visits.map((v) => ({
      _id: v._id,
      date: new Date(v.date).toISOString().split("T")[0], // yyyy-mm-dd
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

app.get("/api/visit-diagnosis/:id", authenticateToken, async (req, res) => {
  try {
    const visit = await Visit.findOne({ _id: req.params.id }).populate("clientId");
    const client = await Client.findOne({ userId: req.user.id });
    if (!visit.clientId._id.equals(client._id)) {
      return res.status(403).json({ message: 'Brak dostępu do tej wizyty' });
    }
    const estimate = await diagnosis.findOne({ visitId: visit._id })
      .populate("faults")
      .populate("requiredServices")
      .populate("requiredParts");
    if (estimate== null){
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

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
