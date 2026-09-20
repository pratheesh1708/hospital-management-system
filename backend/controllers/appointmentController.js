const appointmentService = require('../services/appointmentService');
const patientModel = require('../models/patientModel');
const doctorModel = require('../models/doctorModel');

const appointmentController = {
  async bookAppointment(req, res, next) {
    try {
      const { doctorId, appointmentDate, startTime, endTime, reason } = req.body;

      if (!doctorId || !appointmentDate || !startTime) {
        return res.status(400).json({
          success: false,
          message: 'Doctor ID, appointment date, and start time are required.'
        });
      }

      // Automatically resolve patient ID from authenticated session
      let patientId;
      if (req.user.role === 'patient') {
        const patient = await patientModel.findByUserId(req.user.userId);
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Patient profile not found.'
          });
        }
        patientId = patient.patient_id;
      } else if (req.user.role === 'admin' && req.body.patientId) {
        patientId = parseInt(req.body.patientId, 10);
      } else {
        return res.status(403).json({
          success: false,
          message: 'Only registered patients can book appointments.'
        });
      }

      const result = await appointmentService.bookAppointment({
        patientId,
        doctorId: parseInt(doctorId, 10),
        appointmentDate,
        startTime,
        endTime,
        reason,
        ipAddress: req.ip
      });

      res.status(201).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyAppointments(req, res, next) {
    try {
      const { status, date } = req.query;

      if (req.user.role === 'patient') {
        const patient = await patientModel.findByUserId(req.user.userId);
        if (!patient) {
          return res.status(200).json({ success: true, appointments: [] });
        }
        const appointments = await appointmentService.getPatientAppointments(patient.patient_id, { status });
        return res.status(200).json({
          success: true,
          count: appointments.length,
          appointments
        });
      }

      if (req.user.role === 'doctor') {
        const doctor = await doctorModel.findByUserId(req.user.userId);
        if (!doctor) {
          return res.status(200).json({ success: true, appointments: [] });
        }
        const appointments = await appointmentService.getDoctorAppointments(doctor.doctor_id, { status, date });
        return res.status(200).json({
          success: true,
          count: appointments.length,
          appointments
        });
      }

      res.status(403).json({
        success: false,
        message: 'Unsupported role for /my appointments.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getAppointmentById(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.id, 10);
      const appt = await appointmentService.getAppointmentById(
        appointmentId,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        appointment: appt
      });
    } catch (err) {
      next(err);
    }
  },

  async cancelAppointment(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      const result = await appointmentService.cancelAppointment(
        appointmentId,
        req.user.userId,
        req.user.role,
        reason,
        req.ip
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = appointmentController;
