const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic', required: true },
  diagnosisDescription: String,
  faults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fault' }],
  requiredServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  requiredParts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Part' }]
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
