const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: Number,
  registration: { type: String, unique: true },
  VIN: { type: String, unique: true }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
