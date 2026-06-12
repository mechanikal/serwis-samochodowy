const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  status: { type: String, default: 'awaiting' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: String
});

module.exports = mongoose.model('Visit', VisitSchema);
