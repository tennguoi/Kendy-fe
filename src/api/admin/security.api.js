import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminSecurityApi = {
  getSecurityOverview: (token) =>
    axiosClient.get('/api/admin/security/overview', { token }),

  getSecurityRiskyAccounts: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/risky-accounts${queryString({ limit: 50, ...params })}`, { token }),

  unlockSecurityAccount: (userId, token) =>
    axiosClient.post(`/api/admin/security/users/${userId}/unlock`, {}, { token }),

  getSecuritySessions: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/sessions${queryString({ page: 0, size: 50, ...params })}`, { token }),

  revokeSecuritySession: (sessionId, token) =>
    axiosClient.delete(`/api/admin/security/sessions/${sessionId}`, { token }),

  getSecurityApiKeys: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/api-keys${queryString({ page: 0, size: 50, ...params })}`, { token }),

  revokeSecurityApiKey: (keyId, token) =>
    axiosClient.delete(`/api/admin/security/api-keys/${keyId}`, { token }),

  getSecurityEvents: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/events${queryString({ limit: 50, ...params })}`, { token }),
};
