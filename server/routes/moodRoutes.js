const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const moodController = require('../controllers/moodController');

// Use the available create handler:
// prefer `create`, else `createMoodEntry`, else `saveMood`
const createHandler =
  moodController.create ||
  moodController.createMoodEntry ||
  moodController.saveMood;

router.post('/', auth, createHandler); // POST /api/moods

// (optional) list moods
// router.get('/:userId?', auth, moodController.getMoodEntries);

module.exports = router;
