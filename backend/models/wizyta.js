const mongoose = require('mongoose');

const WizytaSchema = new mongoose.Schema({
  pojazdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pojazd', required: true },
  klientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Klient', required: true },
  status: { type: String, default: 'oczekująca' },
  data: { type: Date, required: true },
  godzina: { type: String, required: true }
});

module.exports = mongoose.model('Wizyta', WizytaSchema);
