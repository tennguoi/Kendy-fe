import axiosClient from '../lib/api';

export const authApi = {
  getProviders: () => axiosClient.get('/api/auth/oauth2/providers'),
  
  register: (data) => axiosClient.post('/api/auth/register', data),
  
  login: (data) => axiosClient.post('/api/auth/login', data),
  
  logout: (token) => axiosClient.post('/api/auth/logout', null, { token }),
};
