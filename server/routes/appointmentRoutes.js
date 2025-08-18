const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments } = require('../controllers/appointmentController');
const authenticateToken = require('../middleware/auth');

// POST /api/appointments → Book
router.post('/', authenticateToken, bookAppointment);

// GET /api/appointments/my → List my appointments
router.get('/my', authenticateToken, getMyAppointments);

module.exports = router;
