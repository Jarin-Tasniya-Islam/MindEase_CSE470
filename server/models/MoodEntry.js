const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateTime: { type: Date, default: Date.now },

  // 🌈 Emotional Parameters
  moodLevel: { type: Number, required: true },         // Mood Rating (1–5 or 1–10)
  emoji: { type: String, required: true },             // Emoji face
  moodDescription: { type: String },                   // Text description (e.g., anxious)
  // moodType: { type: String },                          // Removed moodType
  moodDuration: { type: String },                      // Duration (brief, lingering)

  // 🧠 Cognitive & Mental State
  thoughtPatterns: { type: String },                   // e.g., negative self-talk, focus
  stressLevel: { type: String },                       // Low / Medium / High
  energyLevel: { type: String },                       // Physical/Mental energy (1–10)

  // 🛠️ Contextual Parameters
  activity: { type: String },                          // What user was doing (e.g., resting)
  location: { type: String },                          // e.g., home, work
  socialInteraction: { type: String },                 // Alone, with friends, etc.
  timeOfDay: { type: String },                         // Morning, evening, etc.

  // 🔖 Tags / Notes
  notes: { type: String }
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
