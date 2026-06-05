import axiosClient from '../../lib/api';

export const adminNotificationsApi = {
  getAdminNotifications: (token) =>
    axiosClient.get('/api/admin/notifications?limit=50', { token }),

  markNotificationRead: (id, token) =>
    axiosClient.post(`/api/admin/notifications/${id}/read`, {}, { token }),

  bulkReadNotifications: (data, token) =>
    axiosClient.post('/api/admin/notifications/bulk-read', data, { token }),

  getNotificationSettings: (token) =>
    axiosClient.get('/api/admin/notifications/settings', { token }),

  updateNotificationSettings: (data, token) =>
    axiosClient.put('/api/admin/notifications/settings', data, { token }),
};
