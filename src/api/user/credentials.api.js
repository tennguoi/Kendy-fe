import axiosClient from '../../lib/api'
import { queryString } from '../queryString'

export const userCredentialsApi = {
  getMyCredentials: (token, params = {}) =>
    axiosClient.get(`/api/me/credentials${queryString({ limit: 100, ...params })}`, { token }),

  getMyEntitlements: (token, params = {}) =>
    axiosClient.get(`/api/me/entitlements${queryString({ limit: 100, ...params })}`, { token }),

  requestEntitlementRenewal: (id, token) =>
    axiosClient.post(`/api/me/entitlements/${id}/renew`, {}, { token }),
}
