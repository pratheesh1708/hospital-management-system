const db = require('../config/database');

const userModel = {
  async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );
    return rows[0] || null;
  },

  async findById(userId) {
    const [rows] = await db.query(
      'SELECT user_id, name, email, role, phone, status, email_verified, created_at, updated_at FROM users WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, role = 'patient', phone = null, emailVerified = 0 }) {
    const [res] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash, role, phone, 'active', emailVerified ? 1 : 0]
    );
    return res.insertId;
  },

  async verifyEmail(userId) {
    const [res] = await db.query(
      'UPDATE users SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [userId]
    );
    return res.affectedRows > 0;
  },

  async updatePassword(userId, newPasswordHash) {
    const [res] = await db.query(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [newPasswordHash, userId]
    );
    return res.affectedRows > 0;
  },

  async updateStatus(userId, status) {
    const [res] = await db.query(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [status, userId]
    );
    return res.affectedRows > 0;
  },

  async updateRole(userId, role) {
    const [res] = await db.query(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [role, userId]
    );
    return res.affectedRows > 0;
  },

  async findAllUsers({ role = null, search = '', limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT user_id, name, email, role, phone, status, email_verified, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async countUsers() {
    const [rows] = await db.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    return rows;
  }
};

module.exports = userModel;
