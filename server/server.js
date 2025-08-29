const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const cron = require('node-cron');
const createNotification = require('./utils/createNotification');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use('/api/admin', adminRoutes);
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

app.use('/api/appointments', appointmentRoutes); // <-- required mount


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// 🔁 Daily Reminder System for missing mood, journal, self-care, and upcoming appointments
const User = require('./models/User');
const MoodEntry = require('./models/MoodEntry');
const JournalEntry = require('./models/JournalEntry');
const SelfCareTask = require('./models/SelfCareTask');
const Appointment = require('./models/Appointment');

// ⏰ Run every day at 10:00 AM
cron.schedule('0 10 * * *', async () => {
  console.log('⏰ Running daily reminders');

  const users = await User.find();
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  for (const user of users) {
    const uid = user._id;

    // Mood
    const mood = await MoodEntry.findOne({ user: uid, createdAt: { $gte: start, $lte: end } });
    if (!mood) {
      await createNotification(uid, 'mood', 'Don’t forget to track your mood today.');
    }

    // Journal
    const journal = await JournalEntry.findOne({ user: uid, createdAt: { $gte: start, $lte: end } });
    if (!journal) {
      await createNotification(uid, 'journal', 'Write in your journal today.');
    }

    // Appointments in next 24h
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcoming = await Appointment.find({
      user: uid,
      date: { $gte: now, $lt: in24h },
      status: { $in: ['pending', 'confirmed'] }
    });
    if (upcoming.length > 0) {
      await createNotification(uid, 'appointment', 'You have an appointment within the next 24 hours.');
    }
  }
});