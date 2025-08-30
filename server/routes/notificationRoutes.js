const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/auth');

// 🟢 List all (newest first)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// 🔢 Unseen count (for red badge)
router.get('/unseen-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, seen: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unseen count' });
  }
});

// ✅ Mark all as seen (when bell opens)
router.post('/mark-seen', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, seen: false }, { seen: true });
    res.json({ message: 'Notifications marked as seen' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// ❌ Dismiss one item (optional per-item close)
router.post('/:id/dismiss', authenticateToken, async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
});

// 🧹 Clear a reminder type (used by completion hooks)
router.post('/clear-type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body; // 'journal' | 'mood' | 'selfcare'
    await Notification.deleteMany({ userId: req.user.id, type, isReminder: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear reminder type' });
  }
});

module.exports = router;
