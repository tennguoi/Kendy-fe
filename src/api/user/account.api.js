import axiosClient from '../../lib/api';

export const userAccountApi = {
  getMe: (token) =>
    axiosClient.get('/api/me', { token }),

  updateProfile: (data, token) =>
    axiosClient.put('/api/me', data, { token }),

  changePassword: (data, token) =>
    axiosClient.post('/api/me/change-password', data, { token }),

  getDashboard: (token) =>
    axiosClient.get('/api/me/dashboard', { token }),

  getSecurity: (token) =>
    axiosClient.get('/api/me/security', { token }),
};
