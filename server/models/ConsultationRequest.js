const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  practiceName:    { type: String, required: true },
  contactName:     { type: String, required: true },
  email:           { type: String, required: true, lowercase: true },
  phone:           String,
  npi:             String,
  providerCount:   Number,
  currentSoftware: String,
  message:         String,
  status: { type: String, enum: ['new', 'contacted', 'converted', 'declined'], default: 'new' },
  adminNotes:      String,
}, { timestamps: true });

module.exports = mongoose.model('ConsultationRequest', schema);
