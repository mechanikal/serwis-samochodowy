const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, // ID z MySQL
  name: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 }
});

module.exports = mongoose.model('Client', ClientSchema);
