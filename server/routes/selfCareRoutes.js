const express = require('express');
const router = express.Router();
const { markTaskCompleted, getTodayTasks } = require('../controllers/selfCareController');

router.post('/complete', markTaskCompleted); // POST /api/selfcare/complete
router.get('/:userId', getTodayTasks);       // GET /api/selfcare/:userId

module.exports = router;
