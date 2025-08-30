const MoodEntry = require('../models/MoodEntry');
const Notification = require('../models/Notification'); // ⬅️ needed to clear reminders
const createNotification = require('../utils/createNotification');

// ----- helpers -----
function collectMissing(body) {
  const {
    moodLevel,
    emoji,
    moodDescription,
    moodDuration,
    thoughtPatterns,
    stressLevel,
    energyLevel,
    activity,
    location,
    socialInteraction,
    timeOfDay,
  } = body;

  const missing = [];
  if (moodLevel === undefined || moodLevel === null || String(moodLevel).trim() === '') missing.push('moodLevel');
  if (!emoji) missing.push('emoji');
  if (!moodDescription?.trim()) missing.push('moodDescription');
  if (!moodDuration?.trim()) missing.push('moodDuration');
  if (!thoughtPatterns?.trim()) missing.push('thoughtPatterns');
  if (!stressLevel?.trim()) missing.push('stressLevel');
  if (energyLevel === undefined || energyLevel === null || String(energyLevel).trim() === '') missing.push('energyLevel');
  if (!activity?.trim()) missing.push('activity');
  if (!location?.trim()) missing.push('location');
  if (!socialInteraction?.trim()) missing.push('socialInteraction');
  if (!timeOfDay?.trim()) missing.push('timeOfDay');
  return missing;
}

async function createMoodDoc(req, res) {
  const userIdFromToken = req.user?.id || req.user?._id;
  const legacyUserId = req.body.userId;

  if (!userIdFromToken && !legacyUserId) {
    return res.status(400).json({ message: 'Missing user identification' });
  }

  // Validate required (all except notes)
  const missing = collectMissing(req.body);
  if (missing.length) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  const normalizedUserId = userIdFromToken || legacyUserId;

  const payload = {
    user: normalizedUserId,
    userId: legacyUserId || userIdFromToken, // keep for legacy queries
    moodLevel: Number(req.body.moodLevel),
    emoji: req.body.emoji,
    moodDescription: req.body.moodDescription.trim(),
    moodDuration: req.body.moodDuration.trim(),
    thoughtPatterns: req.body.thoughtPatterns.trim(),
    stressLevel: req.body.stressLevel.trim(),
    energyLevel: Number(req.body.energyLevel),
    activity: req.body.activity.trim(),
    location: req.body.location.trim(),
    socialInteraction: req.body.socialInteraction.trim(),
    timeOfDay: req.body.timeOfDay.trim(),
    notes: (req.body.notes || '').trim(), // optional
    dateTime: req.body.dateTime ? new Date(req.body.dateTime) : new Date(),
  };

  const mood = await MoodEntry.create(payload);

  // 🧹 VANISH today’s mood REMINDER(s)
  // (relies on Notification model having fields: userId, type, isReminder)
  try {
    await Notification.deleteMany({
      userId: normalizedUserId,
      type: 'mood',
      isReminder: true,
    });
  } catch (e) {
    console.warn('Failed clearing mood reminders:', e.message);
  }

  // ✅ Add completion notification (one-shot update)
  try {
    await createNotification(
      normalizedUserId,
      'mood',
      '✅ Mood logged. Keep it up!'
    );
  } catch (e) {
    console.warn('createNotification failed:', e.message);
  }

  return res.status(201).json({ message: 'Mood saved', mood });
}

// ----- controllers -----

// CREATE (primary)
exports.createMoodEntry = async (req, res) => {
  try {
    await createMoodDoc(req, res);
  } catch (err) {
    console.error('createMoodEntry error:', err);
    res.status(500).json({ message: 'Error saving mood', error: err.message });
  }
};

// Legacy alias (POST handler some routes might call)
exports.saveMood = async (req, res) => {
  try {
    await createMoodDoc(req, res);
  } catch (err) {
    console.error('saveMood error:', err);
    res.status(500).json({ error: 'Failed to save mood.', details: err.message });
  }
};

// GET moods for user (by param or token)
exports.getMoodEntries = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.user?._id;
    if (!userId) return res.status(400).json({ message: 'Missing user id' });

    const moods = await MoodEntry.find({
      $or: [{ user: userId }, { userId }],
    }).sort({ dateTime: -1 });

    res.json(moods);
  } catch (err) {
    console.error('getMoodEntries error:', err);
    res.status(500).json({ message: 'Error fetching moods', error: err.message });
  }
};
