import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const userWarrantyApi = {
  createWarranty: (orderCode, data, token) =>
    axiosClient.post(`/api/orders/${orderCode}/warranty`, data, { token }),

  getWarranties: (token, params = {}) =>
    axiosClient.get(`/api/warranty-requests${queryString({ page: 0, limit: 20, ...params })}`, { token }),
};
