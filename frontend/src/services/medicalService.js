import api from './api';

export const medicalService = {
  getPatientHistory: () => api.get('/medical-records/patient'),
  getDoctorRecords: () => api.get('/medical-records/doctor'),
  createRecord: (data) => api.post('/medical-records', data),
  getRecordById: (id) => api.get(`/medical-records/${id}`),
  getReports: () => api.get('/reports/patient'),
  getReportById: (id) => api.get(`/reports/${id}`)
};

export default medicalService;
