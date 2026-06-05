import axiosClient from '../lib/api';

export const authApi = {
  getProviders: () => axiosClient.get('/api/auth/oauth2/providers'),
  
  register: (data) => axiosClient.post('/api/auth/register', data),
  
  login: (data) => axiosClient.post('/api/auth/login', data),

  sendTwoFactorEmailCode: (data) => axiosClient.post('/api/auth/2fa/email-code', data),

  verifyOAuthTwoFactor: (data) => axiosClient.post('/api/auth/oauth2/2fa/verify', data),

  forgotPassword: (data) => axiosClient.post('/api/auth/forgot-password', data),

  resetPassword: (data) => axiosClient.post('/api/auth/reset-password', data),

  resendVerification: (data) => axiosClient.post('/api/auth/resend-verification', data),

  verifyEmail: (data) => axiosClient.post('/api/auth/verify-email', data),

  logout: (token) => axiosClient.post('/api/auth/logout', null, { token }),
};
