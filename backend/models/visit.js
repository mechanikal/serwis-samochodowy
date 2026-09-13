const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  title: { type: String, trim: true, maxlength: 80 },
  status: { type: String, default: 'nadchodzące', enum: ['nadchodzące', 'oczekiwanie na kosztorys', 'oczekiwanie na zatwierdzenie kosztorysu', 'w trakcie naprawy', 'zakończone', 'anulowane'] },
  date: { type: Date, required: true },
  time: { type: String, required: true, match: /^((0?[0-5][0-9]|[0-9]):([0-5][0-9]))$/ },
  description: { type: String, trim: true, maxlength: 2000 }
});

module.exports = mongoose.model('Visit', VisitSchema);
