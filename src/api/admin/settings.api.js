import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminSettingsApi = {
  getSettings: (token) =>
    axiosClient.get('/api/admin/settings/search', { token }),

  searchSettings: (params, token) =>
    axiosClient.get(`/api/admin/settings/search${queryString({ limit: 200, ...params })}`, { token }),

  updateSettings: (data, token) =>
    axiosClient.put('/api/admin/settings/bulk-update', data, { token }),

  backupSettings: (token) =>
    axiosClient.post('/api/admin/settings/backup', {}, { token }),

  restoreSettings: (data, token) =>
    axiosClient.post('/api/admin/settings/restore', data, { token }),

  getSepayStatus: (token) =>
    axiosClient.get('/api/admin/webhooks/sepay/status', { token }),

  getSepayLogs: (token) =>
    axiosClient.get('/api/admin/webhooks/sepay/logs?limit=30', { token }),

  getSepayConfig: (token) =>
    axiosClient.get('/api/admin/webhooks/sepay/config', { token }),

  updateSepayConfig: (data, token) =>
    axiosClient.put('/api/admin/webhooks/sepay/config', data, { token }),

  retrySepayWebhook: (data, token) =>
    axiosClient.post('/api/admin/webhooks/sepay/retry', data, { token }),

  getSettingHistory: (key, token) =>
    axiosClient.get(`/api/admin/settings/${encodeURIComponent(key)}/history?limit=50`, { token }),
};
