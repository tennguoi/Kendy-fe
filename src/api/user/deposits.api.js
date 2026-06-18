import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const userDepositsApi = {
  createDeposit: (data, token) =>
    axiosClient.post('/api/deposits', data, { token }),

  getDeposits: (params = {}, token) =>
    axiosClient.get(`/api/deposits${queryString({ size: 20, page: 0, ...params })}`, { token }),

  getDeposit: (depositCode, token) =>
    axiosClient.get(`/api/deposits/${depositCode}`, { token }),

  getDepositStatus: (depositCode, token) =>
    axiosClient.get(`/api/deposits/${depositCode}/status`, { token }),

  getDepositQr: (depositCode, token) =>
    axiosClient.get(`/api/deposits/${depositCode}/qr`, { token }),

  cancelDeposit: (depositCode, data, token) =>
    axiosClient.post(`/api/deposits/${depositCode}/cancel`, data || {}, { token }),
};
