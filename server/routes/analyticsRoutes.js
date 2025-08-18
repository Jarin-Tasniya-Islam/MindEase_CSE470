// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // your existing JWT middleware
const { getSummary, getDayDetails } = require('../controllers/analyticsController');

// /api/analytics/summary
router.get('/summary', auth, getSummary);

// /api/analytics/day
router.get('/day', auth, getDayDetails);

module.exports = router;
