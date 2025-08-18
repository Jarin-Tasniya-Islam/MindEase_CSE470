// server/controllers/analyticsController.js
const mongoose = require('mongoose');
const MoodEntry = require('../models/MoodEntry');
const JournalEntry = require('../models/JournalEntry');
const SelfCareTask = require('../models/SelfCareTask');

// Use your local timezone for day truncation (adjust if needed)
const TIMEZONE = process.env.APP_TZ || 'Asia/Dhaka';

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

function dayBounds(dateStr) {
  // dateStr: YYYY-MM-DD (local)
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/**
 * GET /api/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&tags=a,b,c
 * Returns:
 *  - heatmap: [{ date:'YYYY-MM-DD', count:Number }]
 *  - trend:   [{ date:'YYYY-MM-DD', avgMood:Number }]
 * Filters:
 *  - date range (required-ish)
 *  - optional mood tags (CSV) if your MoodEntry has tags: [String]
 */
exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { from, to, tags } = req.query;

    const fromDate = from ? new Date(`${from}T00:00:00`) :
      new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(`${to}T00:00:00`) : new Date();

    const tagsArray = typeof tags === 'string' && tags.trim()
      ? tags.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const match = {
      user: toObjectId(userId),
      // Your MoodEntry date field name (assumed "loggedAt")
      loggedAt: { $gte: fromDate, $lt: toDate }
    };
    if (tagsArray.length) {
      match.tags = { $in: tagsArray };
    }

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          day: { $dateTrunc: { date: '$loggedAt', unit: 'day', timezone: TIMEZONE } }
        }
      },
      {
        $group: {
          _id: '$day',
          count: { $sum: 1 },
          avgMood: { $avg: '$mood' } // assumes MoodEntry has numeric "mood"
        }
      },
      { $sort: { _id: 1 } }
    ];

    const grouped = await MoodEntry.aggregate(pipeline);

    const heatmap = grouped.map(g => ({
      date: g._id.toISOString().slice(0, 10),
      count: g.count
    }));

    const trend = grouped.map(g => ({
      date: g._id.toISOString().slice(0, 10),
      avgMood: Number((g.avgMood ?? 0).toFixed(2))
    }));

    res.json({ heatmap, trend });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/day?date=YYYY-MM-DD&tags=a,b,c
 * Returns:
 *  { date, summary:{moodCount, avgMood, journalCount, selfCareCount}, moods, journals, selfCare }
 * Notes:
 *  - Filters moods by tags if provided.
 *  - Assumes JournalEntry stores a normalized day field named "entryDate" (00:00:00 of that day).
 *  - SelfCareTask completion time field assumed "completedAt".
 */
exports.getDayDetails = async (req, res, next) => {
  try {
    const { date, tags } = req.query;
    if (!date) return res.status(400).json({ message: 'date (YYYY-MM-DD) is required' });

    const userId = req.user.id;
    const { start, end } = dayBounds(date);

    const tagsArray = typeof tags === 'string' && tags.trim()
      ? tags.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const moodQuery = { user: userId, loggedAt: { $gte: start, $lt: end } };
    if (tagsArray.length) moodQuery.tags = { $in: tagsArray };

    const journalQuery = { user: userId, entryDate: { $gte: start, $lt: end } };

    const selfCareQuery = { user: userId, completedAt: { $gte: start, $lt: end } };

    const [moods, journals, selfCare] = await Promise.all([
      MoodEntry.find(moodQuery).sort({ loggedAt: 1 }).lean(),
      JournalEntry.find(journalQuery).sort({ createdAt: 1 }).lean(),
      SelfCareTask.find(selfCareQuery).sort({ completedAt: 1 }).lean()
    ]);

    const summary = {
      moodCount: moods.length,
      avgMood: moods.length ? (moods.reduce((a, b) => a + (b.mood || 0), 0) / moods.length).toFixed(2) : null,
      journalCount: journals.length,
      selfCareCount: selfCare.length
    };

    res.json({ date, summary, moods, journals, selfCare });
  } catch (err) {
    next(err);
  }
};
