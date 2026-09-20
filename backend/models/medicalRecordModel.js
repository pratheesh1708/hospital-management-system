const db = require('../config/database');

const medicalRecordModel = {
  async create(conn, { patientId, doctorId, appointmentId, symptoms, diagnosis, treatment, medications = '[]', doctorNotes = '', followUpDate = null }) {
    const executor = conn || db;
    const medsJson = typeof medications === 'string' ? medications : JSON.stringify(medications);
    const [res] = await executor.query(
      `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, symptoms, diagnosis, treatment, medications, doctor_notes, follow_up_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, doctorId, appointmentId, symptoms, diagnosis, treatment, medsJson, doctorNotes, followUpDate]
    );
    return res.insertId;
  },

  async findById(recordId) {
    const [rows] = await db.query(
      `SELECT mr.*,
              p.user_id as patient_user_id, p.blood_group, p.date_of_birth, p.gender,
              u_pat.name as patient_name, u_pat.email as patient_email, u_pat.phone as patient_phone,
              d.user_id as doctor_user_id, d.qualification,
              u_doc.name as doctor_name, u_doc.email as doctor_email,
              s.specialization_name,
              a.appointment_date, a.start_time,
              r.report_id, r.report_number, r.summary as report_summary, r.status as report_status
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.patient_id
       JOIN users u_pat ON p.user_id = u_pat.user_id
       JOIN doctors d ON mr.doctor_id = d.doctor_id
       JOIN users u_doc ON d.user_id = u_doc.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       JOIN appointments a ON mr.appointment_id = a.appointment_id
       LEFT JOIN reports r ON mr.record_id = r.record_id
       WHERE mr.record_id = ?`,
      [recordId]
    );
    return rows[0] || null;
  },

  async findByPatientId(patientId) {
    const [rows] = await db.query(
      `SELECT mr.*,
              u_doc.name as doctor_name, s.specialization_name,
              a.appointment_date, a.start_time,
              r.report_id, r.report_number, r.status as report_status
       FROM medical_records mr
       JOIN doctors d ON mr.doctor_id = d.doctor_id
       JOIN users u_doc ON d.user_id = u_doc.user_id
       JOIN specializations s ON d.specialization_id = s.specialization_id
       JOIN appointments a ON mr.appointment_id = a.appointment_id
       LEFT JOIN reports r ON mr.record_id = r.record_id
       WHERE mr.patient_id = ?
       ORDER BY mr.created_at DESC`,
      [patientId]
    );
    return rows;
  },

  async findByDoctorId(doctorId) {
    const [rows] = await db.query(
      `SELECT mr.*,
              u_pat.name as patient_name, p.gender, p.blood_group,
              a.appointment_date,
              r.report_id, r.report_number
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.patient_id
       JOIN users u_pat ON p.user_id = u_pat.user_id
       JOIN appointments a ON mr.appointment_id = a.appointment_id
       LEFT JOIN reports r ON mr.record_id = r.record_id
       WHERE mr.doctor_id = ?
       ORDER BY mr.created_at DESC`,
      [doctorId]
    );
    return rows;
  },

  async findByAppointmentId(appointmentId) {
    const [rows] = await db.query(
      'SELECT * FROM medical_records WHERE appointment_id = ?',
      [appointmentId]
    );
    return rows[0] || null;
  },

  // Verifies if doctor has a clinical relationship (an appointment) with the patient
  async isDoctorAuthorizedForPatient(doctorId, patientId) {
    const [rows] = await db.query(
      'SELECT appointment_id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1',
      [doctorId, patientId]
    );
    return rows.length > 0;
  }
};

module.exports = medicalRecordModel;
