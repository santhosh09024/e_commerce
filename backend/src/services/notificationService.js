const Notification = require('../models/Notification');

const createNotification = async ({ userId, title, message, type = 'system', link = '' }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });
    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

module.exports = { createNotification };
