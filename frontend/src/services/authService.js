import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (email, otp) => api.post('/auth/verify-email', { email, otp }),
  resendOtp: (email, purpose = 'registration') => api.post('/auth/resend-otp', { email, purpose }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getGoogleConfig: () => api.get('/auth/oauth/config'),
  loginWithGoogleCredential: (credential) => api.post('/auth/oauth/google', { credential })
};

export default authService;
