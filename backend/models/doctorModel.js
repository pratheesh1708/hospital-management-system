const db = require('../config/database');

const doctorModel = {
  async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT d.*, u.name, u.email, u.phone, u.status, s.specialization_name, s.icon as specialization_icon
       FROM doctors d
       JOIN users u ON d.user_id = u.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       WHERE d.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  async findById(doctorId) {
    const [rows] = await db.query(
      `SELECT d.*, u.name, u.email, u.phone, u.status, s.specialization_name, s.icon as specialization_icon
       FROM doctors d
       JOIN users u ON d.user_id = u.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       WHERE d.doctor_id = ?`,
      [doctorId]
    );
    return rows[0] || null;
  },

  async findAll({ specializationId = null, search = '', minExperience = 0, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT d.*, u.name, u.email, u.phone, u.status, s.specialization_name, s.icon as specialization_icon
      FROM doctors d
      JOIN users u ON d.user_id = u.user_id
      JOIN specializations s ON d.specialization_id = s.specialization_id
      WHERE u.status = 'active'
    `;
    const params = [];

    if (specializationId) {
      sql += ' AND d.specialization_id = ?';
      params.push(specializationId);
    }

    if (minExperience) {
      sql += ' AND d.experience >= ?';
      params.push(parseInt(minExperience, 10));
    }

    if (search) {
      sql += ' AND (LOWER(u.name) LIKE ? OR LOWER(s.specialization_name) LIKE ? OR LOWER(d.qualification) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY d.experience DESC, u.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async create({ userId, specializationId, qualification, experience = 0, consultationFee = 50.00, bio = '', avatarUrl = null }) {
    const [res] = await db.query(
      'INSERT INTO doctors (user_id, specialization_id, qualification, experience, consultation_fee, bio, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, specializationId, qualification, experience, consultationFee, bio, avatarUrl]
    );
    return res.insertId;
  },

  async update(doctorId, { specializationId, qualification, experience, consultationFee, bio, avatarUrl }) {
    const [res] = await db.query(
      `UPDATE doctors
       SET specialization_id = COALESCE(?, specialization_id),
           qualification = COALESCE(?, qualification),
           experience = COALESCE(?, experience),
           consultation_fee = COALESCE(?, consultation_fee),
           bio = COALESCE(?, bio),
           avatar_url = COALESCE(?, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE doctor_id = ?`,
      [specializationId, qualification, experience, consultationFee, bio, avatarUrl, doctorId]
    );
    return res.affectedRows > 0;
  },

  async count() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM doctors');
    return rows[0]?.count || 0;
  }
};

module.exports = doctorModel;
