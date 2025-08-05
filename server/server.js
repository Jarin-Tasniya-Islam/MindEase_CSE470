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
app.use('/api/selfcare', require('./routes/selfCareRoutes')); // ✅ Self-Care Flow route

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
