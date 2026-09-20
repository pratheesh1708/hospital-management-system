const db = require('../config/database');

const oauthAccountModel = {
  async findAccount(provider, providerUserId) {
    const [rows] = await db.query(
      `SELECT oa.*, u.role, u.status, u.email_verified, u.name, u.email
       FROM oauth_accounts oa
       JOIN users u ON oa.user_id = u.user_id
       WHERE oa.provider = ? AND oa.provider_user_id = ?`,
      [provider, providerUserId]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM oauth_accounts WHERE user_id = ?',
      [userId]
    );
    return rows;
  },

  async linkAccount({ userId, provider, providerUserId, providerEmail }) {
    const [res] = await db.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_user_id, provider_email)
       VALUES (?, ?, ?, ?)`,
      [userId, provider, providerUserId, providerEmail]
    );
    return res.insertId;
  }
};

module.exports = oauthAccountModel;
