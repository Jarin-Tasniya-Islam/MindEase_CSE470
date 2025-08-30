const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // journal | mood | selfcare | appointment
  type: { type: String, enum: ['journal', 'mood', 'selfcare', 'appointment'], required: true },

  message: { type: String, required: true },

  // true = user opened the bell; not required for “vanish on completion”
  seen: { type: Boolean, default: false },

  // flag missing-item reminders so we can delete them once completed
  isReminder: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
