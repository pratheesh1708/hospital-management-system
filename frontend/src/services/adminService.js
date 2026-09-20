import api from './api';

export const adminService = {
  getMetrics: () => api.get('/admin/metrics'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/users${query ? '?' + query : ''}`);
  },
  updateUserStatus: (userId, status) => api.patch(`/admin/users/${userId}/status`, { status }),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  getAllAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/appointments${query ? '?' + query : ''}`);
  },
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/audit-logs${query ? '?' + query : ''}`);
  },
  addSpecialization: (data) => api.post('/admin/specializations', data)
};

export default adminService;
