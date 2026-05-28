const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const db = require("./db");
const connectMongo = require("./mongo");

const Client = require("./models/client");
const Vehicle = require("./models/vehicle");
const Visit = require("./models/visit");
const Fault = require("./models/fault");
const Service = require("./models/service");

connectMongo();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API works");
});

app.post("/api/register", async (req, res) => {
    const { username, email, password, first_name, last_name, phone } = req.body;

    try {
        const nameEmailCheck = `
            SELECT COUNT(*) FROM users
                WHERE email = ? OR username = ?
        `;

        const [result] = await db.query(nameEmailCheck, [email, username]);

        if (result.count > 0) {
            return res.status(409).json({ message: "Email lub nazwa użytkownika już istnieje" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
            INSERT INTO users
                (username, email, password_hash, first_name, last_name, phone, role)
            VALUES (?, ?, ?, ?, ?, ?, 'user')
        `;

        db.query(sql, [username, email, hashedPassword, first_name, last_name, phone], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            res.send({
                message: "Użytkownik utworzony",
                id: result.insertId,
            });
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get("/api/clients", async (req, res) => {
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
                    vehicles: vehicles.map((v) => ({ brand: v.brand, registration: v.registration })),
                    visits: visits.map((v) => ({
                        serviceName: "Naprawa",
                        status: v.status,
                        date: new Date(v.date).toLocaleDateString(),
                    })),
                };
            })
        );

        res.json(clientsData);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/api/visits", async (req, res) => {
    try {
        const visits = await Visit.find().populate("clientId");
        const visitsData = visits.map((v) => ({
            _id: v._id,
            date: new Date(v.date).toISOString().split("T")[0], // yyyy-mm-dd
            time: v.time,
            serviceName: "Naprawa",
            clientName: v.clientId ? `${v.clientId.name} ${v.clientId.lastName}` : "Nieznany",
            status: v.status,
        }));
        res.json(visitsData);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/api/stats", async (req, res) => {
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
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
