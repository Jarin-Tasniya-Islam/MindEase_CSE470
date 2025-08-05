const MoodEntry = require('../models/MoodEntry');

// ✅ CREATE mood entry
exports.createMoodEntry = async (req, res) => {
  try {
    const mood = new MoodEntry(req.body);
    await mood.save();
    res.status(201).json({ message: "Mood saved", mood });
  } catch (err) {
    res.status(500).json({ message: "Error saving mood", error: err.message });
  }
};

// ✅ GET all mood entries for a specific user
exports.getMoodEntries = async (req, res) => {
  try {
    const moods = await MoodEntry.find({ userId: req.params.userId }).sort({ dateTime: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: "Error fetching moods", error: err.message });
  }
};
