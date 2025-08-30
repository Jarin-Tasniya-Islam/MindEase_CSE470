const Notification = require('../models/Notification');

async function createNotification(userId, type, message, opts = {}) {
  try {
    await Notification.create({
      userId,
      type,
      message,
      isReminder: !!opts.isReminder
    });
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
}

module.exports = createNotification;
