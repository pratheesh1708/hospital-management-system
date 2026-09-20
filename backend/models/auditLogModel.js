const db = require('../config/database');

const auditLogModel = {
  async log({ userId = null, action, entityType, entityId = null, ipAddress = null, details = null }) {
    try {
      const detailsStr = details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null;
      await db.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, entityType, entityId ? String(entityId) : null, ipAddress, detailsStr]
      );
    } catch (err) {
      console.error('Failed to write audit log:', err.message);
    }
  },

  async findAll({ limit = 50, offset = 0, action = null, entityType = null } = {}) {
    let sql = `
      SELECT al.*, u.name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      sql += ' AND al.action = ?';
      params.push(action);
    }

    if (entityType) {
      sql += ' AND al.entity_type = ?';
      params.push(entityType);
    }

    sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM audit_logs');
    return rows[0]?.count || 0;
  }
};

module.exports = auditLogModel;
