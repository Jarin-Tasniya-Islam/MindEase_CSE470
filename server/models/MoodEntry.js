// server/models/MoodEntry.js
const mongoose = require('mongoose');

const MoodEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // required fields
    moodLevel:      { type: Number, required: true, min: 1, max: 6 }, // from your emoji picker
    emoji:          { type: String, required: true },
    moodDescription:{ type: String, required: true },
    moodDuration:   { type: String, required: true },
    thoughtPatterns:{ type: String, required: true },
    stressLevel:    { type: String, required: true },                 // e.g., Low/Medium/High
    energyLevel:    { type: Number, required: true, min: 1, max: 10 },
    activity:       { type: String, required: true },
    location:       { type: String, required: true },
    socialInteraction: { type: String, required: true },
    timeOfDay:      { type: String, required: true },

    // optional
    notes:          { type: String, default: '' },

    // timestamp for when the mood was logged (frontend sends dateTime; we also default it)
    dateTime:       { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);
