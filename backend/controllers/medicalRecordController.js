const medicalRecordService = require('../services/medicalRecordService');
const patientModel = require('../models/patientModel');

const medicalRecordController = {
  async completeConsultation(req, res, next) {
    try {
      const { appointmentId, symptoms, diagnosis, treatment, medications, doctorNotes, followUpDate } = req.body;

      if (!appointmentId || !symptoms || !diagnosis || !treatment) {
        return res.status(400).json({
          success: false,
          message: 'Appointment ID, symptoms, diagnosis, and treatment plan are required.'
        });
      }

      const result = await medicalRecordService.completeConsultation({
        doctorUserId: req.user.userId,
        appointmentId: parseInt(appointmentId, 10),
        symptoms,
        diagnosis,
        treatment,
        medications: medications || [],
        doctorNotes: doctorNotes || '',
        followUpDate: followUpDate || null,
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

  async getMyMedicalHistory(req, res, next) {
    try {
      const patient = await patientModel.findByUserId(req.user.userId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found.'
        });
      }

      const history = await medicalRecordService.getPatientMedicalHistory(
        patient.patient_id,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        count: history.length,
        records: history
      });
    } catch (err) {
      next(err);
    }
  },

  async getPatientHistory(req, res, next) {
    try {
      const patientId = parseInt(req.params.patientId, 10);
      const history = await medicalRecordService.getPatientMedicalHistory(
        patientId,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        count: history.length,
        records: history
      });
    } catch (err) {
      next(err);
    }
  },

  async getRecordById(req, res, next) {
    try {
      const recordId = parseInt(req.params.id, 10);
      const record = await medicalRecordService.getRecordById(
        recordId,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        record
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = medicalRecordController;
