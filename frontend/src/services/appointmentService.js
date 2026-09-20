import api from './api';

export const appointmentService = {
  bookAppointment: (data) => api.post('/appointments', data),
  getMyAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/appointments/my${query ? '?' + query : ''}`);
  },
  getDoctorAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/appointments/doctor${query ? '?' + query : ''}`);
  },
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  cancelAppointment: (id, reason) => api.patch(`/appointments/${id}/cancel`, { reason }),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status })
};

export default appointmentService;
