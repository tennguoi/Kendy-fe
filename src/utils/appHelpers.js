import { userApi } from '../api/user.api'
import { adminNavItems } from '../features/admin/adminNavigation'
import { navItems } from '../features/user/navigation'
import { readOAuthCallback } from './oauthCallback'

export const initialOAuthCallback = readOAuthCallback()
export const adminRoutePaths = [...adminNavItems.map((item) => item.path), '/admin/settings', '/admin/profile']
export const MIN_DEPOSIT_AMOUNT = 1000

export async function fetchUserBootstrap(token) {
  const me = await userApi.getMe(token)
  const results = await Promise.allSettled([
    userApi.getWallet(token),
    userApi.getDashboard(token),
    userApi.getUnreadNotificationCount(token),
  ])

  return {
    dashboardData: settledValue(results[1], null),
    me,
    notificationCount: settledValue(results[2], { unread: 0 }),
    walletData: settledValue(results[0], null),
  }
}

export function settledValue(result, fallback) {
  return result.status === 'fulfilled' ? result.value : fallback
}

export function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const keys = ['content', 'items', 'data', 'records', 'results']
  const list = keys.map((key) => value[key]).find(Array.isArray)
  return list || []
}

export function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

export function resolveServiceId(service) {
  return service?.id ?? service?.serviceId
}

export function purchaseErrorMessage(error, t = (key) => key) {
  if (!error) return t('orderPurchaseError', 'Không tạo được đơn.')
  const code = error.code || ''
  const codeKey = `errorCodes.${code}`
  const translated = t(codeKey)
  if (translated && translated !== codeKey) return translated
  return error.message || t('orderPurchaseError', 'Không tạo được đơn.')
}

export function notificationRoute(actionUrl) {
  if (!actionUrl) {
    return ''
  }
  if (actionUrl.startsWith('/orders')) {
    return '/orders'
  }
  if (actionUrl.startsWith('/deposits')) {
    return '/deposit'
  }
  if (actionUrl.startsWith('/tickets')) {
    return '/support'
  }
  return actionUrl
}

export function depositStatusNotice(depositCode, status, t = (key) => key) {
  const normalizedStatus = String(status || '').toUpperCase()
  if (normalizedStatus === 'COMPLETED') {
    return {
      message: t('depositNoticeCompleted', { defaultValue: `Yêu cầu nạp ${depositCode} đã hoàn tất.` }),
      title: t('depositCompleted', { defaultValue: 'Đã nhận tiền' }),
      type: 'success',
    }
  }

  if (normalizedStatus === 'PENDING') {
    return {
      message: t('depositNoticePending', { defaultValue: `Yêu cầu nạp ${depositCode} vẫn đang chờ thanh toán.` }),
      title: t('depositPending', { defaultValue: 'Đang chờ' }),
      type: 'info',
    }
  }

  if (normalizedStatus === 'MANUAL_REVIEW') {
    return {
      message: t('depositNoticeManualReview', { defaultValue: `Yêu cầu nạp ${depositCode} cần admin kiểm tra thủ công.` }),
      title: t('depositManualReview', { defaultValue: 'Cần kiểm tra' }),
      type: 'error',
    }
  }

  if (normalizedStatus === 'CANCELLED') {
    return {
      message: t('depositNoticeCancelled', { defaultValue: `Yêu cầu nạp ${depositCode} đã bị hủy.` }),
      title: t('depositCancelled', { defaultValue: 'Đã hủy' }),
      type: 'error',
    }
  }

  return {
    message: t('depositNoticeUpdated', { defaultValue: `Trạng thái ${depositCode}: ${normalizedStatus}.` }),
    title: t('depositUpdated', { defaultValue: 'Đã cập nhật' }),
    type: 'info',
  }
}

export function resolveAdminActiveView(pathname) {
  if (pathname === '/admin/profile') {
    return 'admin-profile'
  }
  if (pathname === '/admin/settings') {
    return 'admin-settings'
  }
  return adminNavItems.find((item) => item.path === pathname)?.id || 'admin-overview'
}

export function resolveUserActiveView(pathname) {
  if (pathname === '/settings' || pathname === '/profile') {
    return 'profile'
  }
  return navItems.find((item) => item.path === pathname)?.id || 'overview'
}
