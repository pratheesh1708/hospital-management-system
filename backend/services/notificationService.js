const notificationModel = require('../models/notificationModel');

const notificationService = {
  async getUserNotifications(userId) {
    const list = await notificationModel.findByUserId(userId, 30);
    const unreadCount = await notificationModel.getUnreadCount(userId);
    return { notifications: list, unreadCount };
  },

  async markAsRead(notificationId, userId) {
    return notificationModel.markAsRead(notificationId, userId);
  },

  async markAllAsRead(userId) {
    return notificationModel.markAllAsRead(userId);
  }
};

module.exports = notificationService;
