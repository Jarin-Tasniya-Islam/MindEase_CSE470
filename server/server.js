// server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const cron = require('node-cron');
const { DateTime } = require('luxon');
const createNotification = require('./utils/createNotification');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/moods', require('./routes/moodRoutes'));
app.use('/api/journal', require('./routes/journalRoutes'));
app.use('/api/selfcare', require('./routes/selfCareRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/support-persons', require('./routes/supportPersonRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ----------------- 🔔 Daily Reminder System -----------------
const User = require('./models/User');
const MoodEntry = require('./models/MoodEntry');
const JournalEntry = require('./models/JournalEntry');
const SelfCareTask = require('./models/SelfCareTask');
const Appointment = require('./models/Appointment');
const Notification = require('./models/Notification'); // used by hourly anti-spam

// Helper: get today’s start/end in Asia/Dhaka (converted to UTC for DB queries)
function todayBoundsDhaka() {
  const nowDhaka = DateTime.now().setZone('Asia/Dhaka');
  return {
    startUTC: new Date(nowDhaka.startOf('day').toUTC().toISO()),
    endUTC: new Date(nowDhaka.endOf('day').toUTC().toISO())
  };
}

// ⏰ Run every day at 6:00 AM (Asia/Dhaka): missing activities + same-day appts
cron.schedule('0 6 * * *', async () => {
  try {
    console.log('⏰ Running daily reminders (Asia/Dhaka)');
    const { startUTC, endUTC } = todayBoundsDhaka();
    const users = await User.find().select('_id');

    for (const user of users) {
      const uid = user._id;

      // Mood
      const mood = await MoodEntry.findOne({ user: uid, createdAt: { $gte: startUTC, $lte: endUTC } });
      if (!mood) {
        await createNotification(uid, 'mood', '🌈 Don’t forget to track your mood today.', { isReminder: true });
      }

      // Journal
      const journal = await JournalEntry.findOne({ user: uid, createdAt: { $gte: startUTC, $lte: endUTC } });
      if (!journal) {
        await createNotification(uid, 'journal', '📝 Write in your journal today.', { isReminder: true });
      }

      // Self-care
      const selfcare = await SelfCareTask.findOne({ user: uid, createdAt: { $gte: startUTC, $lte: endUTC } });
      if (!selfcare) {
        await createNotification(uid, 'selfcare', '🧘 Do one self-care activity today.', { isReminder: true });
      }

      // Appointments for today (support both startTime and date fields)
      const apptToday = await Appointment.find({
        user: uid,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          { startTime: { $gte: startUTC, $lte: endUTC } },
          { date:      { $gte: startUTC, $lte: endUTC } }
        ]
      });

      if (apptToday.length > 0) {
        await createNotification(
          uid,
          'appointment',
          '📅 You have an appointment today.',
          { isReminder: true }
        );
      }
    }
  } catch (err) {
    console.error('Daily reminder job failed:', err.message);
  }
}, { timezone: 'Asia/Dhaka' });

// ───────────────────────────────────────────────────────────────
// ⏰ Rolling appointment reminder — every hour (Asia/Dhaka)
//     Notifies if user has an appointment within the next 24 hours.
//     Anti-spam: skip if a reminder was created in the last 12 hours.
// ───────────────────────────────────────────────────────────────
const toUTC = (dt) => new Date(dt.toUTC().toISO());

cron.schedule('0 * * * *', async () => {
  try {
    console.log('⏰ Hourly check: appointments within next 24 hours (Asia/Dhaka)');

    const nowDhaka = DateTime.now().setZone('Asia/Dhaka');
    const in24Dhaka = nowDhaka.plus({ hours: 24 });

    const nowUTC = toUTC(nowDhaka);
    const in24UTC = toUTC(in24Dhaka);

    const users = await User.find().select('_id');

    for (const u of users) {
      const uid = u._id;

      const hasUpcoming = await Appointment.exists({
        user: uid,
        startTime: { $gte: nowUTC, $lt: in24UTC },
        status: { $in: ['pending', 'confirmed'] }
      });

      if (!hasUpcoming) continue;

      // Don’t spam: if a reminder for 'appointment' exists in the last 12h, skip
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const hasRecentApptReminder = await Notification.exists({
        userId: uid,
        type: 'appointment',
        isReminder: true,
        createdAt: { $gte: twelveHoursAgo }
      });

      if (!hasRecentApptReminder) {
        await createNotification(
          uid,
          'appointment',
          '⏳ You have an appointment within the next 24 hours.',
          { isReminder: true }
        );
      }
    }
  } catch (err) {
    console.error('Hourly 24h appointment reminder failed:', err.message);
  }
}, { timezone: 'Asia/Dhaka' });
