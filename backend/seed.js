const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const connectMongo = require('./mongo');
const Client = require('./models/client');
const Mechanic = require('./models/mechanic');
const Vehicle = require('./models/vehicle');
const Fault = require('./models/fault');
const Service = require('./models/service');
const Part = require('./models/part');
const Visit = require('./models/visit');
const Diagnosis = require('./models/diagnosis');
const Notification = require('./models/notification');

async function clearDatabase() {
    await Promise.all([
        Client.deleteMany({}),
        Mechanic.deleteMany({}),
        Vehicle.deleteMany({}),
        Fault.deleteMany({}),
        Service.deleteMany({}),
        Part.deleteMany({}),
        Visit.deleteMany({}),
        Diagnosis.deleteMany({}),
        Notification.deleteMany({})
    ]);
}

async function seed() {
    let mysqlConn;
    try {
        await connectMongo();
        console.log('Połączono z MongoDB do seedowania');

        mysqlConn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'users_db',
            port: process.env.DB_PORT || 3306
        });
        console.log('Połączono z MySQL do seedowania');

        await clearDatabase();

        // Mock user creation
        const hashedPassword = await bcrypt.hash('password123', 10);

        const [mechRes] = await mysqlConn.execute(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['mechanik1', 'jan@serwis.pl', hashedPassword, 'Jan', 'Kowalski', '123456789', 'mechanic']
        );
        const mechId = mechRes.insertId;

        const [mockClient] = await mysqlConn.execute(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['klient1', 'adam@gmail.com', hashedPassword, 'Adam', 'Nowak', '987654321', 'user']
        );
        const mockClientId = mockClient.insertId;

        const mongoMech = await Mechanic.create({ userId: mechId, name: 'Jan', lastName: 'Kowalski' });
        const mongoClient = await Client.create({ userId: mockClientId, name: 'Adam', lastName: 'Nowak' });

        const auto1 = await Vehicle.create({
            clientId: mongoClient._id,
            brand: 'Audi',
            model: 'A4',
            year: 2015,
            registration: 'WA12345',
            VIN: 'WAUX1234567890'
        });

        const fault = await Fault.create({ name: 'Stukanie w zawieszeniu', description: 'Słychać stukanie przy przejeżdżaniu przez progi' });
        const service = await Service.create({ name: 'Wymiana wahacza', price: 150 });
        const part = await Part.create({ name: 'Wahacz przedni prawy', price: 300 });

        const visit = await Visit.create({
            vehicleId: auto1._id,
            clientId: mongoClient._id,
            title: 'naprawa wachacza',
            status: 'w trakcie',
            date: new Date(),
            time: '10:00',
            description: 'coś stuka jak jadę, proszę o diagnozę i naprawę'
        });

        await Diagnosis.create({
            visitId: visit._id,
            mechanicId: mongoMech._id,
            diagnosisDescription: 'Uszkodzony sworzeń wahacza dolnego.',
            faults: [fault._id],
            requiredServices: [service._id],
            requiredParts: [part._id],
            totalPrice: 450,
            accepted: false,
        });

        await Notification.create({
            visitId: visit._id,
            newVisitStatus: 'w trakcie'
        });

        console.log('Seedowanie zakończone sukcesem!');
    } catch (err) {
        console.error('Błąd podczas seedowania:', err);
    } finally {
        if (mysqlConn) mysqlConn.end();
        await mongoose.connection.close();
    }
}

seed();
