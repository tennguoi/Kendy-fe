import axiosClient from '../../lib/api';

export const userServicesApi = {
  getFavoriteServices: (token) =>
    axiosClient.get('/api/me/favorite-services?size=20', { token }),

  addFavoriteService: (serviceId, token) =>
    axiosClient.post(`/api/me/favorite-services/${serviceId}`, {}, { token }),

  removeFavoriteService: (serviceId, token) =>
    axiosClient.delete(`/api/me/favorite-services/${serviceId}`, { token }),

  getRecentServices: (token) =>
    axiosClient.get('/api/me/recent-services?size=20', { token }),
};
