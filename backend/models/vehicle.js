const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  brand: { type: String, required: true, trim: true, maxlength: 50 },
  model: { type: String, required: true, trim: true, maxlength: 50 },
  year: { type: Number, min: 1900, max: new Date().getFullYear() + 1 },
  registration: { type: String, required: true, unique: true, trim: true, uppercase: true, match: /^[A-Z0-9 \-]{3,12}$/ },
  VIN: { type: String, required: true, unique: true, trim: true, uppercase: true, match: /^[A-Z0-9]{17}$/ }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
