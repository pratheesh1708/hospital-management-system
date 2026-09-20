const appointmentService = require('../../services/appointmentService');
const patientModel = require('../../models/patientModel');
const appointmentModel = require('../../models/appointmentModel');

const appointmentTools = {
  async getPatientAppointments({ userId, status = null }) {
    if (!userId) {
      return { error: 'Please log in to view your appointments.' };
    }

    const patient = await patientModel.findByUserId(userId);
    if (!patient) {
      return { error: 'Patient account profile not found.' };
    }

    const appts = await appointmentModel.findByPatient(patient.patient_id, { status, limit: 5 });
    return appts.map(a => ({
      appointmentId: a.appointment_id,
      doctorName: a.doctor_name,
      specialization: a.specialization_name,
      date: a.appointment_date,
      time: a.start_time,
      status: a.status,
      fee: `$${a.consultation_fee}`
    }));
  },

  async createAppointment({ userId, doctorId, date, startTime, reason = 'Booked via AI Assistant' }) {
    if (!userId) {
      return { error: 'You must be logged in as a patient to schedule an appointment.' };
    }

    const patient = await patientModel.findByUserId(userId);
    if (!patient) {
      return { error: 'Patient profile record not found.' };
    }

    try {
      const result = await appointmentService.bookAppointment({
        patientId: patient.patient_id,
        doctorId: parseInt(doctorId, 10),
        appointmentDate: date,
        startTime,
        reason
      });

      return {
        success: true,
        appointmentId: result.appointmentId,
        doctorName: result.doctorName,
        specialization: result.specialization,
        date: result.appointmentDate,
        time: result.startTime,
        status: result.status,
        message: result.message
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  },

  async cancelAppointment({ userId, appointmentId, reason = 'Cancelled via AI Assistant' }) {
    if (!userId) {
      return { error: 'You must be logged in to cancel an appointment.' };
    }

    try {
      const result = await appointmentService.cancelAppointment(
        parseInt(appointmentId, 10),
        userId,
        'patient',
        reason
      );
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

module.exports = appointmentTools;
