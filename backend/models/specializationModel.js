const db = require('../config/database');

const specializationModel = {
  async findAll() {
    const [rows] = await db.query(
      `SELECT s.*, COUNT(d.doctor_id) as doctor_count
       FROM specializations s
       LEFT JOIN doctors d ON s.specialization_id = d.specialization_id
       GROUP BY s.specialization_id
       ORDER BY s.specialization_name ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM specializations WHERE specialization_id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByName(name) {
    const [rows] = await db.query(
      'SELECT * FROM specializations WHERE LOWER(specialization_name) = LOWER(?)',
      [name.trim()]
    );
    return rows[0] || null;
  },

  async create({ name, description = '', icon = 'Activity' }) {
    const [res] = await db.query(
      'INSERT INTO specializations (specialization_name, description, icon) VALUES (?, ?, ?)',
      [name.trim(), description, icon]
    );
    return res.insertId;
  },

  async update(id, { name, description, icon }) {
    const [res] = await db.query(
      `UPDATE specializations 
       SET specialization_name = COALESCE(?, specialization_name),
           description = COALESCE(?, description),
           icon = COALESCE(?, icon),
           updated_at = CURRENT_TIMESTAMP
       WHERE specialization_id = ?`,
      [name ? name.trim() : null, description, icon, id]
    );
    return res.affectedRows > 0;
  },

  async delete(id) {
    const [res] = await db.query('DELETE FROM specializations WHERE specialization_id = ?', [id]);
    return res.affectedRows > 0;
  }
};

module.exports = specializationModel;
