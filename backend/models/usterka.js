const mongoose = require('mongoose');

const UsterkaSchema = new mongoose.Schema({
  nazwa: { type: String, required: true },
  opis: String
});

module.exports = mongoose.model('Usterka', UsterkaSchema);
