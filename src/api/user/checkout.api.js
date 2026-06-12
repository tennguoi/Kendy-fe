import axiosClient from '../../lib/api';

export const userCheckoutApi = {
  createServiceCheckout: (data, token) =>
    axiosClient.post('/api/checkout/service', data, { token }),

  getCheckoutStatus: (checkoutCode, token) =>
    axiosClient.get(`/api/checkout/${checkoutCode}/status`, { token }),
};
