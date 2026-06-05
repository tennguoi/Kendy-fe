import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const userWalletApi = {
  getWallet: (token) =>
    axiosClient.get('/api/wallet', { token }),

  getWalletTransactions: (params, token) =>
    axiosClient.get(`/api/wallet/transactions${queryString({ size: 20, ...params })}`, { token }),

  searchWalletTransactions: (params, token) =>
    axiosClient.get(`/api/wallet/transactions/search${queryString({ size: 50, ...params })}`, { token }),

  getWalletTransaction: (id, token) =>
    axiosClient.get(`/api/wallet/transactions/${id}`, { token }),
};
