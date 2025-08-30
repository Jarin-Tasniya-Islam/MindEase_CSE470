const cron = require('node-cron');
const { DateTime } = require('luxon');
const Notification = require('../models/Notification');
const createNotification = require('../utils/createNotification');

const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const MoodEntry = require('../models/MoodEntry');
const SelfCareTask = require('../models/SelfCareTask');
const Appointment = require('../models/Appointment');

// get today's start/end in Asia/Dhaka
function todayBoundsDhaka() {
  const nowDhaka = DateTime.now().setZone('Asia/Dhaka');
  return {
    startUTC: new Date(nowDhaka.startOf('day').toUTC().toISO()),
    endUTC: new Date(nowDhaka.endOf('day').toUTC().toISO())
  };
}

async function runDailyReminderJob() {
  const { startUTC, endUTC } = todayBoundsDhaka();
  const users = await User.find({}).select('_id');

  for (const u of users) {
    const userId = u._id;

    // Journal
    const hasJournal = await JournalEntry.exists({ userId, createdAt: { $gte: startUTC, $lte: endUTC } });
    if (!hasJournal) {
      await createNotification(userId, 'journal', '📝 Don’t forget to journal today!', { isReminder: true });
    }

    // Mood
    const hasMood = await MoodEntry.exists({ userId, createdAt: { $gte: startUTC, $lte: endUTC } });
    if (!hasMood) {
      await createNotification(userId, 'mood', '🌈 Log your mood for today.', { isReminder: true });
    }

    // Self-care
    const hasSelfCare = await SelfCareTask.exists({ userId, createdAt: { $gte: startUTC, $lte: endUTC } });
    if (!hasSelfCare) {
      await createNotification(userId, 'selfcare', '🧘 Take a self-care break today.', { isReminder: true });
    }

    // Appointments
    const hasAppt = await Appointment.exists({ userId, startTime: { $gte: startUTC, $lte: endUTC } });
    if (hasAppt) {
      await createNotification(userId, 'appointment', '📅 You have an appointment today.', { isReminder: true });
    }
  }

  console.log('[dailyReminders] ran at', new Date().toISOString());
}

// Run every day at 6:00 AM Asia/Dhaka
function startDailyReminders() {
  cron.schedule('0 6 * * *', runDailyReminderJob, { timezone: 'Asia/Dhaka' });
  console.log('✅ Daily reminders scheduled for 6:00 AM Asia/Dhaka');
}

module.exports = { startDailyReminders };
