import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminUsersApi = {
  getUsers: (token) =>
    axiosClient.get('/api/admin/users?size=100', { token }),

  searchUsers: (params, token) =>
    axiosClient.get(`/api/admin/users/search${queryString({ size: 50, ...params })}`, { token }),

  getUserDetail: (userId, token) =>
    axiosClient.get(`/api/admin/users/${userId}`, { token }),

  getUserOrders: (userId, token) =>
    axiosClient.get(`/api/admin/users/${userId}/orders?size=20`, { token }),

  getUserWalletTransactions: (userId, token) =>
    axiosClient.get(`/api/admin/users/${userId}/wallet-transactions?size=20`, { token }),

  getUserTickets: (userId, token) =>
    axiosClient.get(`/api/admin/users/${userId}/tickets?size=20`, { token }),

  getUserSessions: (userId, token) =>
    axiosClient.get(`/api/admin/users/${userId}/sessions?size=20`, { token }),

  updateUserStatus: (userId, data, token) =>
    axiosClient.patch(`/api/admin/users/${userId}/status`, data, { token }),

  updateUserRole: (userId, data, token) =>
    axiosClient.patch(`/api/admin/users/${userId}/role`, data, { token }),

  adjustWallet: (userId, data, token) =>
    axiosClient.post(`/api/admin/users/${userId}/wallet-adjustments`, data, { token }),

  revokeUserSession: (userId, sessionId, token) =>
    axiosClient.delete(`/api/admin/users/${userId}/sessions/${sessionId}`, { token }),

  bulkLockUsers: (data, token) =>
    axiosClient.post('/api/admin/users/bulk-lock', data, { token }),

  bulkUnlockUsers: (data, token) =>
    axiosClient.post('/api/admin/users/bulk-unlock', data, { token }),
};
