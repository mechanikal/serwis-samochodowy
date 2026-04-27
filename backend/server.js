const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = require('./db');

const app = express();

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