import axiosClient from '../../lib/api';

export const userAccountApi = {
  getMe: (token) =>
    axiosClient.get('/api/me', { token }),

  updateProfile: (data, token) =>
    axiosClient.put('/api/me', data, { token }),

  uploadAvatar: (file, token) => {
    const data = new FormData();
    data.append('file', file);
    return axiosClient.post('/api/me/avatar', data, {
      token,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: (data, token) =>
    axiosClient.post('/api/me/change-password', data, { token }),

  getDashboard: (token) =>
    axiosClient.get('/api/me/dashboard', { token }),

  getSecurity: (token) =>
    axiosClient.get('/api/me/security', { token }),

  exportPersonalData: (token) =>
    axiosClient.get('/api/me/export', { token }),

  deleteAccount: (token) =>
    axiosClient.delete('/api/me', { token }),
};
