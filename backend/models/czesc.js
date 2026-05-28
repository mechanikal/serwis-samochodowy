const mongoose = require('mongoose');

const CzescSchema = new mongoose.Schema({
  nazwa: { type: String, required: true },
  opis: String,
  koszt: { type: Number, required: true }
});

module.exports = mongoose.model('Czesc', CzescSchema);
