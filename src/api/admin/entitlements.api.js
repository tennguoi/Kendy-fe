import axiosClient from '../../lib/api'
import { queryString } from '../queryString'

export const adminEntitlementsApi = {
  getEntitlements: (token, params = {}) =>
    axiosClient.get(`/api/admin/entitlements${queryString({ limit: 300, ...params })}`, { token }),

  updateEntitlement: (id, data, token) =>
    axiosClient.patch(`/api/admin/entitlements/${id}`, data, { token }),
}
