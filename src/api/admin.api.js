import axiosClient from '../lib/api';

export const adminApi = {
  getServiceCategories: (token) => 
    axiosClient.get('/api/admin/service-categories', { token }),
    
  createServiceCategory: (data, token) => 
    axiosClient.post('/api/admin/service-categories', data, { token }),
    
  getServices: (token) => 
    axiosClient.get('/api/admin/services/search?limit=200&sort=sort_order', { token }),
    
  createService: (data, token) => 
    axiosClient.post('/api/admin/services', data, { token }),
    
  updateService: (id, data, token) => 
    axiosClient.put(`/api/admin/services/${id}`, data, { token }),
    
  getPricing: (token) => 
    axiosClient.get('/api/admin/pricing?limit=200&sort=sort_order', { token }),
    
  getSettings: (token) => 
    axiosClient.get('/api/admin/settings/search', { token }),
};
