const db = require('../config/database');

const patientModel = {
  async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT p.*, u.name, u.email, u.phone, u.status, u.email_verified
       FROM patients p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  async findById(patientId) {
    const [rows] = await db.query(
      `SELECT p.*, u.name, u.email, u.phone, u.status, u.email_verified
       FROM patients p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.patient_id = ?`,
      [patientId]
    );
    return rows[0] || null;
  },

  async create({ userId, dateOfBirth = null, gender = null, bloodGroup = null, address = null, emergencyContact = null }) {
    const [res] = await db.query(
      'INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, dateOfBirth, gender, bloodGroup, address, emergencyContact]
    );
    return res.insertId;
  },

  async update(patientId, { dateOfBirth, gender, bloodGroup, address, emergencyContact }) {
    const [res] = await db.query(
      `UPDATE patients 
       SET date_of_birth = COALESCE(?, date_of_birth),
           gender = COALESCE(?, gender),
           blood_group = COALESCE(?, blood_group),
           address = COALESCE(?, address),
           emergency_contact = COALESCE(?, emergency_contact),
           updated_at = CURRENT_TIMESTAMP
       WHERE patient_id = ?`,
      [dateOfBirth, gender, bloodGroup, address, emergencyContact, patientId]
    );
    return res.affectedRows > 0;
  },

  async findAll({ search = '', limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT p.patient_id, p.user_id, p.date_of_birth, p.gender, p.blood_group, p.address, p.emergency_contact, p.created_at,
             u.name, u.email, u.phone, u.status
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(p.blood_group) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count() {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM patients');
    return rows[0]?.count || 0;
  }
};

module.exports = patientModel;
