const notificationService = require('../services/notificationService');

const notificationController = {
  async getMyNotifications(req, res, next) {
    try {
      const data = await notificationService.getUserNotifications(req.user.userId);
      res.status(200).json({
        success: true,
        ...data
      });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notificationId = parseInt(req.params.id, 10);
      await notificationService.markAsRead(notificationId, req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read.'
      });
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.userId);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificationController;
