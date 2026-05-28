const mongoose = require('mongoose');

const MechanikSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, // ID z MySQL
  imie: { type: String, required: true },
  nazwisko: { type: String, required: true }
});

module.exports = mongoose.model('Mechanik', MechanikSchema);
