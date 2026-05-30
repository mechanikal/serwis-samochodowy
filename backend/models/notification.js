const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  newVisitStatus: String,
  status: { type: String, default: 'unread' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
