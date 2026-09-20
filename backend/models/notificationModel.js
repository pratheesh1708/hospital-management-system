const db = require('../config/database');

const notificationModel = {
  async create({ userId, title, message, type = 'system' }) {
    const [res] = await db.query(
      'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)',
      [userId, title, message, type]
    );
    return res.insertId;
  },

  async findByUserId(userId, limit = 20) {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, parseInt(limit, 10)]
    );
    return rows;
  },

  async getUnreadCount(userId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return rows[0]?.count || 0;
  },

  async markAsRead(notificationId, userId) {
    const [res] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return res.affectedRows > 0;
  },

  async markAllAsRead(userId) {
    const [res] = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    return res.affectedRows > 0;
  }
};

module.exports = notificationModel;
