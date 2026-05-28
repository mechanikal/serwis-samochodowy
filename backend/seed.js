const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const connectMongo = require('./mongo');
const Klient = require('./models/client');
const Mechanik = require('./models/mechanic');
const Pojazd = require('./models/vehicle');
const Usterka = require('./models/fault');
const Usluga = require('./models/service');
const Czesc = require('./models/part');
const Wizyta = require('./models/visit');
const Diagnoza = require('./models/diagnosis');
const Powiadomienie = require('./models/notification');

async function clearDatabase() {
  await Promise.all([
    Klient.deleteMany({}),
    Mechanik.deleteMany({}),
    Pojazd.deleteMany({}),
    Usterka.deleteMany({}),
    Usluga.deleteMany({}),
    Czesc.deleteMany({}),
    Wizyta.deleteMany({}),
    Diagnoza.deleteMany({}),
    Powiadomienie.deleteMany({})
  ]);
}

async function seed() {
  let mysqlConn;
  try {
    // 1. Połączenie z MongoDB
    await connectMongo();
    console.log('Połączono z MongoDB do seedowania');

    // 2. Połączenie z MySQL
    mysqlConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'users_db',
      port: process.env.DB_PORT || 3306
    });
    console.log('Połączono z MySQL do seedowania');

    // Czyszczenie MongoDB (opcjonalnie, ale dobre dla testów)
    await clearDatabase();

    // 3. Tworzenie użytkowników w MySQL
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Mechanik
    const [mechRes] = await mysqlConn.execute(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['mechanik1', 'jan@serwis.pl', hashedPassword, 'Jan', 'Kowalski', '123456789', 'mechanic']
    );
    const mechId = mechRes.insertId;

    // Klient 1
    const [klient1Res] = await mysqlConn.execute(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['klient1', 'adam@gmail.com', hashedPassword, 'Adam', 'Nowak', '987654321', 'user']
    );
    const klient1UserId = klient1Res.insertId;

    // 4. Tworzenie rekordów w MongoDB
    
    // Modele Mechanik i Klient (powiązane z ID z MySQL)
    const mongoMech = await Mechanik.create({ userId: mechId, name: 'Jan', lastName: 'Kowalski' });
    const mongoKlient1 = await Klient.create({ userId: klient1UserId, name: 'Adam', lastName: 'Nowak' });

    // Pojazd
    const auto1 = await Pojazd.create({
      clientId: mongoKlient1._id,
      brand: 'Audi A4',
      year: 2015,
      registration: 'WA12345',
      VIN: 'WAUX1234567890'
    });

    // Usterki, Usługi, Części
    const usterka1 = await Usterka.create({ name: 'Stukanie w zawieszeniu', description: 'Słychać stukanie przy przejeżdżaniu przez progi' });
    const usluga1 = await Usluga.create({ name: 'Wymiana wahacza', price: 150 });
    const czesc1 = await Czesc.create({ name: 'Wahacz przedni prawy', price: 300 });

    // Wizyta
    const wizyta1 = await Wizyta.create({
      vehicleId: auto1._id,
      clientId: mongoKlient1._id,
      status: 'w trakcie',
      date: new Date(),
      time: '10:00'
    });

    // Diagnoza
    await Diagnoza.create({
      visitId: wizyta1._id,
      mechanicId: mongoMech._id,
      diagnosisDescription: 'Uszkodzony sworzeń wahacza dolnego.',
      faults: [usterka1._id],
      requiredServices: [usluga1._id],
      requiredParts: [czesc1._id]
    });

    // Powiadomienie
    await Powiadomienie.create({
      visitId: wizyta1._id,
      newVisitStatus: 'w trakcie'
    });

    console.log('Seedowanie zakończone sukcesem!');
  } catch (err) {
    console.error('Błąd podczas seedowania:', err);
  } finally {
    if (mysqlConn) await mysqlConn.end();
    mongoose.connection.close();
  }
}

seed();
