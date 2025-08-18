const JournalEntry = require('../models/JournalEntry');
const createNotification = require('../utils/createNotification');

// CREATE a journal entry
exports.createEntry = async (req, res) => {
  try {
    const entry = new JournalEntry(req.body);
    await entry.save();

    // Trigger notification
    await createNotification(req.body.userId, 'journal', '📝 Don’t forget to journal today!');

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
