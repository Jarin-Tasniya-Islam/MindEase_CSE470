// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { getSummary, getDayDetails } = require('../controllers/analyticsController');

router.get('/summary', auth, getSummary);
router.get('/day', auth, getDayDetails);

module.exports = router;
