const db = require('../config/database');

const reportModel = {
  async create({ recordId, patientId, doctorId, reportNumber, summary = '', status = 'final' }) {
    const [res] = await db.query(
      `INSERT INTO reports (record_id, patient_id, doctor_id, report_number, summary, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recordId, patientId, doctorId, reportNumber, summary, status]
    );
    return res.insertId;
  },

  async findById(reportId) {
    const [rows] = await db.query(
      `SELECT r.*,
              mr.symptoms, mr.diagnosis, mr.treatment, mr.medications, mr.doctor_notes, mr.follow_up_date,
              a.appointment_date, a.start_time, a.end_time,
              u_pat.name as patient_name, u_pat.email as patient_email, u_pat.phone as patient_phone,
              p.gender, p.blood_group, p.date_of_birth,
              u_doc.name as doctor_name, u_doc.email as doctor_email,
              d.qualification, d.experience,
              s.specialization_name
       FROM reports r
       JOIN medical_records mr ON r.record_id = mr.record_id
       JOIN appointments a ON mr.appointment_id = a.appointment_id
       JOIN patients p ON r.patient_id = p.patient_id
       JOIN users u_pat ON p.user_id = u_pat.user_id
       JOIN doctors d ON r.doctor_id = d.doctor_id
       JOIN users u_doc ON d.user_id = u_doc.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       WHERE r.report_id = ?`,
      [reportId]
    );
    return rows[0] || null;
  },

  async findByPatientId(patientId) {
    const [rows] = await db.query(
      `SELECT r.*, 
              mr.diagnosis, mr.follow_up_date,
              a.appointment_date,
              u_doc.name as doctor_name, s.specialization_name
       FROM reports r
       JOIN medical_records mr ON r.record_id = mr.record_id
       JOIN appointments a ON mr.appointment_id = a.appointment_id
       JOIN doctors d ON r.doctor_id = d.doctor_id
       JOIN users u_doc ON d.user_id = u_doc.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       WHERE r.patient_id = ?
       ORDER BY r.created_at DESC`,
      [patientId]
    );
    return rows;
  },

  async findByRecordId(recordId) {
    const [rows] = await db.query('SELECT * FROM reports WHERE record_id = ?', [recordId]);
    return rows[0] || null;
  }
};

module.exports = reportModel;
