const mongoose = require('mongoose');

const PojazdSchema = new mongoose.Schema({
  klientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Klient', required: true },
  marka: { type: String, required: true },
  rok: Number,
  rejestracja: { type: String, unique: true },
  VIN: { type: String, unique: true }
});

module.exports = mongoose.model('Pojazd', PojazdSchema);
