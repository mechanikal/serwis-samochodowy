const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  price: { type: Number, required: true, min: 0, max: 1000000 }
});

module.exports = mongoose.model('Part', PartSchema);
