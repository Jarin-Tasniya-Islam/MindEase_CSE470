const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supportPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportPerson', required: true },

    // keep snapshot so labels stay stable
    providerName: { type: String, required: true },
    providerType: { type: String, required: true },

    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'declined', 'cancelled'], default: 'pending' },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
