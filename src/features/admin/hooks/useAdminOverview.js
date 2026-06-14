import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import { normalizeList, settledValue } from '../../../utils/appHelpers'

const initialAdminOverview = {
  auditLogs: [],
  bankTransactions: [],
  categories: [],
  dashboard: null,
  dashboardSummary: null,
  error: '',
  health: null,
  pricing: [],
  revenue: null,
  revenueChart: [],
  servicePerformance: [],
  services: [],
  userActivity: null,
}

export function useAdminOverview(accessToken, isAdmin) {
  const [state, setState] = useState(initialAdminOverview)

  const resetAdminOverview = useCallback(() => {
    setState(initialAdminOverview)
  }, [])

  useEffect(() => {
    if (!accessToken || !isAdmin) {
      return
    }

    let cancelled = false

    Promise.allSettled([
      adminApi.getDashboard(accessToken),
      adminApi.getRevenueReport(accessToken),
      adminApi.getServiceCategories(accessToken),
      adminApi.getServices(accessToken),
      adminApi.getPricing(accessToken),
      adminApi.getDashboardSummary(accessToken),
      adminApi.getRevenueChart(accessToken),
      adminApi.getServicePerformance(accessToken),
      adminApi.getUserActivity(accessToken),
      adminApi.getHealth(accessToken),
      adminApi.getAuditLogs({ limit: 12 }, accessToken),
      adminApi.getBankTransactions(accessToken),
    ]).then((results) => {
      if (cancelled) return
      setState({
        auditLogs: normalizeList(settledValue(results[10], [])),
        bankTransactions: normalizeList(settledValue(results[11], [])),
        categories: settledValue(results[2], []),
        dashboard: settledValue(results[0], null),
        dashboardSummary: settledValue(results[5], null),
        error: results.some((result) => result.status === 'rejected')
          ? 'Một phần dữ liệu tổng quan admin chưa tải được.'
          : '',
        health: settledValue(results[9], null),
        pricing: settledValue(results[4], []),
        revenue: settledValue(results[1], null),
        revenueChart: settledValue(results[6], []),
        servicePerformance: settledValue(results[7], []),
        services: settledValue(results[3], []),
        userActivity: settledValue(results[8], null),
      })
    }).catch(() => {
      if (!cancelled) {
        setState((current) => ({
          ...current,
          error: 'Không tải được dữ liệu tổng quan admin. Kiểm tra quyền hoặc trạng thái backend.',
        }))
      }
    })

    return () => {
      cancelled = true
    }
  }, [accessToken, isAdmin])

  return {
    adminOverview: state,
    resetAdminOverview,
  }
}
