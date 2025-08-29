const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    // NEW: canonical user ref for population
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Back-compat: keep legacy userId (string) if you already stored it before
    userId: { type: String },

    content: { type: String, required: true },
    entryType: { type: String, default: '' },
    font: { type: String, default: 'Segoe UI' },
    theme: { type: String, default: 'lightblue' },
    language: { type: String, default: 'en' },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
