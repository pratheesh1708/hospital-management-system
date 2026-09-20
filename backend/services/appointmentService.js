const db = require('../config/database');
const appointmentModel = require('../models/appointmentModel');
const doctorModel = require('../models/doctorModel');
const patientModel = require('../models/patientModel');
const notificationModel = require('../models/notificationModel');
const emailQueue = require('../queues/emailQueue');
const auditLogModel = require('../models/auditLogModel');

const appointmentService = {
  // Concurrency-safe, transactional appointment reservation
  async bookAppointment({ patientId, doctorId, appointmentDate, startTime, endTime, reason = '', ipAddress = null }) {
    // Basic date validation: cannot book in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate < todayStr) {
      const error = new Error('Cannot schedule an appointment for a past date.');
      error.statusCode = 400;
      throw error;
    }

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      const error = new Error('Selected doctor does not exist.');
      error.statusCode = 404;
      throw error;
    }

    const patient = await patientModel.findById(patientId);
    if (!patient) {
      const error = new Error('Patient profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // Default 30 min duration if end time is omitted
    let computedEndTime = endTime;
    if (!computedEndTime && startTime) {
      const [h, m] = startTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + 30;
      const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const endM = String(totalMinutes % 60).padStart(2, '0');
      computedEndTime = `${endH}:${endM}`;
    }

    // Acquire dedicated connection from the connection pool for transaction
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Layer 2 & 3: Database row check with locking to prevent race conditions
      const collision = await appointmentModel.checkSlotCollision(
        connection,
        doctorId,
        appointmentDate,
        startTime
      );

      if (collision) {
        await connection.rollback();
        const error = new Error('Sorry, this appointment slot has just been booked by another patient. Please select another available slot.');
        error.statusCode = 409;
        throw error;
      }

      // Check if this patient already has an active appointment at this date & time with any doctor
      const [patientCollision] = await connection.query(
        `SELECT appointment_id FROM appointments 
         WHERE patient_id = ? AND appointment_date = ? AND start_time = ? AND status != 'CANCELLED' 
         LIMIT 1`,
        [patientId, appointmentDate, startTime]
      );

      if (patientCollision.length > 0) {
        await connection.rollback();
        const error = new Error('You already have another appointment scheduled at this exact time.');
        error.statusCode = 400;
        throw error;
      }

      // Create appointment atomically
      const appointmentId = await appointmentModel.create(connection, {
        patientId,
        doctorId,
        appointmentDate,
        startTime,
        endTime: computedEndTime,
        reason,
        status: 'CONFIRMED'
      });

      // Commit the database transaction
      await connection.commit();

      // Post-commit async notifications & email background job
      await notificationModel.create({
        userId: patient.user_id,
        title: 'Appointment Confirmed',
        message: `Your consultation with ${doctor.name} is confirmed for ${appointmentDate} at ${startTime}.`,
        type: 'appointment'
      });

      await notificationModel.create({
        userId: doctor.user_id,
        title: 'New Patient Booking',
        message: `Patient ${patient.name} booked a consultation for ${appointmentDate} at ${startTime}.`,
        type: 'appointment'
      });

      emailQueue.add('appointment_confirmation', {
        to: patient.email,
        patientName: patient.name,
        doctorName: doctor.name,
        specialization: doctor.specialization_name,
        date: appointmentDate,
        time: startTime
      });

      await auditLogModel.log({
        userId: patient.user_id,
        action: 'APPOINTMENT_BOOKED',
        entityType: 'APPOINTMENT',
        entityId: appointmentId,
        ipAddress,
        details: { doctorId, appointmentDate, startTime }
      });

      return {
        appointmentId,
        doctorName: doctor.name,
        specialization: doctor.specialization_name,
        appointmentDate,
        startTime,
        endTime: computedEndTime,
        status: 'CONFIRMED',
        message: 'Your appointment has been successfully booked and confirmed.'
      };
    } catch (err) {
      // In case of an unexpected DB error, ensure rollback
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        // Rollback error fallback
      }

      // Handle duplicate key error gracefully if caught by DB unique constraint
      if (err.code === 'ER_DUP_ENTRY' || err.message.includes('UNIQUE constraint failed')) {
        const error = new Error('Sorry, this appointment slot has just been booked by another patient. Please select another available slot.');
        error.statusCode = 409;
        throw error;
      }

      throw err;
    } finally {
      connection.release();
    }
  },

  async cancelAppointment(appointmentId, requestingUserId, requestingRole, reason = '', ipAddress = null) {
    const appt = await appointmentModel.findById(appointmentId);
    if (!appt) {
      const error = new Error('Appointment not found.');
      error.statusCode = 404;
      throw error;
    }

    if (appt.status === 'CANCELLED') {
      const error = new Error('This appointment has already been cancelled.');
      error.statusCode = 400;
      throw error;
    }

    if (appt.status === 'COMPLETED') {
      const error = new Error('Completed appointments cannot be cancelled.');
      error.statusCode = 400;
      throw error;
    }

    // Role-based ownership check
    if (requestingRole === 'patient') {
      const patient = await patientModel.findByUserId(requestingUserId);
      if (!patient || patient.patient_id !== appt.patient_id) {
        const error = new Error('You are not authorized to cancel this appointment.');
        error.statusCode = 403;
        throw error;
      }
    } else if (requestingRole === 'doctor') {
      const doctor = await doctorModel.findByUserId(requestingUserId);
      if (!doctor || doctor.doctor_id !== appt.doctor_id) {
        const error = new Error('You are not authorized to cancel this appointment.');
        error.statusCode = 403;
        throw error;
      }
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      await appointmentModel.updateStatus(connection, appointmentId, 'CANCELLED');

      await connection.commit();

      // Notify the other party
      const notifyUserId = requestingRole === 'patient' ? appt.doctor_user_id : appt.patient_user_id;
      const cancelledBy = requestingRole === 'patient' ? `Patient ${appt.patient_name}` : `Dr. ${appt.doctor_name}`;

      await notificationModel.create({
        userId: notifyUserId,
        title: 'Appointment Cancelled',
        message: `Appointment on ${appt.appointment_date} at ${appt.start_time} was cancelled by ${cancelledBy}.${reason ? ' Reason: ' + reason : ''}`,
        type: 'appointment'
      });

      await auditLogModel.log({
        userId: requestingUserId,
        action: 'APPOINTMENT_CANCELLED',
        entityType: 'APPOINTMENT',
        entityId: appointmentId,
        ipAddress,
        details: { cancelledBy, reason }
      });

      return {
        success: true,
        message: 'Appointment has been cancelled successfully.'
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async getPatientAppointments(patientId, query) {
    return appointmentModel.findByPatient(patientId, query);
  },

  async getDoctorAppointments(doctorId, query) {
    return appointmentModel.findByDoctor(doctorId, query);
  },

  async getAppointmentById(appointmentId, requestingUserId, requestingRole) {
    const appt = await appointmentModel.findById(appointmentId);
    if (!appt) {
      const error = new Error('Appointment not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC check: only the patient, the doctor, or an admin can view
    if (requestingRole === 'patient' && appt.patient_user_id !== requestingUserId) {
      const error = new Error('Unauthorized to view this appointment.');
      error.statusCode = 403;
      throw error;
    }

    if (requestingRole === 'doctor' && appt.doctor_user_id !== requestingUserId) {
      const error = new Error('Unauthorized to view this appointment.');
      error.statusCode = 403;
      throw error;
    }

    return appt;
  }
};

module.exports = appointmentService;
