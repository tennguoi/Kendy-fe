import axiosClient from '../../lib/api';
import { queryString } from '../queryString';

export const adminServicesApi = {
  getServiceCategories: (token) =>
    axiosClient.get('/api/admin/service-categories', { token }),

  getServiceCategory: (id, token) =>
    axiosClient.get(`/api/admin/service-categories/${id}`, { token }),

  createServiceCategory: (data, token) =>
    axiosClient.post('/api/admin/service-categories', data, { token }),

  updateServiceCategory: (id, data, token) =>
    axiosClient.put(`/api/admin/service-categories/${id}`, data, { token }),

  deleteServiceCategory: (id, token) =>
    axiosClient.delete(`/api/admin/service-categories/${id}`, { token }),

  getServices: (token) =>
    axiosClient.get('/api/admin/services/search?limit=200&sort=sort_order', { token }),

  searchServices: (params, token) =>
    axiosClient.get(`/api/admin/services/search${queryString({ limit: 100, sort: 'sort_order', ...params })}`, { token }),

  getServiceCategoryLinks: (id, token) =>
    axiosClient.get(`/api/admin/services/${id}/categories`, { token }),

  createService: (data, token) =>
    axiosClient.post('/api/admin/services', data, { token }),

  updateService: (id, data, token) =>
    axiosClient.put(`/api/admin/services/${id}`, data, { token }),

  updateServiceStatus: (id, data, token) =>
    axiosClient.patch(`/api/admin/services/${id}/status`, data, { token }),

  deleteService: (id, token) =>
    axiosClient.delete(`/api/admin/services/${id}`, { token }),

  bulkEnableServices: (data, token) =>
    axiosClient.post('/api/admin/services/bulk-enable', data, { token }),

  bulkDisableServices: (data, token) =>
    axiosClient.post('/api/admin/services/bulk-disable', data, { token }),

  getServiceOrders: (id, token) =>
    axiosClient.get(`/api/admin/services/${id}/orders?limit=20`, { token }),

  getServiceCredentials: (id, token, params = {}) =>
    axiosClient.get(`/api/admin/services/${id}/credentials${queryString({ limit: 100, ...params })}`, { token }),

  createServiceCredential: (id, data, token) =>
    axiosClient.post(`/api/admin/services/${id}/credentials`, data, { token }),

  updateServiceCredential: (id, data, token) =>
    axiosClient.put(`/api/admin/credentials/${id}`, data, { token }),

  disableServiceCredential: (id, token) =>
    axiosClient.delete(`/api/admin/credentials/${id}`, { token }),

  revealServiceCredential: (id, token) =>
    axiosClient.post(`/api/admin/credentials/${id}/reveal`, {}, { token }),

  bulkImportServiceCredentials: (id, data, token) =>
    axiosClient.post(`/api/admin/services/${id}/credentials/bulk-import`, data, { token }),

  getCredentialsAlerts: (token, params = {}) =>
    axiosClient.get(`/api/admin/credentials/alerts${queryString(params)}`, { token }),

  getPricing: (token) =>
    axiosClient.get('/api/admin/pricing?limit=200&sort=sort_order', { token }),

  searchPricing: (params, token) =>
    axiosClient.get(`/api/admin/pricing/search${queryString({ limit: 100, sort: 'sort_order', ...params })}`, { token }),
};
