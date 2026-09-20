import api from './api';

export const doctorService = {
  getDoctors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/doctors${query ? '?' + query : ''}`);
  },
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations'),
  getDoctorAvailability: (doctorId, date) => api.get(`/doctors/${doctorId}/availability?date=${date}`),
  addAvailability: (data) => api.post('/doctors/availability', data),
  deleteAvailability: (id) => api.delete(`/doctors/availability/${id}`)
};

export default doctorService;
