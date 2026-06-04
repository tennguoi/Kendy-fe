import axiosClient from '../lib/api';

export const userApi = {
  getMe: (token) => 
    axiosClient.get('/api/me', { token }),
    
  getWallet: (token) => 
    axiosClient.get('/api/wallet', { token }),
    
  getOrders: (token) => 
    axiosClient.get('/api/orders', { token }),
    
  createDeposit: (data, token) => 
    axiosClient.post('/api/deposits', data, { token }),
    
  createOrder: (data, token) => 
    axiosClient.post('/api/orders', data, { token }),
};
