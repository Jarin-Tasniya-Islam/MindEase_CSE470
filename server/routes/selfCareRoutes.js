const express = require('express');
const router = express.Router();
const { markTaskCompleted, getTodayTasks } = require('../controllers/selfCareController');
const authenticateToken = require('../middleware/auth');

// ✅ Log self-care task (secure)
router.post('/complete', authenticateToken, markTaskCompleted);

// ✅ Get today's self-care tasks for authenticated user
router.get('/today', authenticateToken, getTodayTasks);

module.exports = router;