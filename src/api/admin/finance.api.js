import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminFinanceApi = {
  getDeposits: (token) =>
    axiosClient.get('/api/admin/deposit-requests?size=100', { token }),

  searchDeposits: (params, token) =>
    axiosClient.get(`/api/admin/deposit-requests/search${queryString({ size: 50, ...params })}`, { token }),

  getDeposit: (depositCode, token) =>
    axiosClient.get(`/api/admin/deposit-requests/${depositCode}`, { token }),

  getExpiredDeposits: (token) =>
    axiosClient.get('/api/admin/deposit-requests/expired?limit=50', { token }),

  getManualReviewDeposits: (token) =>
    axiosClient.get('/api/admin/deposit-requests/manual-review?limit=50', { token }),

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

  getBankTransaction: (id, token) =>
    axiosClient.get(`/api/admin/bank-transactions/${id}`, { token }),

  getManualReviewBankTransactions: (token) =>
    axiosClient.get('/api/admin/bank-transactions/manual-review?limit=50', { token }),

  getDuplicateBankTransactions: (token) =>
    axiosClient.get('/api/admin/bank-transactions/duplicate?limit=50', { token }),

  getIgnoredBankTransactions: (token) =>
    axiosClient.get('/api/admin/bank-transactions/ignored?limit=50', { token }),

  matchBankTransaction: (id, data, token) =>
    axiosClient.post(`/api/admin/bank-transactions/${id}/match`, data, { token }),

  manualCreditBankTransaction: (id, data, token) =>
    axiosClient.post(`/api/admin/bank-transactions/${id}/manual-credit`, data, { token }),

  bulkManualCreditBankTransactions: (data, token) =>
    axiosClient.post('/api/admin/bank-transactions/bulk-manual-credit', data, { token }),

  reprocessBankTransaction: (id, data, token) =>
    axiosClient.post(`/api/admin/bank-transactions/${id}/reprocess`, data, { token }),

  ignoreBankTransaction: (id, data, token) =>
    axiosClient.post(`/api/admin/bank-transactions/${id}/ignore`, data, { token }),

  getWalletTransactions: (token) =>
    axiosClient.get('/api/admin/wallet-transactions?size=100', { token }),

  searchWalletTransactions: (params, token) =>
    axiosClient.get(`/api/admin/wallet-transactions/search${queryString({ size: 50, ...params })}`, { token }),

  getWalletTransactionDetail: (id, token) =>
    axiosClient.get(`/api/admin/wallet-transactions/${id}/details`, { token }),

  getBalanceCheck: (token) =>
    axiosClient.get('/api/admin/wallet-transactions/balance-check', { token }),

  getBalanceIntegrityReport: (token) =>
    axiosClient.get('/api/admin/reports/balance-integrity', { token }),

  reconcileWallet: (token) =>
    axiosClient.post('/api/admin/wallet-transactions/reconciliation', {}, { token }),

  getRevenueReport: (token) =>
    axiosClient.get('/api/admin/reports/revenue', { token }),

  getRevenueReportForRange: (params, token) =>
    axiosClient.get(`/api/admin/reports/revenue${queryString(params)}`, { token }),

  exportReport: (type, token, format) => {
    const isXlsx = format === 'xlsx'
    const params = isXlsx ? { params: { format: 'xlsx' } } : {}
    return axiosClient.get(`/api/admin/reports/${type}/export`, {
      ...params,
      token,
      responseType: isXlsx ? 'blob' : 'text',
    })
  },
};
