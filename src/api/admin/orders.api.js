import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminOrdersApi = {
  getOrders: (token) =>
    axiosClient.get('/api/admin/orders?size=100', { token }),

  searchOrders: (params, token) =>
    axiosClient.get(`/api/admin/orders/search${queryString({ size: 50, ...params })}`, { token }),

  getOrder: (orderCode, token) =>
    axiosClient.get(`/api/admin/orders/${orderCode}`, { token }),

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

  updateOrderUserNote: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/user-note`, data, { token }),

  extendOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/extend`, data, { token }),

  reprocessOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/admin/orders/${orderCode}/reprocess`, data, { token }),

  bulkRefundOrders: (data, token) =>
    axiosClient.post('/api/admin/orders/bulk-refund', data, { token }),
};
