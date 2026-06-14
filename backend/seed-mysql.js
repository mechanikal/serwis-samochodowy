const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

/**
 * Seedowanie MySQL – konta użytkowników (mechanik + klienci).
 *
 * Konto mechanika:
 *   login: mechanik1 / hasło: password123
 *
 * Konta klientów (5 szt.):
 *   login: klient1..klient5 / hasło: password123
 *
 * UWAGA: skrypt usuwa i ponownie wstawia wszystkich użytkowników.
 *        Jeśli MySQL ma włączone FK – wyczyść najpierw MongoDB (seed-mongo.js --clear).
 */
async function seedMySQL() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'users_db',
            port: process.env.DB_PORT || 3306,
        });

        console.log('✔  Połączono z MySQL');

        // ------ czyszczenie ------
        await conn.execute('DELETE FROM users');
        await conn.execute('ALTER TABLE users AUTO_INCREMENT = 1');
        console.log('✔  Wyczyszczono tabelę users');

        const hash = await bcrypt.hash('password123', 10);

        // ------ mechanik (id = 1) ------
        await conn.execute(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['mechanik1', 'jan.kowalski@serwis.pl', hash, 'Jan', 'Kowalski', '100200300', 'mechanic']
        );
        console.log('✔  Dodano mechanika: mechanik1 (id=1)');

        // ------ klienci (id = 2..6) ------
        const clients = [
            ['klient1', 'adam.nowak@gmail.com',      hash, 'Adam',     'Nowak',      '601100200', 'user'],
            ['klient2', 'ewa.wisniewska@gmail.com',   hash, 'Ewa',      'Wiśniewska', '602100200', 'user'],
            ['klient3', 'piotr.zajac@gmail.com',      hash, 'Piotr',    'Zając',      '603100200', 'user'],
            ['klient4', 'marta.kaminska@gmail.com',   hash, 'Marta',    'Kamińska',   '604100200', 'user'],
            ['klient5', 'tomasz.wrobel@gmail.com',    hash, 'Tomasz',   'Wróbel',     '605100200', 'user'],
        ];

        for (const c of clients) {
            await conn.execute(
                'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
                c
            );
            console.log(`✔  Dodano klienta: ${c[0]}`);
        }

        console.log('\n🎉 Seedowanie MySQL zakończone!');
        console.log('   mechanik1  → id=1');
        clients.forEach((c, i) => console.log(`   ${c[0]}     → id=${i + 2}`));
    } catch (err) {
        console.error('❌ Błąd podczas seedowania MySQL:', err.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

seedMySQL();
