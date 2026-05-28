const mongoose = require('mongoose');

const DiagnozaSchema = new mongoose.Schema({
  wizytaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wizyta', required: true },
  mechanikId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanik', required: true },
  opisDiagnozy: String,
  usterki: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usterka' }],
  potrzebneUslugi: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usluga' }],
  potrzebneCzesci: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Czesc' }]
});

module.exports = mongoose.model('Diagnoza', DiagnozaSchema);
