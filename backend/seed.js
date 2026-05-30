const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const connectMongo = require('./mongo');
const Klient = require('./models/Klient');
const Mechanik = require('./models/Mechanik');
const Pojazd = require('./models/Pojazd');
const Usterka = require('./models/Usterka');
const Usluga = require('./models/Usluga');
const Czesc = require('./models/Czesc');
const Wizyta = require('./models/Wizyta');
const Diagnoza = require('./models/Diagnoza');
const Powiadomienie = require('./models/Powiadomienie');

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
    const mongoMech = await Mechanik.create({ userId: mechId, imie: 'Jan', nazwisko: 'Kowalski' });
    const mongoKlient1 = await Klient.create({ userId: klient1UserId, imie: 'Adam', nazwisko: 'Nowak' });

    // Pojazd
    const auto1 = await Pojazd.create({
      klientId: mongoKlient1._id,
      marka: 'Audi A4',
      rok: 2015,
      rejestracja: 'WA12345',
      VIN: 'WAUX1234567890'
    });

    // Usterki, Usługi, Części
    const usterka1 = await Usterka.create({ nazwa: 'Stukanie w zawieszeniu', opis: 'Słychać stukanie przy przejeżdżaniu przez progi' });
    const usluga1 = await Usluga.create({ nazwa: 'Wymiana wahacza', koszt: 150 });
    const czesc1 = await Czesc.create({ nazwa: 'Wahacz przedni prawy', koszt: 300 });

    // Wizyta
    const wizyta1 = await Wizyta.create({
      pojazdId: auto1._id,
      klientId: mongoKlient1._id,
      status: 'w trakcie',
      data: new Date(),
      godzina: '10:00'
    });

    // Diagnoza
    await Diagnoza.create({
      wizytaId: wizyta1._id,
      mechanikId: mongoMech._id,
      opisDiagnozy: 'Uszkodzony sworzeń wahacza dolnego.',
      usterki: [usterka1._id],
      potrzebneUslugi: [usluga1._id],
      potrzebneCzesci: [czesc1._id]
    });

    // Powiadomienie
    await Powiadomienie.create({
      wizytaId: wizyta1._id,
      nowyStatusWizyty: 'w trakcie'
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
