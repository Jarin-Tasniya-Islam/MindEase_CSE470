const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createMoodEntry, getMoodEntries } = require('../controllers/moodController');

router.post('/', auth, createMoodEntry);
// Split optional param into two explicit routes to avoid path-to-regexp errors
router.get('/', auth, getMoodEntries);
router.get('/:userId', auth, getMoodEntries);

module.exports = router;
