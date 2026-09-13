const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic', required: true },
  diagnosisDescription: { type: String, trim: true, maxlength: 2000 },
  faults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fault' }],
  requiredServices: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    price: { type: Number, min: 0, max: 1000000 }
  }],
  requiredParts: [{
    partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
    price: { type: Number, min: 0, max: 1000000 }
  }],
  accepted: Boolean,
  totalPrice: { type: Number, min: 0 }
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
