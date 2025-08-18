const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/auth');

// 🟢 GET all notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ✅ Mark all notifications as seen
router.post('/mark-seen', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, seen: false }, { seen: true });
    res.json({ message: 'Notifications marked as seen' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

module.exports = router;
