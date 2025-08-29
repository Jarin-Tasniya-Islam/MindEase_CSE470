const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/adminMiddleware');
const ctrl = require('../controllers/appointmentController');

// ----- user flows -----
router.post('/book', auth, ctrl.book);            // POST /api/appointments/book
router.get('/my', auth, ctrl.mine);               // GET  /api/appointments/my
router.put('/:id/cancel', auth, ctrl.cancel);     // PUT  /api/appointments/:id/cancel

// ----- provider/admin (optional) -----
router.get('/support', auth, ctrl.forSupportPerson);
router.put('/:id/respond', auth, ctrl.respond);

// ----- admin-only -----
router.get('/admin/all', auth, isAdmin, ctrl.listAll);            // GET  /api/appointments/admin/all
router.put('/admin/:id/status', auth, isAdmin, ctrl.setStatus);   // PUT  /api/appointments/admin/:id/status

module.exports = router;
