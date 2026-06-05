import axiosClient from '../../lib/api';

export const adminDashboardApi = {
  getDashboard: (token) =>
    axiosClient.get('/api/admin/dashboard', { token }),

  getDashboardSummary: (token) =>
    axiosClient.get('/api/admin/dashboard/summary', { token }),

  getRevenueChart: (token) =>
    axiosClient.get('/api/admin/dashboard/revenue-chart?days=14', { token }),

  getUserActivity: (token) =>
    axiosClient.get('/api/admin/dashboard/user-activity', { token }),

  getServicePerformance: (token) =>
    axiosClient.get('/api/admin/dashboard/service-performance?limit=10', { token }),
};
