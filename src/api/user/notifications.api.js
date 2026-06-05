import axiosClient from '../../lib/api';

export const userNotificationsApi = {
  getNotifications: (token) =>
    axiosClient.get('/api/notifications?size=20', { token }),

  getUnreadNotificationCount: (token) =>
    axiosClient.get('/api/notifications/unread-count', { token }),

  markNotificationRead: (id, token) =>
    axiosClient.post(`/api/notifications/${id}/read`, {}, { token }),

  bulkReadNotifications: (data, token) =>
    axiosClient.post('/api/notifications/bulk-read', data, { token }),

  getNotificationSettings: (token) =>
    axiosClient.get('/api/notifications/settings', { token }),

  updateNotificationSettings: (data, token) =>
    axiosClient.put('/api/notifications/settings', data, { token }),
};
