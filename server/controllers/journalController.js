const JournalEntry = require('../models/JournalEntry');
const createNotification = require('../utils/createNotification');

// CREATE a journal entry
exports.createEntry = async (req, res) => {
  try {
    // prefer token; fall back to body.userId for back-compat
    const userIdFromToken = req.user?.id;
    const legacyUserId = req.body.userId;

    if (!userIdFromToken && !legacyUserId) {
      return res.status(400).json({ message: 'Missing user identification' });
    }

    const entry = await JournalEntry.create({
      user: userIdFromToken || legacyUserId,   // works for ObjectId or string (string will fail if not ObjectId; so prefer token)
      userId: legacyUserId || userIdFromToken, // keep legacy string if you still use it elsewhere
      content: req.body.content,
      entryType: req.body.entryType || '',
      font: req.body.font || 'Segoe UI',
      theme: req.body.theme || 'lightblue',
      language: req.body.language || 'en',
      date: req.body.date || new Date()
    });

    // Trigger notification (use the normalized user id)
    await createNotification(entry.user, 'journal', '📝 Congratulations, You have completed todays journal');

    res.status(201).json({ message: 'Journal saved', entry });
  } catch (err) {
    res.status(500).json({ message: 'Error saving journal', error: err.message });
  }
};

// GET all entries for a user (by token if no param)
exports.getEntries = async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    const userId = userIdParam || req.user?.id;
    if (!userId) return res.status(400).json({ message: 'Missing user id' });

    const entries = await JournalEntry.find({
      $or: [{ user: userId }, { userId }]
    }).sort({ date: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching journals', error: err.message });
  }
};
