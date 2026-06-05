import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminAuditApi = {
  getAuditLogs: (params, token) =>
    axiosClient.get(`/api/admin/audit-logs/search${queryString({ limit: 50, ...params })}`, { token }),

  listAuditLogs: (params, token) =>
    axiosClient.get(`/api/admin/audit-logs${queryString(params)}`, { token }),

  getAuditLogDetail: (id, token) =>
    axiosClient.get(`/api/admin/audit-logs/${id}/details`, { token }),

  getAdminActions: (adminId, params, token) =>
    axiosClient.get(`/api/admin/audit-logs/admin-actions${queryString({ adminId, limit: 50, ...params })}`, { token }),

  exportAuditLogs: (token, format) =>
    axiosClient.get(`/api/admin/audit-logs/export${queryString(format === 'xlsx' ? { format } : {})}`, {
      token,
      responseType: format === 'xlsx' ? 'blob' : 'text',
    }),
};
