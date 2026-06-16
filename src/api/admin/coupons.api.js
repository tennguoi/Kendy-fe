import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminCouponsApi = {
  getCoupons: (params, token) =>
    axiosClient.get(`/api/admin/coupons${queryString({ limit: 200, ...params })}`, { token }),

  createCoupon: (data, token) =>
    axiosClient.post('/api/admin/coupons', data, { token }),

  updateCoupon: (id, data, token) =>
    axiosClient.put(`/api/admin/coupons/${id}`, data, { token }),

  enableCoupon: (id, token) =>
    axiosClient.post(`/api/admin/coupons/${id}/enable`, {}, { token }),

  disableCoupon: (id, token) =>
    axiosClient.post(`/api/admin/coupons/${id}/disable`, {}, { token }),
};
