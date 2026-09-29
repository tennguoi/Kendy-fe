import { useMemo } from 'react'
import {
  STATUS_FAILED,
  STATUS_PENDING,
  STATUS_SUCCESS,
  countStatus,
  firstNumber,
  normalizeStatus,
  percent,
  pickNumber,
  safeArray,
  safeNumber,
  sumBy,
} from '../overview.utils'

export function useOverviewMetrics({
  bankTransactions = [],
  categories = [],
  dashboard = {},
  dashboardSummary = {},
  pricingItems = [],
  revenue = {},
  revenueChart = [],
  servicePerformance = [],
  services = [],
  userActivity = {},
}) {
  const data = useMemo(() => {
    const revenueRows = safeArray(revenueChart).slice(-30)
    const revenueRows14 = revenueRows.slice(-14)
    const revenueRows7 = revenueRows.slice(-7)
    const serviceRows = safeArray(servicePerformance)
    const serviceMaxOrders = Math.max(1, ...serviceRows.map((item) => safeNumber(item.orderCount)))
    const topCustomers = safeArray(dashboardSummary?.topCustomers || revenue?.topCustomers || userActivity?.topCustomers).slice(0, 8)
    const userGrowth = safeArray(userActivity?.dailyNewUsers || userActivity?.growth || userActivity?.userGrowth).slice(-14)

    const totalOrders = firstNumber(dashboardSummary?.orders, dashboard?.totalOrders, dashboard?.orders)
    const completedOrders = firstNumber(dashboardSummary?.completedOrders, dashboard?.completedOrders)
    const processingOrders = firstNumber(dashboard?.processingOrders, dashboardSummary?.processingOrders)
    const pendingTickets = firstNumber(dashboard?.pendingAdminTickets, dashboardSummary?.pendingAdminTickets)
    const todayRevenue = firstNumber(dashboard?.todayRevenue, revenue?.todayRevenue)
    const monthRevenue = firstNumber(revenue?.monthRevenue, revenue?.monthlyRevenue, revenue?.currentMonthRevenue, dashboard?.monthRevenue)
    const walletBalance = firstNumber(revenue?.walletLiability, dashboard?.totalWalletBalance, dashboardSummary?.walletLiability)
    const newUsersToday = firstNumber(userActivity?.newUsersToday, dashboard?.newUsersToday)
    const newUsersMonth = firstNumber(userActivity?.newUsersThisMonth, userActivity?.monthlyNewUsers, dashboard?.newUsersThisMonth)
    const lockedUsers = firstNumber(userActivity?.lockedUsers, dashboardSummary?.lockedUsers)
    const activeServices = safeArray(services).filter((item) => normalizeStatus(item.status) === 'ACTIVE').length
    const manualProcessingOrders = firstNumber(dashboard?.manualProcessingOrders)
    const openWarrantyRequests = firstNumber(dashboard?.openWarrantyRequests)
    const lowStockServices = firstNumber(dashboard?.lowStockServices)
    const expiringCredentials = firstNumber(dashboard?.expiringCredentials)
    const featuredServices = safeArray(pricingItems).filter((item) => item.featured).length
    const consultingOnly = safeArray(pricingItems).filter((item) => normalizeStatus(item.stockStatus) === 'CONSULTING_ONLY').length

    const bankSuccess = countStatus(bankTransactions, STATUS_SUCCESS)
    const bankPending = countStatus(bankTransactions, STATUS_PENDING)
    const bankFailed = countStatus(bankTransactions, STATUS_FAILED)
    const manualReviewBankTransactions = firstNumber(
      dashboard?.manualReviewBankTransactions,
      dashboardSummary?.manualReviewBankTransactions,
      safeArray(bankTransactions).filter((item) => ['MANUAL_REVIEW', 'UNMATCHED'].includes(normalizeStatus(item.status || item.matchStatus))).length,
    )

    return {
      activeServices,
      bankFailed,
      bankPending,
      bankSuccess,
      completedOrders,
      consultingOnly,
      expiringCredentials,
      featuredServices,
      lockedUsers,
      lowStockServices,
      manualProcessingOrders,
      manualReviewBankTransactions,
      monthRevenue,
      newUsersMonth,
      newUsersToday,
      openWarrantyRequests,
      pendingTickets,
      processingOrders,
      revenueRows,
      revenueRows14,
      revenueRows7,
      serviceMaxOrders,
      serviceRows,
      todayRevenue,
      topCustomers,
      totalDeposits7: sumBy(revenueRows7, ['depositVolume', 'depositAmount', 'deposits']),
      totalOrders,
      totalRefunds7: sumBy(revenueRows7, ['refunds', 'refundAmount', 'failedAmount']),
      totalRevenue14: sumBy(revenueRows14, ['grossRevenue', 'revenue', 'amount']),
      userGrowth,
      walletBalance,
    }
  }, [bankTransactions, categories, dashboard, dashboardSummary, pricingItems, revenue, revenueChart, servicePerformance, services, userActivity])

  const completionRate = percent(data.completedOrders, data.totalOrders)
  const latestRevenue = pickNumber(data.revenueRows.at(-1), ['grossRevenue', 'revenue', 'amount'])
  const previousRevenue = pickNumber(data.revenueRows.at(-2), ['grossRevenue', 'revenue', 'amount'])
  const latestOrders = pickNumber(data.revenueRows.at(-1), ['orderCount', 'orders', 'completedOrders'])
  const previousOrders = pickNumber(data.revenueRows.at(-2), ['orderCount', 'orders', 'completedOrders'])

  return {
    completionRate,
    data,
    latestOrders,
    latestRevenue,
    previousOrders,
    previousRevenue,
  }
}
