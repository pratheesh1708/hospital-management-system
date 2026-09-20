const db = require('../config/database');
const medicalRecordModel = require('../models/medicalRecordModel');
const reportModel = require('../models/reportModel');
const appointmentModel = require('../models/appointmentModel');
const doctorModel = require('../models/doctorModel');
const patientModel = require('../models/patientModel');
const notificationModel = require('../models/notificationModel');
const emailQueue = require('../queues/emailQueue');
const auditLogModel = require('../models/auditLogModel');
const crypto = require('crypto');

const medicalRecordService = {
  async completeConsultation({
    doctorUserId,
    appointmentId,
    symptoms,
    diagnosis,
    treatment,
    medications = [],
    doctorNotes = '',
    followUpDate = null,
    ipAddress = null
  }) {
    const doctor = await doctorModel.findByUserId(doctorUserId);
    if (!doctor) {
      const error = new Error('Doctor profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const appt = await appointmentModel.findById(appointmentId);
    if (!appt) {
      const error = new Error('Appointment not found.');
      error.statusCode = 404;
      throw error;
    }

    if (appt.doctor_id !== doctor.doctor_id) {
      const error = new Error('You are not authorized to complete a consultation for this appointment.');
      error.statusCode = 403;
      throw error;
    }

    // Check if a record already exists
    const existing = await medicalRecordModel.findByAppointmentId(appointmentId);
    if (existing) {
      const error = new Error('A consultation record has already been completed for this appointment.');
      error.statusCode = 409;
      throw error;
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Create medical record
      const recordId = await medicalRecordModel.create(conn, {
        patientId: appt.patient_id,
        doctorId: doctor.doctor_id,
        appointmentId,
        symptoms,
        diagnosis,
        treatment,
        medications,
        doctorNotes,
        followUpDate
      });

      // 2. Generate unique formal consultation report number
      const reportNumber = `REP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const summary = `Clinical consultation completed by ${doctor.name} (${doctor.specialization_name}) on ${appt.appointment_date}. Diagnosis: ${diagnosis}`;

      const reportId = await reportModel.create({
        recordId,
        patientId: appt.patient_id,
        doctorId: doctor.doctor_id,
        reportNumber,
        summary,
        status: 'final'
      });

      // 3. Mark appointment as COMPLETED
      await appointmentModel.updateStatus(conn, appointmentId, 'COMPLETED');

      await conn.commit();

      // Post-commit async notifications & email background worker
      await notificationModel.create({
        userId: appt.patient_user_id,
        title: 'Consultation Report Available',
        message: `Dr. ${doctor.name} has completed your consultation report (${reportNumber}). You can view it securely in your Medical History.`,
        type: 'report'
      });

      emailQueue.add('report_notification', {
        to: appt.patient_email,
        patientName: appt.patient_name,
        doctorName: doctor.name,
        reportNumber
      });

      await auditLogModel.log({
        userId: doctorUserId,
        action: 'CONSULTATION_COMPLETED',
        entityType: 'MEDICAL_RECORD',
        entityId: recordId,
        ipAddress,
        details: { appointmentId, reportNumber, patientId: appt.patient_id }
      });

      return {
        recordId,
        reportId,
        reportNumber,
        status: 'final',
        message: 'Consultation completed and consultation report published successfully.'
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getPatientMedicalHistory(patientId, requestingUserId, requestingRole) {
    if (requestingRole === 'patient') {
      const patient = await patientModel.findByUserId(requestingUserId);
      if (!patient || patient.patient_id !== parseInt(patientId, 10)) {
        const error = new Error('Access denied: You can only access your own medical history.');
        error.statusCode = 403;
        throw error;
      }
    } else if (requestingRole === 'doctor') {
      const doctor = await doctorModel.findByUserId(requestingUserId);
      if (!doctor) {
        const error = new Error('Doctor profile not found.');
        error.statusCode = 403;
        throw error;
      }
      const authorized = await medicalRecordModel.isDoctorAuthorizedForPatient(doctor.doctor_id, patientId);
      if (!authorized) {
        const error = new Error('Access denied: You do not have an active or past clinical relationship with this patient.');
        error.statusCode = 403;
        throw error;
      }
    }

    return medicalRecordModel.findByPatientId(patientId);
  },

  async getRecordById(recordId, requestingUserId, requestingRole) {
    const record = await medicalRecordModel.findById(recordId);
    if (!record) {
      const error = new Error('Medical record not found.');
      error.statusCode = 404;
      throw error;
    }

    if (requestingRole === 'patient' && record.patient_user_id !== requestingUserId) {
      const error = new Error('Access denied: Unauthorized to view this medical record.');
      error.statusCode = 403;
      throw error;
    }

    if (requestingRole === 'doctor' && record.doctor_user_id !== requestingUserId) {
      // Check if this doctor is treating the patient
      const doc = await doctorModel.findByUserId(requestingUserId);
      const authorized = doc && await medicalRecordModel.isDoctorAuthorizedForPatient(doc.doctor_id, record.patient_id);
      if (!authorized) {
        const error = new Error('Access denied: Unauthorized to view this medical record.');
        error.statusCode = 403;
        throw error;
      }
    }

    return record;
  },

  async getReportById(reportId, requestingUserId, requestingRole) {
    const report = await reportModel.findById(reportId);
    if (!report) {
      const error = new Error('Report not found.');
      error.statusCode = 404;
      throw error;
    }

    if (requestingRole === 'patient' && report.patient_user_id !== requestingUserId) {
      const error = new Error('Access denied: Unauthorized to view this medical report.');
      error.statusCode = 403;
      throw error;
    }

    return report;
  }
};

module.exports = medicalRecordService;
