const MoodEntry = require('../models/MoodEntry');
const createNotification = require('../utils/createNotification');

// CREATE mood entry
exports.createMoodEntry = async (req, res) => {
  try {
    const userIdFromToken = req.user?.id;
    const legacyUserId = req.body.userId;
    if (!userIdFromToken && !legacyUserId) {
      return res.status(400).json({ message: 'Missing user identification' });
    }

    const mood = await MoodEntry.create({
      user: userIdFromToken || legacyUserId,
      userId: legacyUserId || userIdFromToken,
      moodLevel: req.body.moodLevel,
      emoji: req.body.emoji || '',
      moodDescription: req.body.moodDescription || '',
      moodDuration: req.body.moodDuration || '',
      thoughtPatterns: req.body.thoughtPatterns || '',
      stressLevel: req.body.stressLevel || '',
      energyLevel: req.body.energyLevel || '',
      activity: req.body.activity || '',
      location: req.body.location || '',
      socialInteraction: req.body.socialInteraction || '',
      timeOfDay: req.body.timeOfDay || '',
      notes: req.body.notes || '',
      dateTime: req.body.dateTime || new Date()
    });

    await createNotification(mood.user, 'mood', '😊 You have tracked your mood today');

    res.status(201).json({ message: 'Mood saved', mood });
  } catch (err) {
    res.status(500).json({ message: 'Error saving mood', error: err.message });
  }
};

// GET moods for user (by param or token)
exports.getMoodEntries = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    if (!userId) return res.status(400).json({ message: 'Missing user id' });

    const moods = await MoodEntry.find({
      $or: [{ user: userId }, { userId }]
    }).sort({ dateTime: -1 });

    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching moods', error: err.message });
  }
};
