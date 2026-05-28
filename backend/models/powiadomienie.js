const mongoose = require('mongoose');

const PowiadomienieSchema = new mongoose.Schema({
  wizytaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wizyta', required: true },
  nowyStatusWizyty: String,
  statusPowiadomienia: { type: String, default: 'nieprzeczytane' },
  dataPowiadomienia: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Powiadomienie', PowiadomienieSchema);
