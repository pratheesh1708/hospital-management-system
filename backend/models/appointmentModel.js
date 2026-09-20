const db = require('../config/database');

const appointmentModel = {
  // Checks if an active appointment already occupies this slot using an active connection with locking
  async checkSlotCollision(conn, doctorId, appointmentDate, startTime) {
    const executor = conn || db;
    const [rows] = await executor.query(
      `SELECT appointment_id, status 
       FROM appointments 
       WHERE doctor_id = ? 
         AND appointment_date = ? 
         AND start_time = ? 
         AND status != 'CANCELLED'
       LIMIT 1 FOR UPDATE`,
      [doctorId, appointmentDate, startTime]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async create(conn, { patientId, doctorId, appointmentDate, startTime, endTime, reason = '', status = 'CONFIRMED' }) {
    const executor = conn || db;
    const [res] = await executor.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, start_time, end_time, reason, status, confirmation_sent, reminder_sent)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [patientId, doctorId, appointmentDate, startTime, endTime, reason, status]
    );
    return res.insertId;
  },

  async findById(appointmentId) {
    const [rows] = await db.query(
      `SELECT a.*,
              p.user_id as patient_user_id, p.blood_group, p.date_of_birth, p.gender,
              u_pat.name as patient_name, u_pat.email as patient_email, u_pat.phone as patient_phone,
              d.user_id as doctor_user_id, d.qualification, d.experience, d.consultation_fee,
              u_doc.name as doctor_name, u_doc.email as doctor_email,
              s.specialization_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN users u_pat ON p.user_id = u_pat.user_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN users u_doc ON d.user_id = u_doc.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       WHERE a.appointment_id = ?`,
      [appointmentId]
    );
    return rows[0] || null;
  },

  async findByPatient(patientId, { status = null, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT a.*,
             d.doctor_id, d.consultation_fee, d.qualification, d.avatar_url,
             u_doc.name as doctor_name, u_doc.email as doctor_email,
             s.specialization_name, s.icon as specialization_icon,
             mr.record_id, r.report_id, r.report_number
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN users u_doc ON d.user_id = u_doc.user_id
      JOIN specializations s ON d.specialization_id = s.specialization_id
      LEFT JOIN medical_records mr ON a.appointment_id = mr.appointment_id
      LEFT JOIN reports r ON mr.record_id = r.record_id
      WHERE a.patient_id = ?
    `;
    const params = [patientId];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.start_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findByDoctor(doctorId, { date = null, status = null, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT a.*,
             p.patient_id, p.date_of_birth, p.gender, p.blood_group,
             u_pat.name as patient_name, u_pat.email as patient_email, u_pat.phone as patient_phone,
             mr.record_id, r.report_id, r.report_number
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u_pat ON p.user_id = u_pat.user_id
      LEFT JOIN medical_records mr ON a.appointment_id = mr.appointment_id
      LEFT JOIN reports r ON mr.record_id = r.record_id
      WHERE a.doctor_id = ?
    `;
    const params = [doctorId];

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.appointment_date ASC, a.start_time ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findAll({ status = null, date = null, search = '', limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT a.*,
             u_pat.name as patient_name, u_pat.email as patient_email,
             u_doc.name as doctor_name, s.specialization_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u_pat ON p.user_id = u_pat.user_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN users u_doc ON d.user_id = u_doc.user_id
      JOIN specializations s ON d.specialization_id = s.specialization_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }

    if (search) {
      sql += ' AND (LOWER(u_pat.name) LIKE ? OR LOWER(u_doc.name) LIKE ? OR LOWER(s.specialization_name) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.start_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async updateStatus(conn, appointmentId, status) {
    const executor = conn || db;
    const [res] = await executor.query(
      'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE appointment_id = ?',
      [status, appointmentId]
    );
    return res.affectedRows > 0;
  },

  async markConfirmationSent(appointmentId) {
    await db.query('UPDATE appointments SET confirmation_sent = 1 WHERE appointment_id = ?', [appointmentId]);
  },

  async markReminderSent(appointmentId) {
    await db.query('UPDATE appointments SET reminder_sent = 1 WHERE appointment_id = ?', [appointmentId]);
  },

  async getUpcomingReminders(targetDate) {
    const [rows] = await db.query(
      `SELECT a.*, 
              u_pat.name as patient_name, u_pat.email as patient_email,
              u_doc.name as doctor_name, s.specialization_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN users u_pat ON p.user_id = u_pat.user_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       JOIN users u_doc ON d.user_id = u_doc.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       WHERE a.appointment_date = ? 
         AND a.status IN ('BOOKED', 'CONFIRMED')
         AND a.reminder_sent = 0`,
      [targetDate]
    );
    return rows;
  },

  async countMetrics() {
    const [total] = await db.query('SELECT COUNT(*) as count FROM appointments');
    const today = new Date().toISOString().split('T')[0];
    const [todayCount] = await db.query('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?', [today]);
    const [completed] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'COMPLETED'");
    const [cancelled] = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'CANCELLED'");

    return {
      total: total[0]?.count || 0,
      today: todayCount[0]?.count || 0,
      completed: completed[0]?.count || 0,
      cancelled: cancelled[0]?.count || 0
    };
  }
};

module.exports = appointmentModel;
