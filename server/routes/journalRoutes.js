const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createEntry, getEntries } = require('../controllers/journalController');

router.post('/', auth, createEntry);
// Explicit routes instead of optional param
router.get('/', auth, getEntries);
router.get('/:userId', auth, getEntries);

module.exports = router;
