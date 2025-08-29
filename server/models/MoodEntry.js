const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema(
  {
    // NEW: canonical user ref for population
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Back-compat: keep legacy userId (string)
    userId: { type: String },

    moodLevel: { type: Number, required: true },
    emoji: { type: String, default: '' },
    moodDescription: { type: String, default: '' },
    moodDuration: { type: String, default: '' },
    thoughtPatterns: { type: String, default: '' },
    stressLevel: { type: String, default: '' },
    energyLevel: { type: String, default: '' },
    activity: { type: String, default: '' },
    location: { type: String, default: '' },
    socialInteraction: { type: String, default: '' },
    timeOfDay: { type: String, default: '' },
    notes: { type: String, default: '' },
    dateTime: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
