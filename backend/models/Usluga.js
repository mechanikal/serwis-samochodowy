const mongoose = require('mongoose');

const UslugaSchema = new mongoose.Schema({
  nazwa: { type: String, required: true },
  koszt: { type: Number, required: true }
});

module.exports = mongoose.model('Usluga', UslugaSchema);
