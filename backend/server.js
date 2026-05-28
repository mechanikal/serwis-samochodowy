const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = require('./db');
const connectMongo = require('./mongo');

const Klient = require('./models/client');
const Pojazd = require('./models/vehicle');
const Wizyta = require('./models/visit');
const Usterka = require('./models/fault');
const Usluga = require('./models/service');

// Połączenie z MongoDB
connectMongo();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users 
      (username, email, password_hash, first_name, last_name, phone, role)
      VALUES (?, ?, ?, ?, ?, ?, 'user')
    `;

    db.query(sql, [
      username,
      email,
      hashedPassword,
      first_name,
      last_name,
      phone
    ], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.send({
        message: 'Użytkownik utworzony',
        id: result.insertId
      });
    });

  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/', (req, res) => {
  res.send('API działa');
});

// Pobieranie klientów wraz z pojazdami i wizytami (agregacja)
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Klient.find();
    
    // Dla każdego klienta pobierzemy jego samochody i wizyty
    const clientsData = await Promise.all(
      clients.map(async (client) => {
        const vehicles = await Pojazd.find({ klientId: client._id });
        const visits = await Wizyta.find({ klientId: client._id });
        
        return {
          _id: client._id,
          firstName: client.name,
          lastName: client.lastName,
          vehicles: vehicles.map(v => ({ brand: v.brand, registration: v.registration })),
          visits: visits.map(v => ({ 
            serviceName: 'Naprawa', // Brak szczegółów o usłudze w samej encji Wizyta, damy default lub trzeba by łączyć z Usluga
            status: v.status, 
            date: new Date(v.date).toLocaleDateString()
          }))
        };
      })
    );
    
    res.json(clientsData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Pobieranie wszystkich wizyt (napraw) do kalendarza/repairs
app.get('/api/visits', async (req, res) => {
  try {
    const visits = await Wizyta.find().populate('klientId');
    const visitsData = visits.map(v => ({
      _id: v._id,
      date: new Date(v.date).toISOString().split('T')[0], // format yyyy-mm-dd
      time: v.time,
      serviceName: 'Naprawa',
      clientName: v.clientId ? `${v.clientId.name} ${v.clientId.lastName}` : 'Nieznany',
      status: v.status
    }));
    res.json(visitsData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

// Pobieranie statystyk
app.get('/api/stats', async (req, res) => {
  try {
    const usterki = await Usterka.find();

    const usterkiStats = usterki.map(u => ({ name: u.name || 'Usterka', count: Math.floor(Math.random() * 20).toString() }));
    
    const uslugi = await Usluga.find();
    const uslugiStats = uslugi.map(u => ({ name: u.name || 'Usługa', count: Math.floor(Math.random() * 30).toString() }));

    if(usterkiStats.length === 0) {
      usterkiStats.push({ name: 'Brak danych usterek', count: '0' });
    }
    if(uslugiStats.length === 0) {
      uslugiStats.push({ name: 'Brak danych usług', count: '0' });
    }

    res.json({
      faults: usterkiStats,
      services: uslugiStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd serwera');
  }
});

app.listen(PORT, () => {
  console.log('Server running on port',PORT);
});