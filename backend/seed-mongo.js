const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const connectMongo = require('./mongo');
const Client       = require('./models/client');
const Mechanic     = require('./models/mechanic');
const Vehicle      = require('./models/vehicle');
const Fault        = require('./models/fault');
const Service      = require('./models/service');
const Part         = require('./models/part');
const Visit        = require('./models/visit');
const Diagnosis    = require('./models/diagnosis');
const Notification = require('./models/notification');

// ─────────────────────────────────────────────
//  Pomocniki
// ─────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

function daysAhead(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
}

// ─────────────────────────────────────────────
//  Dane słownikowe
// ─────────────────────────────────────────────
const FAULTS_DATA = [
    { name: 'Stukanie w zawieszeniu',      description: 'Słychać stukanie przy przejeżdżaniu przez progi i nierówności' },
    { name: 'Wyciek oleju silnikowego',    description: 'Na podłodze widoczne plamy oleju, poziom oleju spada' },
    { name: 'Zużyte klocki hamulcowe',     description: 'Piszczenie podczas hamowania, wydłużona droga hamowania' },
    { name: 'Uszkodzony alternator',       description: 'Kontrolka ładowania zapala się, słaby prąd w instalacji' },
    { name: 'Pęknięty pas rozrządu',       description: 'Głośna praca silnika, możliwe uszkodzenie zaworów' },
    { name: 'Nieszczelny układ chłodzenia', description: 'Temperatura silnika rośnie, ciecz chłodząca ucieka' },
    { name: 'Zużyte tarcze hamulcowe',     description: 'Wibracje przy hamowaniu, nieefektywne hamowanie' },
    { name: 'Uszkodzona przekładnia kierownicza', description: 'Luz na kierownicy, trudności ze skręcaniem' },
    { name: 'Rozładowany akumulator',      description: 'Problemy z rozruchem, słabe napięcie zasilania' },
    { name: 'Zużyte opony',                description: 'Nierówne zużycie, mała głębokość bieżnika' },
];

const SERVICES_DATA = [
    { name: 'Wymiana wahacza',               price: 150 },
    { name: 'Wymiana oleju i filtrów',        price: 120 },
    { name: 'Wymiana klocków hamulcowych',    price: 100 },
    { name: 'Naprawa alternatora',            price: 200 },
    { name: 'Wymiana paska rozrządu',         price: 350 },
    { name: 'Uszczelnienie układu chłodzenia', price: 180 },
    { name: 'Szlifowanie tarcz hamulcowych',  price: 140 },
    { name: 'Regulacja zbieżności',           price: 80  },
    { name: 'Wymiana akumulatora',            price: 60  },
    { name: 'Wymiana opon',                   price: 50  },
    { name: 'Diagnostyka komputerowa',        price: 90  },
    { name: 'Wymiana świec zapłonowych',      price: 70  },
];

const PARTS_DATA = [
    { name: 'Wahacz przedni prawy',          description: 'Oryginał OEM',              price: 300 },
    { name: 'Filtr oleju',                   description: 'Mahle OX 153D',              price: 25  },
    { name: 'Olej silnikowy 5W40 5L',        description: 'Castrol Edge',               price: 110 },
    { name: 'Klocki hamulcowe przód',        description: 'Brembo P06 020',             price: 180 },
    { name: 'Alternator',                    description: 'Valeo 437396',               price: 650 },
    { name: 'Pasek rozrządu',                description: 'Gates K025559XS',            price: 220 },
    { name: 'Uszczelka głowicy',             description: 'Elring 391.470',             price: 95  },
    { name: 'Tarcze hamulcowe tył',          description: 'ATE 24.0122-0119.1',         price: 260 },
    { name: 'Akumulator 74Ah',               description: 'Bosch S4 005',               price: 390 },
    { name: 'Opona 205/55 R16',              description: 'Michelin Primacy 4',         price: 340 },
    { name: 'Filtr powietrza',               description: 'Mann C 30 130',              price: 35  },
    { name: 'Świeca zapłonowa NGK',          description: 'NGK BKR6EK – komplet 4 szt', price: 60  },
    { name: 'Płyn chłodniczy 5L',            description: 'Havoline XLC – gotowy',      price: 55  },
    { name: 'Sworzeń wahacza',               description: 'Meyle 116 010 0008',         price: 70  },
];

const VISIT_STATUSES = ['oczekuje', 'w trakcie', 'zakończona', 'anulowana'];
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const VEHICLES_POOL = [
    { brand: 'Audi',       model: 'A4',         year: 2015 },
    { brand: 'BMW',        model: '3 Series',    year: 2017 },
    { brand: 'Volkswagen', model: 'Golf',        year: 2018 },
    { brand: 'Ford',       model: 'Focus',       year: 2014 },
    { brand: 'Toyota',     model: 'Corolla',     year: 2019 },
    { brand: 'Renault',    model: 'Megane',       year: 2016 },
    { brand: 'Skoda',      model: 'Octavia',     year: 2020 },
    { brand: 'Opel',       model: 'Astra',       year: 2013 },
    { brand: 'Honda',      model: 'Civic',       year: 2018 },
    { brand: 'Peugeot',    model: '308',         year: 2017 },
];

// Klienci MySQL (id=2..6) + dane do MongoDB
const MYSQL_CLIENTS = [
    { mysqlId: 2, name: 'Adam',   lastName: 'Nowak'      },
    { mysqlId: 3, name: 'Ewa',    lastName: 'Wiśniewska'  },
    { mysqlId: 4, name: 'Piotr',  lastName: 'Zając'       },
    { mysqlId: 5, name: 'Marta',  lastName: 'Kamińska'    },
    { mysqlId: 6, name: 'Tomasz', lastName: 'Wróbel'      },
];

// Liczba wizyt na klienta (min–max)
const VISITS_PER_CLIENT = [4, 6];

// ─────────────────────────────────────────────
//  Czyszczenie
// ─────────────────────────────────────────────
async function clearMongo() {
    await Promise.all([
        Client.deleteMany({}),
        Mechanic.deleteMany({}),
        Vehicle.deleteMany({}),
        Fault.deleteMany({}),
        Service.deleteMany({}),
        Part.deleteMany({}),
        Visit.deleteMany({}),
        Diagnosis.deleteMany({}),
        Notification.deleteMany({}),
    ]);
    console.log('✔  Wyczyszczono wszystkie kolekcje MongoDB');
}

// ─────────────────────────────────────────────
//  Główna funkcja seed
// ─────────────────────────────────────────────
async function seedMongo() {
    try {
        await connectMongo();
        console.log('✔  Połączono z MongoDB\n');

        await clearMongo();

        // === 1. Słowniki: usterki, usługi, części ===
        const faults   = await Fault.insertMany(FAULTS_DATA);
        const services = await Service.insertMany(SERVICES_DATA);
        const parts    = await Part.insertMany(PARTS_DATA);
        console.log(`✔  Usterki: ${faults.length}, Usługi: ${services.length}, Części: ${parts.length}`);

        // === 2. Mechanik (userId=1 z MySQL) ===
        const mechanic = await Mechanic.create({ userId: 1, name: 'Jan', lastName: 'Kowalski' });
        console.log('✔  Mechanik: Jan Kowalski (userId=1)\n');

        // === 3. Klienci + pojazdy + wizyty ===
        let regCounter = 1000;
        let vinCounter = 1000;

        for (const clientData of MYSQL_CLIENTS) {
            // Klient
            const client = await Client.create({
                userId:   clientData.mysqlId,
                name:     clientData.name,
                lastName: clientData.lastName,
            });
            console.log(`── Klient: ${clientData.name} ${clientData.lastName} (userId=${clientData.mysqlId})`);

            // Pojazdy (1–2 na klienta)
            const vehicleCount = rand(1, 2);
            const clientVehicles = [];
            for (let v = 0; v < vehicleCount; v++) {
                const vData = pick(VEHICLES_POOL);
                regCounter++;
                vinCounter++;
                const reg = `WA${regCounter}`;
                const vin = `VIN${String(vinCounter).padStart(14, '0')}`;
                const vehicle = await Vehicle.create({
                    clientId:     client._id,
                    brand:        vData.brand,
                    model:        vData.model,
                    year:         vData.year,
                    registration: reg,
                    VIN:          vin,
                });
                clientVehicles.push(vehicle);
                console.log(`   🚗 ${vData.brand} ${vData.model} (${vData.year}) – ${reg}`);
            }

            // Wizyty
            const visitCount = rand(...VISITS_PER_CLIENT);
            for (let i = 0; i < visitCount; i++) {
                const vehicle = pick(clientVehicles);

                // Przeszłe wizyty – różne statusy; ostatnia może być przyszła
                let visitDate;
                let status;
                if (i === visitCount - 1) {
                    // Ostatnia wizyta – oczekująca w przyszłości
                    visitDate = daysAhead(rand(3, 30));
                    status = 'oczekuje';
                } else {
                    visitDate = daysAgo(rand(10, 365));
                    status = pick(['zakończona', 'w trakcie', 'anulowana', 'zakończona', 'zakończona']);
                }

                const visitFault   = pick(faults);
                const visitService = pick(services);
                const visitPart    = pick(parts);

                const visit = await Visit.create({
                    vehicleId:   vehicle._id,
                    clientId:    client._id,
                    title:       `Wizyta – ${visitFault.name}`,
                    status:      status,
                    date:        visitDate,
                    time:        pick(TIMES),
                    description: `Klient zgłasza: ${visitFault.description}`,
                });

                // Diagnoza – tylko dla zakończonych / w trakcie
                if (status !== 'anulowana' && status !== 'oczekuje') {
                    const totalPrice = visitService.price + visitPart.price;
                    await Diagnosis.create({
                        visitId:             visit._id,
                        mechanicId:          mechanic._id,
                        diagnosisDescription:`Zdiagnozowano: ${visitFault.name}. ${visitFault.description}`,
                        faults:              [visitFault._id],
                        requiredServices:    [visitService._id],
                        requiredParts:       [visitPart._id],
                        totalPrice:          totalPrice,
                        accepted:            status === 'zakończona',
                    });
                }

                // Powiadomienie o każdej zmianie statusu
                await Notification.create({
                    visitId:        visit._id,
                    newVisitStatus: status,
                    status:         status === 'zakończona' ? 'read' : 'unread',
                    date:           visitDate,
                });

                // Dla zakończonych – powiadomienie o zakończeniu
                if (status === 'zakończona') {
                    await Notification.create({
                        visitId:        visit._id,
                        newVisitStatus: 'zakończona',
                        status:         'read',
                        date:           new Date(visitDate.getTime() + 3600 * 1000 * 2),
                    });
                }

                console.log(`   📅 Wizyta ${i + 1}/${visitCount}: ${visit.title} [${status}] – ${visitDate.toLocaleDateString('pl-PL')}`);
            }
            console.log();
        }

        // === 4. Zapełniony kalendarz – czerwiec 2026 ===
        console.log('📆 Generowanie wizyt na czerwiec 2026...');

        // Pobierz wszystkich klientów i ich pojazdy (już zapisane w Mongo)
        const allClients  = await Client.find({});
        const allVehicles = await Vehicle.find({});

        // Mapka clientId → pojazdy klienta
        const vehiclesByClient = {};
        for (const v of allVehicles) {
            const key = String(v.clientId);
            if (!vehiclesByClient[key]) vehiclesByClient[key] = [];
            vehiclesByClient[key].push(v);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let juneVisitCount = 0;
        // Przeiteruj po wszystkich dniach czerwca 2026
        for (let day = 1; day <= 30; day++) {
            const date = new Date(2026, 5, day); // miesiące 0-indeksowane, 5 = czerwiec
            const dow  = date.getDay();          // 0=niedziela, 6=sobota
            if (dow === 0 || dow === 6) continue; // pomijaj weekendy

            const visitsOnDay = rand(2, 4);
            const slotTimes   = [...TIMES].sort(() => Math.random() - 0.5).slice(0, visitsOnDay);

            for (let s = 0; s < visitsOnDay; s++) {
                const client  = pick(allClients);
                const cVehicles = vehiclesByClient[String(client._id)];
                if (!cVehicles || cVehicles.length === 0) continue;
                const vehicle = pick(cVehicles);

                // Status zależy od tego, czy data jest przeszła, dzisiejsza czy przyszła
                let status;
                if (date < today) {
                    status = pick(['zakończona', 'zakończona', 'w trakcie', 'anulowana']);
                } else if (date.getTime() === today.getTime()) {
                    status = pick(['w trakcie', 'oczekuje', 'w trakcie']);
                } else {
                    status = 'oczekuje';
                }

                const visitFault   = pick(faults);
                const visitService = pick(services);
                const visitPart    = pick(parts);

                const visit = await Visit.create({
                    vehicleId:   vehicle._id,
                    clientId:    client._id,
                    title:       `${visitFault.name}`,
                    status:      status,
                    date:        date,
                    time:        slotTimes[s],
                    description: `Klient zgłasza: ${visitFault.description}`,
                });

                if (status !== 'anulowana' && status !== 'oczekuje') {
                    await Diagnosis.create({
                        visitId:             visit._id,
                        mechanicId:          mechanic._id,
                        diagnosisDescription: `Zdiagnozowano: ${visitFault.name}. ${visitFault.description}`,
                        faults:              [visitFault._id],
                        requiredServices:    [visitService._id],
                        requiredParts:       [visitPart._id],
                        totalPrice:          visitService.price + visitPart.price,
                        accepted:            status === 'zakończona',
                    });
                }

                await Notification.create({
                    visitId:        visit._id,
                    newVisitStatus: status,
                    status:         status === 'zakończona' ? 'read' : 'unread',
                    date:           date,
                });

                juneVisitCount++;
            }
        }
        console.log(`✔  Dodano ${juneVisitCount} wizyt w czerwcu 2026\n`);

        // === Podsumowanie ===
        const counts = {
            clients:       await Client.countDocuments(),
            vehicles:      await Vehicle.countDocuments(),
            visits:        await Visit.countDocuments(),
            diagnoses:     await Diagnosis.countDocuments(),
            notifications: await Notification.countDocuments(),
            faults:        await Fault.countDocuments(),
            services:      await Service.countDocuments(),
            parts:         await Part.countDocuments(),
        };

        console.log('═'.repeat(50));
        console.log('🎉 Seedowanie MongoDB zakończone!');
        console.log('═'.repeat(50));
        Object.entries(counts).forEach(([k, v]) => console.log(`   ${k.padEnd(15)} : ${v}`));

    } catch (err) {
        console.error('❌ Błąd podczas seedowania MongoDB:', err);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

seedMongo();
