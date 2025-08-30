const JournalEntry = require('../models/JournalEntry');
const Notification = require('../models/Notification'); // ⬅️ needed to clear reminders
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

    const normalizedUserId = userIdFromToken || legacyUserId;

    const entry = await JournalEntry.create({
      user: normalizedUserId,              // your primary ref
      userId: legacyUserId || userIdFromToken, // keep legacy string if you still use it elsewhere
      content: req.body.content,
      entryType: req.body.entryType || '',
      font: req.body.font || 'Segoe UI',
      theme: req.body.theme || 'lightblue',
      language: req.body.language || 'en',
      date: req.body.date || new Date()
    });

    // 🧹 VANISH today’s journal REMINDER(s)
    // (relies on Notification model having fields: userId, type, isReminder)
    await Notification.deleteMany({
      userId: normalizedUserId,
      type: 'journal',
      isReminder: true
    });

    // ✅ Add completion notification (one-shot update)
    await createNotification(
      normalizedUserId,
      'journal',
      '✅ Journal completed! Great job!'
    );

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
