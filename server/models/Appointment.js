const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supportPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportPerson', required: true },
  date: { type: Date, required: true },
  note: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'declined'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
