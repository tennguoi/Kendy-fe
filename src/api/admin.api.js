import axiosClient from '../lib/api';

function queryString(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })
  const value = search.toString()
  return value ? `?${value}` : ''
}

export const adminApi = {
  getServiceCategories: (token) =>
    axiosClient.get('/api/admin/service-categories', { token }),

  createServiceCategory: (data, token) =>
    axiosClient.post('/api/admin/service-categories', data, { token }),

  updateServiceCategory: (id, data, token) =>
    axiosClient.put(`/api/admin/service-categories/${id}`, data, { token }),

  deleteServiceCategory: (id, token) =>
    axiosClient.delete(`/api/admin/service-categories/${id}`, { token }),

  getServices: (token) =>
    axiosClient.get('/api/admin/services/search?limit=200&sort=sort_order', { token }),

  searchServices: (params, token) =>
    axiosClient.get(`/api/admin/services/search${queryString({ limit: 100, sort: 'sort_order', ...params })}`, { token }),

  createService: (data, token) =>
    axiosClient.post('/api/admin/services', data, { token }),

  updateService: (id, data, token) =>
    axiosClient.put(`/api/admin/services/${id}`, data, { token }),

  updateServiceStatus: (id, data, token) =>
    axiosClient.patch(`/api/admin/services/${id}/status`, data, { token }),

  deleteService: (id, token) =>
    axiosClient.delete(`/api/admin/services/${id}`, { token }),

  bulkEnableServices: (data, token) =>
    axiosClient.post('/api/admin/services/bulk-enable', data, { token }),

  bulkDisableServices: (data, token) =>
    axiosClient.post('/api/admin/services/bulk-disable', data, { token }),

  getServiceOrders: (id, token) =>
    axiosClient.get(`/api/admin/services/${id}/orders?limit=20`, { token }),

  getPricing: (token) =>
    axiosClient.get('/api/admin/pricing?limit=200&sort=sort_order', { token }),

  searchPricing: (params, token) =>
    axiosClient.get(`/api/admin/pricing/search${queryString({ limit: 100, sort: 'sort_order', ...params })}`, { token }),

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

  getAdminNotifications: (token) =>
    axiosClient.get('/api/admin/notifications?limit=50', { token }),

  markNotificationRead: (id, token) =>
    axiosClient.post(`/api/admin/notifications/${id}/read`, {}, { token }),

  getNotificationSettings: (token) =>
    axiosClient.get('/api/admin/notifications/settings', { token }),

  updateNotificationSettings: (data, token) =>
    axiosClient.put('/api/admin/notifications/settings', data, { token }),

  getAdmins: (token) =>
    axiosClient.get('/api/admin/admins?limit=100', { token }),

  getRoles: (token) =>
    axiosClient.get('/api/admin/roles', { token }),

  getPermissions: (token) =>
    axiosClient.get('/api/admin/permissions', { token }),

  getJobs: (token) =>
    axiosClient.get('/api/admin/jobs?limit=50', { token }),

  retryJob: (jobId, token) =>
    axiosClient.post(`/api/admin/jobs/${jobId}/retry`, {}, { token }),

  cancelJob: (jobId, token) =>
    axiosClient.post(`/api/admin/jobs/${jobId}/cancel`, {}, { token }),

  getHealth: (token) =>
    axiosClient.get('/api/admin/health', { token }),

  getDashboard: (token) =>
    axiosClient.get('/api/admin/dashboard', { token }),

  getDashboardSummary: (token) =>
    axiosClient.get('/api/admin/dashboard/summary', { token }),

  getRevenueChart: (token) =>
    axiosClient.get('/api/admin/dashboard/revenue-chart?days=14', { token }),

  getServicePerformance: (token) =>
    axiosClient.get('/api/admin/dashboard/service-performance?limit=10', { token }),

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

  getAuditLogs: (params, token) =>
    axiosClient.get(`/api/admin/audit-logs/search${queryString({ limit: 50, ...params })}`, { token }),

  updateUserStatus: (userId, data, token) =>
    axiosClient.patch(`/api/admin/users/${userId}/status`, data, { token }),

  updateUserRole: (userId, data, token) =>
    axiosClient.patch(`/api/admin/users/${userId}/role`, data, { token }),

  adjustWallet: (userId, data, token) =>
    axiosClient.post(`/api/admin/users/${userId}/wallet-adjustments`, data, { token }),

  revokeUserSession: (userId, sessionId, token) =>
    axiosClient.delete(`/api/admin/users/${userId}/sessions/${sessionId}`, { token }),

  getOrders: (token) =>
    axiosClient.get('/api/admin/orders?size=100', { token }),

  searchOrders: (params, token) =>
    axiosClient.get(`/api/admin/orders/search${queryString({ size: 50, ...params })}`, { token }),

  completeOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/complete`, data, { token }),

  failOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/fail`, data, { token }),

  cancelOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/cancel`, data, { token }),

  refundOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/refund`, data, { token }),

  updateOrderAdminNote: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/admin-note`, data, { token }),

  extendOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/extend`, data, { token }),

  reprocessOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/reprocess`, data, { token }),

  getDeposits: (token) =>
    axiosClient.get('/api/admin/deposit-requests?size=100', { token }),

  searchDeposits: (params, token) =>
    axiosClient.get(`/api/admin/deposit-requests/search${queryString({ size: 50, ...params })}`, { token }),

  cancelDeposit: (depositCode, data, token) =>
    axiosClient.post(`/api/admin/deposit-requests/${depositCode}/cancel`, data, { token }),

  extendDeposit: (depositCode, data, token) =>
    axiosClient.post(`/api/admin/deposit-requests/${depositCode}/extend`, data, { token }),

  manualCreditDeposit: (depositCode, data, token) =>
    axiosClient.post(`/api/admin/deposit-requests/${depositCode}/manual-credit`, data, { token }),

  getBankTransactions: (token) =>
    axiosClient.get('/api/admin/bank-transactions?size=100', { token }),

  searchBankTransactions: (params, token) =>
    axiosClient.get(`/api/admin/bank-transactions/search${queryString({ size: 50, ...params })}`, { token }),

  matchBankTransaction: (id, data, token) =>
    axiosClient.post(`/api/admin/bank-transactions/${id}/match`, data, { token }),

  manualCreditBankTransaction: (id, data, token) =>
    axiosClient.post(`/api/admin/bank-transactions/${id}/manual-credit`, data, { token }),

  reprocessBankTransaction: (id, data, token) =>
    axiosClient.post(`/api/admin/bank-transactions/${id}/reprocess`, data, { token }),

  ignoreBankTransaction: (id, data, token) =>
    axiosClient.post(`/api/admin/bank-transactions/${id}/ignore`, data, { token }),

  getWalletTransactions: (token) =>
    axiosClient.get('/api/admin/wallet-transactions?size=100', { token }),

  searchWalletTransactions: (params, token) =>
    axiosClient.get(`/api/admin/wallet-transactions/search${queryString({ size: 50, ...params })}`, { token }),

  getBalanceCheck: (token) =>
    axiosClient.get('/api/admin/wallet-transactions/balance-check', { token }),

  reconcileWallet: (token) =>
    axiosClient.post('/api/admin/wallet-transactions/reconciliation', {}, { token }),

  getRevenueReport: (token) =>
    axiosClient.get('/api/admin/reports/revenue', { token }),

  getRevenueReportForRange: (params, token) =>
    axiosClient.get(`/api/admin/reports/revenue${queryString(params)}`, { token }),

  exportReport: (type, token) =>
    axiosClient.get(`/api/admin/reports/${type}/export`, { token, responseType: 'text' }),

  getTickets: (token) =>
    axiosClient.get('/api/admin/tickets?limit=100', { token }),

  searchTickets: (params, token) =>
    axiosClient.get(`/api/admin/tickets/search${queryString({ limit: 50, ...params })}`, { token }),

  getTicket: (ticketCode, token) =>
    axiosClient.get(`/api/admin/tickets/${ticketCode}`, { token }),

  sendTicketMessage: (ticketCode, data, token) =>
    axiosClient.post(`/api/admin/tickets/${ticketCode}/messages`, data, { token }),

  updateTicket: (ticketCode, data, token) =>
    axiosClient.post(`/api/admin/tickets/${ticketCode}/update`, data, { token }),

  updateTicketPriority: (ticketCode, data, token) =>
    axiosClient.patch(`/api/admin/tickets/${ticketCode}/priority`, data, { token }),

  updateTicketCategory: (ticketCode, data, token) =>
    axiosClient.patch(`/api/admin/tickets/${ticketCode}/category`, data, { token }),

  getTicketAttachments: (ticketCode, token) =>
    axiosClient.get(`/api/admin/tickets/${ticketCode}/attachments`, { token }),

  uploadTicketAttachment: (ticketCode, file, token) => {
    const data = new FormData()
    data.append('file', file)
    return axiosClient.post(`/api/admin/tickets/${ticketCode}/attachments`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      token,
    })
  },

  deleteTicketAttachment: (ticketCode, attachmentId, token) =>
    axiosClient.delete(`/api/admin/tickets/${ticketCode}/attachments/${attachmentId}`, { token }),

  getTicketResolutionTime: (token) =>
    axiosClient.get('/api/admin/tickets/resolution-time', { token }),
};
