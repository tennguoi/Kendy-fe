import axiosClient from '../../lib/api';

export const userCouponsApi = {
  validateCoupon: (data, token) =>
    axiosClient.post('/api/coupons/validate', data, { token }),
};
