// server/controllers/analyticsController.js (replace getSummary only)
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
        ? { $or: [{ user: oid }, { userId: userId }] }  // supports new ref + legacy string
        : { $or: [{ userId: userId }] };
}

/**
 * GET /api/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Response:
 *   { heatmap: [{date, count}], trend: [{date, avgMood}] }
 * Notes:
 *   - heatmap = total # of activities per day across:
 *       MoodEntry (dateTime/createdAt), JournalEntry (createdAt/date),
 *       SelfCareTask (date), Appointment (date)
 *   - trend = average mood per day (from MoodEntry only)
 */
exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const from = req.query.from
            ? new Date(`${req.query.from}T00:00:00`)
            : new Date(new Date().getFullYear(), 0, 1);
        const to = req.query.to
            ? new Date(`${req.query.to}T00:00:00`)
            : new Date();

        // ------- A) Combined HEATMAP (union of 4 sources) -------
        // Build per-source pipelines that normalize to { ts }
        const moodColl = MoodEntry.collection.name;             // e.g., 'moodentries'
        const journalColl = JournalEntry.collection.name;       // e.g., 'journalentries'
        const selfCareColl = SelfCareTask.collection.name;      // e.g., 'selfcaretasks'
        const apptColl = Appointment.collection.name;           // e.g., 'appointments'

        const moodStage = [
            { $match: userFilter(userId) },
            { $addFields: { ts: { $ifNull: ['$dateTime', '$createdAt'] } } },
            { $match: { ts: { $gte: from, $lt: to } } },
            { $project: { ts: 1 } }
        ];

        const journalStage = [
            { $match: userFilter(userId) },
            { $addFields: { ts: { $ifNull: ['$createdAt', '$date'] } } },
            { $match: { ts: { $gte: from, $lt: to } } },
            { $project: { ts: 1 } }
        ];

        const selfCareStage = [
            { $match: userFilter(userId) },
            { $addFields: { ts: '$date' } },
            { $match: { ts: { $gte: from, $lt: to } } },
            { $project: { ts: 1 } }
        ];

        const apptStage = [
            { $match: userFilter(userId) },
            { $addFields: { ts: '$date' } },
            { $match: { ts: { $gte: from, $lt: to } } },
            { $project: { ts: 1 } }
        ];

        // Start from moods, union others, group per day
        const unionPipeline = [
            ...moodStage,
            { $unionWith: { coll: journalColl, pipeline: journalStage } },
            { $unionWith: { coll: selfCareColl, pipeline: selfCareStage } },
            { $unionWith: { coll: apptColl, pipeline: apptStage } },
            { $addFields: { day: { $dateTrunc: { date: '$ts', unit: 'day', timezone: TIMEZONE } } } },
            { $group: { _id: '$day', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ];

        const heatAgg = await MoodEntry.aggregate(unionPipeline);
        const heatmap = heatAgg.map(g => ({ date: g._id.toISOString().slice(0, 10), count: g.count }));

        // ------- B) Average mood TREND (moods only) -------
        const trendPipeline = [
            { $match: userFilter(userId) },
            { $addFields: { ts: { $ifNull: ['$dateTime', '$createdAt'] }, moodVal: { $ifNull: ['$moodLevel', '$mood'] } } },
            { $match: { ts: { $gte: from, $lt: to } } },
            { $addFields: { day: { $dateTrunc: { date: '$ts', unit: 'day', timezone: TIMEZONE } } } },
            { $group: { _id: '$day', avgMood: { $avg: '$moodVal' } } },
            { $sort: { _id: 1 } }
        ];

        const trendAgg = await MoodEntry.aggregate(trendPipeline);
        const trend = trendAgg.map(g => ({
            date: g._id.toISOString().slice(0, 10),
            avgMood: Number((g.avgMood ?? 0).toFixed(2))
        }));

        res.json({ heatmap, trend });
    } catch (err) {
        res.status(500).json({ message: 'Failed to build summary', error: err.message });
    }
};

// GET /api/analytics/day?date=YYYY-MM-DD
exports.getDayDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
        const from = new Date(`${dateStr}T00:00:00`);
        const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);

        // Build common user filter
        const userF = userFilter(userId);

        // Moods: check dateTime or createdAt
        const moods = await MoodEntry.find({
            $and: [
                userF,
                { $or: [{ dateTime: { $gte: from, $lt: to } }, { createdAt: { $gte: from, $lt: to } }] }
            ]
        }).sort({ dateTime: -1 }).lean();

        // Journals: createdAt or date
        const journals = await JournalEntry.find({
            $and: [
                userF,
                { $or: [{ createdAt: { $gte: from, $lt: to } }, { date: { $gte: from, $lt: to } }] }
            ]
        }).sort({ createdAt: -1 }).lean();

        // Self-care tasks: date
        const selfCare = await SelfCareTask.find({
            $and: [userF, { date: { $gte: from, $lt: to } }]
        }).sort({ date: 1 }).lean();

        // Appointments: date
        const appointments = await Appointment.find({
            $and: [userF, { date: { $gte: from, $lt: to } }]
        }).sort({ date: 1 }).lean();

        res.json({ date: dateStr, moods, journals, selfCare, appointments });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch day details', error: err.message });
    }
};
