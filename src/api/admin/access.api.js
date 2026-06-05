import axiosClient from '../../lib/api';

export const adminAccessApi = {
  getAdmins: (token) =>
    axiosClient.get('/api/admin/admins?limit=100', { token }),

  setupAdminTwoFactor: (id, token) =>
    axiosClient.post(`/api/admin/admins/${id}/2fa/setup`, {}, { token }),

  enableAdminTwoFactor: (id, data, token) =>
    axiosClient.post(`/api/admin/admins/${id}/2fa/enable`, data, { token }),

  disableAdminTwoFactor: (id, token) =>
    axiosClient.post(`/api/admin/admins/${id}/2fa/disable`, {}, { token }),

  resetAdminTwoFactor: (id, token) =>
    axiosClient.post(`/api/admin/admins/${id}/2fa/reset`, {}, { token }),

  getAdminPermissions: (id, token) =>
    axiosClient.get(`/api/admin/admins/${id}/permissions`, { token }),

  updateAdminPermissions: (id, data, token) =>
    axiosClient.put(`/api/admin/admins/${id}/permissions`, data, { token }),

  getAdminLegacyRole: (id, token) =>
    axiosClient.get(`/api/admin/admins/${id}/roles`, { token }),

  updateAdminLegacyRole: (id, data, token) =>
    axiosClient.put(`/api/admin/admins/${id}/roles`, data, { token }),

  getAdminSessions: (id, token) =>
    axiosClient.get(`/api/admin/admins/${id}/sessions?limit=20`, { token }),

  revokeAdminSession: (id, sessionId, token) =>
    axiosClient.delete(`/api/admin/admins/${id}/sessions/${sessionId}`, { token }),

  bulkLockAdmins: (data, token) =>
    axiosClient.post('/api/admin/admins/bulk-lock', data, { token }),

  bulkUnlockAdmins: (data, token) =>
    axiosClient.post('/api/admin/admins/bulk-unlock', data, { token }),

  getRoles: (token) =>
    axiosClient.get('/api/admin/roles', { token }),

  getRole: (id, token) =>
    axiosClient.get(`/api/admin/roles/${id}`, { token }),

  createRole: (data, token) =>
    axiosClient.post('/api/admin/roles', data, { token }),

  updateRole: (id, data, token) =>
    axiosClient.put(`/api/admin/roles/${id}`, data, { token }),

  deleteRole: (id, token) =>
    axiosClient.delete(`/api/admin/roles/${id}`, { token }),

  getPermissions: (token) =>
    axiosClient.get('/api/admin/permissions', { token }),

  getUserAdminRoles: (userId, token) =>
    axiosClient.get(`/api/admin/users/${userId}/roles`, { token }),

  setUserAdminRoles: (userId, roleIds, token) =>
    axiosClient.put(`/api/admin/users/${userId}/roles`, roleIds, { token }),
};
