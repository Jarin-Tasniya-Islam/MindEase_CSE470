const express = require('express');
const router = express.Router();
const { createMoodEntry, getMoodEntries } = require('../controllers/moodController');

router.post('/', createMoodEntry);          // POST /api/mood
router.get('/:userId', getMoodEntries);     // GET /api/mood/:userId

module.exports = router;
