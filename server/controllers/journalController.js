const JournalEntry = require('../models/JournalEntry');

// CREATE a journal entry
exports.createEntry = async (req, res) => {
  try {
    const entry = new JournalEntry(req.body);
    await entry.save();
    res.status(201).json({ message: 'Journal saved', entry });
  } catch (err) {
    res.status(500).json({ message: 'Error saving journal', error: err.message });
  }
};

// GET all entries for a user
exports.getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching journals', error: err.message });
  }
};
