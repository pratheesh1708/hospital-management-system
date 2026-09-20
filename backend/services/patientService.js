const patientModel = require('../models/patientModel');
const reportModel = require('../models/reportModel');
const medicalRecordModel = require('../models/medicalRecordModel');

const patientService = {
  async getProfile(userId) {
    const patient = await patientModel.findByUserId(userId);
    if (!patient) {
      const error = new Error('Patient profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return patient;
  },

  async updateProfile(userId, data) {
    const patient = await patientModel.findByUserId(userId);
    if (!patient) {
      const error = new Error('Patient profile not found.');
      error.statusCode = 404;
      throw error;
    }

    await patientModel.update(patient.patient_id, data);
    return this.getProfile(userId);
  },

  async getReports(userId) {
    const patient = await patientModel.findByUserId(userId);
    if (!patient) return [];
    return reportModel.findByPatientId(patient.patient_id);
  },

  async getMedicalHistory(userId) {
    const patient = await patientModel.findByUserId(userId);
    if (!patient) return [];
    return medicalRecordModel.findByPatientId(patient.patient_id);
  }
};

module.exports = patientService;
