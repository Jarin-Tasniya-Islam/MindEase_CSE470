const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

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
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/mood', require('./routes/moodRoutes'));
app.use('/api/journal', require('./routes/journalRoutes'));
app.use('/api/selfcare', require('./routes/selfCareRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// 👥 Support Persons API
const supportPersonRoutes = require('./routes/supportPersonRoutes');
app.use('/api/support-persons', supportPersonRoutes);

// 🔔 Notifications API
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// 🗓️ Appointments API
const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// 🔁 Daily Reminder System for missing mood, journal, self-care, and upcoming appointments
const cron = require('node-cron');
const User = require('./models/User');
const MoodEntry = require('./models/MoodEntry');
const JournalEntry = require('./models/JournalEntry');
const SelfCareTask = require('./models/SelfCareTask');
const Appointment = require('./models/Appointment');
const createNotification = require('./utils/createNotification');

// ⏰ Run every day at 10:00 AM
cron.schedule('0 10 * * *', async () => {
  console.log('⏰ Running daily reminder check');

  const users = await User.find();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const user of users) {
    const uid = user._id;

    // Mood
    const moodToday = await MoodEntry.findOne({ user: uid, createdAt: { $gte: today } });
    if (!moodToday) {
      await createNotification(uid, 'mood', 'You haven’t tracked your mood today.');
    }

    // Journal
    const journalToday = await JournalEntry.findOne({ user: uid, createdAt: { $gte: today } });
    if (!journalToday) {
      await createNotification(uid, 'journal', 'Don’t forget to write in your journal today.');
    }

    // Self-care
    const selfCareToday = await SelfCareTask.findOne({ user: uid, createdAt: { $gte: today } });
    if (!selfCareToday) {
      await createNotification(uid, 'selfcare', 'Time for your self-care check-in.');
    }

    // 🗓️ Appointments today
    const appointmentsToday = await Appointment.find({
      user: uid,
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (appointmentsToday.length > 0) {
      await createNotification(uid, 'appointment', 'You have an appointment scheduled for today.');
    }
  }
});
