import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminContentApi = {
  listContent: (params, token) =>
    axiosClient.get(`/api/admin/content${queryString({ limit: 200, ...params })}`, { token }),

  createContent: (data, token) =>
    axiosClient.post('/api/admin/content', data, { token }),

  updateContent: (id, data, token) =>
    axiosClient.put(`/api/admin/content/${id}`, data, { token }),

  deleteContent: (id, token) =>
    axiosClient.delete(`/api/admin/content/${id}`, { token }),
};
