const mongoose = require('mongoose');

const FaultSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 }
});

module.exports = mongoose.model('Fault', FaultSchema);
