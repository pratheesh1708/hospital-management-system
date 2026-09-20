const medicalRecordService = require('../services/medicalRecordService');
const patientModel = require('../models/patientModel');
const reportModel = require('../models/reportModel');

const reportController = {
  async getMyReports(req, res, next) {
    try {
      const patient = await patientModel.findByUserId(req.user.userId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found.'
        });
      }

      const reports = await reportModel.findByPatientId(patient.patient_id);
      res.status(200).json({
        success: true,
        count: reports.length,
        reports
      });
    } catch (err) {
      next(err);
    }
  },

  async getReportById(req, res, next) {
    try {
      const reportId = parseInt(req.params.id, 10);
      const report = await medicalRecordService.getReportById(
        reportId,
        req.user.userId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        report
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reportController;
