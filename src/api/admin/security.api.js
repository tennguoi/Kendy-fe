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

  getThreatOverview: (token) =>
    axiosClient.get('/api/admin/security/threat-overview', { token }),

  getSecurityAlerts: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/alerts${queryString({ limit: 50, ...params })}`, { token }),

  updateSecurityAlert: (id, body, token) =>
    axiosClient.patch(`/api/admin/security/alerts/${id}`, body, { token }),

  getSecurityThreatEvents: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/security-events${queryString({ limit: 100, ...params })}`, { token }),

  getSecurityTopIps: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/threats/top-ips${queryString({ hours: 24, limit: 20, ...params })}`, { token }),

  getSecurityTimeline: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/timeline${queryString({ hours: 24, bucket: 60, ...params })}`, { token }),

  getSecurityIpProfile: (ip, token, params = {}) =>
    axiosClient.get(`/api/admin/security/ip/${encodeURIComponent(ip)}${queryString({ limit: 50, ...params })}`, { token }),

  getSecurityUserRisk: (userId, token, params = {}) =>
    axiosClient.get(`/api/admin/security/users/${userId}/risk${queryString({ limit: 50, ...params })}`, { token }),

  getSecurityIpBans: (token, params = {}) =>
    axiosClient.get(`/api/admin/security/ip-bans${queryString({ limit: 100, ...params })}`, { token }),

  banSecurityIp: (body, token) =>
    axiosClient.post('/api/admin/security/ip-bans', body, { token }),

  unbanSecurityIp: (id, token) =>
    axiosClient.delete(`/api/admin/security/ip-bans/${id}`, { token }),

  revokeAllSecuritySessions: (userId, token) =>
    axiosClient.post(`/api/admin/security/users/${userId}/revoke-all-sessions`, {}, { token }),

  freezeSecurityWallet: (userId, reason, token) =>
    axiosClient.post(`/api/admin/security/users/${userId}/freeze-wallet`, { reason }, { token }),

  unfreezeSecurityWallet: (userId, token) =>
    axiosClient.post(`/api/admin/security/users/${userId}/unfreeze-wallet`, {}, { token }),

  getAuditIntegrity: (token) =>
    axiosClient.get('/api/admin/security/audit-integrity', { token }),
};
