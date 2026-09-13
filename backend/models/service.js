const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  price: { type: Number, required: true, min: 0, max: 1000000 }
});

module.exports = mongoose.model('Service', ServiceSchema);
