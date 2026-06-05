import axiosClient from '../../lib/api';

export const userSecurityApi = {
  getSessions: (token) =>
    axiosClient.get('/api/me/sessions?size=20', { token }),

  revokeSession: (sessionId, token) =>
    axiosClient.delete(`/api/me/sessions/${sessionId}`, { token }),

  revokeAllSessions: (token) =>
    axiosClient.delete('/api/me/sessions', { token }),

  sendTwoFactorEnableEmailCode: (token) =>
    axiosClient.post('/api/me/2fa/email-code', {}, { token }),

  setupTwoFactor: (token) =>
    axiosClient.post('/api/me/2fa/setup', {}, { token }),

  enableTwoFactor: (data, token) =>
    axiosClient.post('/api/me/2fa/enable', data, { token }),

  enableEmailTwoFactor: (data, token) =>
    axiosClient.post('/api/me/2fa/enable-email', data, { token }),

  disableTwoFactor: (data, token) =>
    axiosClient.post('/api/me/2fa/disable', data, { token }),

  resetTwoFactor: (data, token) =>
    axiosClient.post('/api/me/2fa/reset', data, { token }),

  regenerateBackupCodes: (data, token) =>
    axiosClient.post('/api/me/2fa/backup-codes', data, { token }),

  getApiKeys: (token) =>
    axiosClient.get('/api/me/api-keys?size=20', { token }),

  createApiKey: (data, token) =>
    axiosClient.post('/api/me/api-keys', data, { token }),

  revokeApiKey: (keyId, token) =>
    axiosClient.delete(`/api/me/api-keys/${keyId}`, { token }),
};
