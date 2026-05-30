const mongoose = require('mongoose');

const FaultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
});

module.exports = mongoose.model('Fault', FaultSchema);
