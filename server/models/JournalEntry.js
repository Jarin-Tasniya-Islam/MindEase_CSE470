const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  title: { type: String }, // e.g. reflection, gratitude, venting
  content: { type: String, required: true }, // freeform text
  // tags: [String] // removed tags field
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
