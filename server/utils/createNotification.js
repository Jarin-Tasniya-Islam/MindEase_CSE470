const Notification = require('../models/Notification');

const createNotification = async (userId, type, message) => {
  try {
    await Notification.create({ userId, type, message });
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

module.exports = createNotification;
