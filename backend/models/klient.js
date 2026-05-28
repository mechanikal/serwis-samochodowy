const mongoose = require('mongoose');

const KlientSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, // ID z MySQL
  imie: { type: String, required: true },
  nazwisko: { type: String, required: true }
});

module.exports = mongoose.model('Klient', KlientSchema);
