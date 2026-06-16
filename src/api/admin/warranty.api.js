import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminWarrantyApi = {
  getWarranties: (token, params = {}) =>
    axiosClient.get(`/api/admin/warranty-requests${queryString(params)}`, { token }),

  reviewWarranty: (id, data, token) =>
    axiosClient.post(`/api/admin/warranty-requests/${id}/review`, data, { token }),
};
