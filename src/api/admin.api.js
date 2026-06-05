import axiosClient from '../lib/api';

export const adminApi = {
  getServiceCategories: (token) => 
    axiosClient.get('/api/admin/service-categories', { token }),
    
  createServiceCategory: (data, token) => 
    axiosClient.post('/api/admin/service-categories', data, { token }),
    
  getServices: (token) => 
    axiosClient.get('/api/admin/services/search?limit=200&sort=sort_order', { token }),
    
  createService: (data, token) => 
    axiosClient.post('/api/admin/services', data, { token }),
    
  updateService: (id, data, token) => 
    axiosClient.put(`/api/admin/services/${id}`, data, { token }),
    
  getPricing: (token) => 
    axiosClient.get('/api/admin/pricing?limit=200&sort=sort_order', { token }),
    
  getSettings: (token) => 
    axiosClient.get('/api/admin/settings/search', { token }),

  updateSettings: (data, token) =>
    axiosClient.put('/api/admin/settings/bulk-update', data, { token }),

  getDashboard: (token) =>
    axiosClient.get('/api/admin/dashboard', { token }),

  getUsers: (token) =>
    axiosClient.get('/api/admin/users?size=100', { token }),

  updateUserStatus: (userId, data, token) =>
    axiosClient.patch(`/api/admin/users/${userId}/status`, data, { token }),

  adjustWallet: (userId, data, token) =>
    axiosClient.post(`/api/admin/users/${userId}/wallet-adjustments`, data, { token }),

  getOrders: (token) =>
    axiosClient.get('/api/admin/orders?size=100', { token }),

  getDeposits: (token) =>
    axiosClient.get('/api/admin/deposit-requests?size=100', { token }),

  getBankTransactions: (token) =>
    axiosClient.get('/api/admin/bank-transactions?size=100', { token }),

  getWalletTransactions: (token) =>
    axiosClient.get('/api/admin/wallet-transactions?size=100', { token }),

  getRevenueReport: (token) =>
    axiosClient.get('/api/admin/reports/revenue', { token }),

  getTickets: (token) =>
    axiosClient.get('/api/admin/tickets?limit=100', { token }),

  sendTicketMessage: (ticketCode, data, token) =>
    axiosClient.post(`/api/admin/tickets/${ticketCode}/messages`, data, { token }),

  updateTicket: (ticketCode, data, token) =>
    axiosClient.post(`/api/admin/tickets/${ticketCode}/update`, data, { token }),
};
