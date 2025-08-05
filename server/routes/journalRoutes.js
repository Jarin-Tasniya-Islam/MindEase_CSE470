const express = require('express');
const router = express.Router();
const { createEntry, getEntries } = require('../controllers/journalController');

// Route to create a new journal entry
router.post('/', createEntry);           // POST http://localhost:5050/api/journal

// Route to get all journal entries by user ID
router.get('/:userId', getEntries);      // GET http://localhost:5050/api/journal/:userId

module.exports = router;
