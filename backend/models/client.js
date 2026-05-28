const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, // ID z MySQL
  name: { type: String, required: true },
  lastName: { type: String, required: true }
});

module.exports = mongoose.model('Client', ClientSchema);
