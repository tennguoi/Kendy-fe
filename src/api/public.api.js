import axiosClient from '../lib/api';

export const publicApi = {
  getServices: (params) => 
    axiosClient.get(`/api/services${params ? '?' + new URLSearchParams(params).toString() : ''}`),

  getPricing: (params) =>
    axiosClient.get(`/api/pricing${params ? '?' + new URLSearchParams(params).toString() : ''}`),

  getCategories: () =>
    axiosClient.get('/api/service-categories'),

  getServiceBySlug: (slug) =>
    axiosClient.get(`/api/services/${slug}`),
};
