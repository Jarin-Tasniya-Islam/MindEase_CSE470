// server/controllers/analyticsController.js
const mongoose = require('mongoose');
const MoodEntry = require('../models/MoodEntry');
const JournalEntry = require('../models/JournalEntry');
const SelfCareTask = require('../models/SelfCareTask');
const Appointment = require('../models/Appointment');

const TIMEZONE = process.env.APP_TZ || 'UTC';
const toObjId = (id) => { try { return new mongoose.Types.ObjectId(id); } catch { return null; } };

function userFilter(userId) {
  const oid = toObjId(userId);
  return oid
    ? { $or: [{ user: oid }, { userId }] }
    : { $or: [{ userId }] };
}

function inclusiveTo(dateStr) {
  // make the "to" bound inclusive (next day 00:00)
  const d = new Date(`${dateStr}T00:00:00`);
  return new Date(d.getTime() + 24 * 60 * 60 * 1000);
}

function dayKey(d) { return d.toISOString().slice(0, 10); }

/**
 * GET /api/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns: { heatmap: [{date, counts:{moods,journals,selfCare,appointments}, value}], trend: [{date, avgMood}] }
 */
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const from = req.query.from
      ? new Date(`${req.query.from}T00:00:00`)
      : new Date(new Date().getFullYear(), 0, 1);
    const to = req.query.to ? inclusiveTo(req.query.to) : new Date();

    const userF = userFilter(userId);

    // --- Moods (per-day count + avg) ---
    const moodsAgg = await MoodEntry.aggregate([
      { $match: userF },
      { $addFields: { ts: { $ifNull: ['$dateTime', '$createdAt'] },
                      moodVal: { $ifNull: ['$moodLevel', '$mood'] } } },
      { $match: { ts: { $gte: from, $lt: to } } },
      { $addFields: { day: { $dateTrunc: { date: '$ts', unit: 'day', timezone: TIMEZONE } } } },
      { $group: { _id: '$day', moods: { $sum: 1 }, avgMood: { $avg: '$moodVal' } } },
      { $sort: { _id: 1 } }
    ]);

    // --- Journals (per-day count) ---
    const journalsAgg = await JournalEntry.aggregate([
      { $match: userF },
      { $addFields: { ts: { $ifNull: ['$createdAt', '$date'] } } },
      { $match: { ts: { $gte: from, $lt: to } } },
      { $addFields: { day: { $dateTrunc: { date: '$ts', unit: 'day', timezone: TIMEZONE } } } },
      { $group: { _id: '$day', journals: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // --- Self-care (per-day count) ---
    const selfCareAgg = await SelfCareTask.aggregate([
      { $match: userF },
      { $addFields: { ts: { $ifNull: ['$date', '$createdAt'] } } }, // be tolerant
      { $match: { ts: { $gte: from, $lt: to } } },
      { $addFields: { day: { $dateTrunc: { date: '$ts', unit: 'day', timezone: TIMEZONE } } } },
      { $group: { _id: '$day', selfCare: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // --- Appointments (per-day count) ---
    const apptAgg = await Appointment.aggregate([
      { $match: userF },
      { $addFields: { ts: { $ifNull: ['$when', '$date'] } } },       // support both 'when' and 'date'
      { $match: { ts: { $gte: from, $lt: to } } },
      { $addFields: { day: { $dateTrunc: { date: '$ts', unit: 'day', timezone: TIMEZONE } } } },
      { $group: { _id: '$day', appointments: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Merge into one map keyed by day
    const byDay = new Map();
    const touch = (d) => {
      const k = dayKey(d);
      if (!byDay.has(k)) byDay.set(k, { date: k, counts: { moods: 0, journals: 0, selfCare: 0, appointments: 0 }, avgMood: null });
      return byDay.get(k);
    };

    moodsAgg.forEach(g => { const r = touch(g._id); r.counts.moods = g.moods; r.avgMood = g.avgMood ?? null; });
    journalsAgg.forEach(g => { touch(g._id).counts.journals = g.journals; });
    selfCareAgg.forEach(g => { touch(g._id).counts.selfCare  = g.selfCare; });
    apptAgg.forEach(g   => { touch(g._id).counts.appointments = g.appointments; });

    const heatmap = [...byDay.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => ({ date: r.date, counts: r.counts, value: r.counts.moods + r.counts.journals + r.counts.selfCare + r.counts.appointments }));

    const trend = [...byDay.values()]
      .filter(r => r.avgMood != null)
      .map(r => ({ date: r.date, avgMood: Number(r.avgMood.toFixed(2)) }));

    res.json({ heatmap, trend });
  } catch (err) {
    res.status(500).json({ message: 'Failed to build summary', error: err.message });
  }
};

/**
 * GET /api/analytics/day?date=YYYY-MM-DD
 * Returns arrays + a small summary for the header.
 */
exports.getDayDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const from = new Date(`${dateStr}T00:00:00`);
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    const userF = userFilter(userId);

    const moods = await MoodEntry.find({
      $and: [
        userF,
        { $or: [{ dateTime: { $gte: from, $lt: to } }, { createdAt: { $gte: from, $lt: to } }] }
      ]
    }).sort({ dateTime: -1, createdAt: -1 }).lean();

    const journals = await JournalEntry.find({
      $and: [
        userF,
        { $or: [{ createdAt: { $gte: from, $lt: to } }, { date: { $gte: from, $lt: to } }] }
      ]
    }).sort({ createdAt: -1 }).lean();

    const selfCare = await SelfCareTask.find({
      $and: [ userF, { $or: [{ date: { $gte: from, $lt: to } }, { createdAt: { $gte: from, $lt: to } }] } ]
    }).sort({ date: 1, createdAt: 1 }).lean();

    const appointments = await Appointment.find({
      $and: [ userF, { $or: [{ when: { $gte: from, $lt: to } }, { date: { $gte: from, $lt: to } }] } ]
    }).sort({ when: 1, date: 1 }).lean();

    // small summary for the formatter header
    const avgMood = moods.length
      ? moods.reduce((s, m) => s + Number(m.moodLevel ?? m.mood ?? 0), 0) / moods.length
      : null;

    res.json({
      date: dateStr,
      summary: {
        moodCount: moods.length,
        journalCount: journals.length,
        selfCareCount: selfCare.length,
        avgMood: avgMood != null ? Number(avgMood.toFixed(2)) : null
      },
      moods,
      journals,
      selfCare,
      appointments
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch day details', error: err.message });
  }
};
