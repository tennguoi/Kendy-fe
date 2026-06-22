import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const userOrdersApi = {
  getOrders: (token) =>
    axiosClient.get('/api/orders', { token }),

  searchOrders: (params = {}, token) =>
    axiosClient.get(`/api/orders/search${queryString({ size: 50, page: 0, ...params })}`, { token }),

  getOrder: (orderCode, token) =>
    axiosClient.get(`/api/orders/${orderCode}`, { token }),

  createOrder: (data, token) =>
    axiosClient.post('/api/orders', data, { token }),

  cancelOrder: (orderCode, data, token) =>
    axiosClient.post(`/api/orders/${orderCode}/cancel`, data, { token }),
};
