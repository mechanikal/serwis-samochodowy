const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic', required: true },
  diagnosisDescription: String,
  faults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fault' }],
  requiredServices: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    price: Number
  }],
  requiredParts: [{
    partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
    price: Number
  }],
  accepted: Boolean,
  totalPrice: Number
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
