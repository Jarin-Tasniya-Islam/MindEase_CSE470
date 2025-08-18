// server/routes/sosRoutes.js
const express = require('express');
const router = express.Router();

// ✅ Ensure this path matches the actual filename exactly
const auth = require('../middleware/auth');
const {
  getMyPlan,
  upsertMyPlan,
  deleteMyPlan
} = require('../controllers/sosController'); // match case exactly

// Routes for SOS Plan
router.get('/my', auth, getMyPlan);
router.put('/', auth, upsertMyPlan);
router.delete('/', auth, deleteMyPlan);

module.exports = router;
