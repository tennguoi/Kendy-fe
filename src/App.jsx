import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useToast } from './components/Toast'
import { adminNavItems } from './features/admin/adminNavigation'
import { navItems } from './features/user/navigation'
import AdminRoutes from './features/admin/AdminRoutes'
import AuthScreen from './features/auth/AuthScreen'
import DashboardShell from './components/layout/DashboardShell'
import UserRoutes from './features/user/UserRoutes'
import PublicHome from './features/public/PublicHome'
import Loading from './components/Loading/Loading'
import { useClipboard } from './hooks/useClipboard'
import { adminApi } from './api/admin.api'
import { authApi } from './api/auth.api'
import { publicApi } from './api/public.api'
import { userApi } from './api/user.api'
import { toWebSocketUrl } from './lib/api'
import { money } from './utils/currency'
import { createIdempotencyKey } from './utils/idempotency'
import { parseMoneyInput } from './utils/moneyInput'
import { clearOAuthCallbackUrl, readOAuthCallback } from './utils/oauthCallback'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  hasPersistentSession,
  persistAccessToken,
} from './utils/session'

const initialOAuthCallback = readOAuthCallback()
const adminRoutePaths = adminNavItems.map((item) => item.path)
const MIN_DEPOSIT_AMOUNT = 1000

async function fetchUserBootstrap(token) {
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

function settledValue(result, fallback) {
  return result.status === 'fulfilled' ? result.value : fallback
}

function normalizeList(value) {
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

function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function resolveServiceId(service) {
  return service?.id ?? service?.serviceId
}

function purchaseErrorMessage(error) {
  const message = error?.message || ''
  if (message === 'Insufficient wallet balance') {
    return 'Số dư ví không đủ để mua dịch vụ này. Vui lòng nạp thêm tiền.'
  }
  if (message === 'Service requires consultation before purchase') {
    return 'Dịch vụ này cần tư vấn trước khi mua. Vui lòng tạo ticket hỗ trợ.'
  }
  if (message === 'Service price must be greater than zero') {
    return 'Dịch vụ chưa có giá hợp lệ để tạo đơn.'
  }
  return message || 'Không tạo được đơn. Kiểm tra số dư ví hoặc trạng thái dịch vụ.'
}

function notificationRoute(actionUrl) {
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

function depositStatusNotice(depositCode, status) {
  const normalizedStatus = String(status || '').toUpperCase()
  if (normalizedStatus === 'COMPLETED') {
    return {
      message: `Yêu cầu nạp ${depositCode} đã hoàn tất. Số dư đã được cập nhật.`,
      title: 'Đã nhận tiền',
      type: 'success',
    }
  }

  if (normalizedStatus === 'PENDING') {
    return {
      message: `Yêu cầu nạp ${depositCode} vẫn đang chờ thanh toán/webhook SePay.`,
      title: 'Đang chờ',
      type: 'info',
    }
  }

  if (normalizedStatus === 'MANUAL_REVIEW') {
    return {
      message: `Yêu cầu nạp ${depositCode} cần admin kiểm tra thủ công.`,
      title: 'Cần kiểm tra',
      type: 'error',
    }
  }

  if (normalizedStatus === 'CANCELLED') {
    return {
      message: `Yêu cầu nạp ${depositCode} đã bị hủy.`,
      title: 'Đã hủy',
      type: 'error',
    }
  }

  return {
    message: `Trạng thái ${depositCode}: ${normalizedStatus || 'không xác định'}.`,
    title: 'Đã cập nhật',
    type: 'info',
  }
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showAuthScreen, setShowAuthScreen] = useState(() => (
    Boolean(initialOAuthCallback?.error || initialOAuthCallback?.oauthTwoFactorChallenge)
  ))
  const [depositAmount, setDepositAmount] = useState('250000')
  const [accessToken, setAccessToken] = useState(() => initialOAuthCallback?.token || getStoredAccessToken())
  const [rememberSession, setRememberSession] = useState(() => Boolean(initialOAuthCallback?.token) || hasPersistentSession())
  const [currentUser, setCurrentUser] = useState(null)
  const [authInit, setAuthInit] = useState(() => !accessToken)
  const [wallet, setWallet] = useState(null)
  const [apiServices, setApiServices] = useState([])
  const [apiOrders, setApiOrders] = useState([])
  const [apiTickets, setApiTickets] = useState([])
  const [apiDeposits, setApiDeposits] = useState([])
  const [depositFilters, setDepositFilters] = useState({})
  const [apiWalletTransactions, setApiWalletTransactions] = useState([])
  const [favoriteServices, setFavoriteServices] = useState([])
  const [recentServices, setRecentServices] = useState([])
  const [routeLoading, setRouteLoading] = useState(false)
  const [userDashboard, setUserDashboard] = useState(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [supportAttachments, setSupportAttachments] = useState([])
  const [supportFile, setSupportFile] = useState(null)
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportMessage, setSupportMessage] = useState('')
  const [supportQuery, setSupportQuery] = useState('')
  const [supportSelectedCode, setSupportSelectedCode] = useState(null)
  const [supportStatus, setSupportStatus] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    category: 'DEPOSIT',
    depositCode: '',
    message: '',
    orderCode: '',
    priority: 'NORMAL',
    subject: '',
  })
  const [adminCategories, setAdminCategories] = useState([])
  const [adminServices, setAdminServices] = useState([])
  const [adminPricing, setAdminPricing] = useState([])
  const [adminDashboard, setAdminDashboard] = useState(null)
  const [adminRevenue, setAdminRevenue] = useState(null)
  const [adminDashboardSummary, setAdminDashboardSummary] = useState(null)
  const [adminRevenueChart, setAdminRevenueChart] = useState([])
  const [adminServicePerformance, setAdminServicePerformance] = useState([])
  const [adminUserActivity, setAdminUserActivity] = useState(null)
  const [adminOverviewError, setAdminOverviewError] = useState('')
  const [activeDeposit, setActiveDeposit] = useState(null)
  const [apiNotice, setApiNotice] = useState(() => {
    if (initialOAuthCallback?.oauthTwoFactorChallenge) {
      return 'Mã xác thực đã được gửi tới email của bạn.'
    }

    if (initialOAuthCallback?.token) {
      return 'Đăng nhập bằng tài khoản liên kết thành công.'
    }

    if (initialOAuthCallback?.error) {
      return `Đăng nhập bằng tài khoản liên kết thất bại: ${initialOAuthCallback.error}`
    }

    return ''
  })
  const { copied, copyText } = useClipboard()
  const { addToast } = useToast()

  const amountNumber = Number(depositAmount) || 0
  const serviceList = useMemo(() => (Array.isArray(apiServices) ? apiServices : []), [apiServices])
  const orderList = useMemo(() => (Array.isArray(apiOrders) ? apiOrders : []), [apiOrders])
  const ticketList = useMemo(() => (Array.isArray(apiTickets) ? apiTickets : []), [apiTickets])
  const selectedTicket = ticketList.find((ticket) => ticket.ticketCode === supportSelectedCode) || ticketList[0] || null
  const displayBalance = Number(wallet?.balance ?? currentUser?.balance ?? 0)
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  const normalizedPathname = normalizePathname(location.pathname)
  const isAdminPath = normalizedPathname === '/admin' || normalizedPathname.startsWith('/admin/')
  const adminActiveView = adminNavItems.find((item) => item.path === normalizedPathname)?.id || 'admin-overview'
  const userActiveView = navItems.find((item) => item.path === normalizedPathname)?.id || 'overview'

  const metrics = useMemo(
    () => [
      { label: 'Số dư ví', value: money.format(displayBalance), tone: 'green' },
      {
        label: 'Đơn đang xử lý',
        value: String(userDashboard?.processingOrders ?? orderList.filter((order) => order.status === 'PROCESSING').length).padStart(2, '0'),
        tone: 'orange',
      },
      { label: 'Ticket chờ phản hồi', value: String(userDashboard?.pendingUserTickets ?? ticketList.filter((ticket) => ticket.status === 'PENDING_USER').length).padStart(2, '0'), tone: 'blue' },
      { label: 'Thông báo mới', value: String(unreadNotifications).padStart(2, '0'), tone: 'red' },
    ],
    [displayBalance, orderList, ticketList, unreadNotifications, userDashboard],
  )

  const applyBootstrapData = useCallback(({
    dashboardData,
    me,
    notificationCount,
    walletData,
  }) => {
    setCurrentUser(me)
    setWallet(walletData)
    setUserDashboard(dashboardData)
    setUnreadNotifications(Number(notificationCount?.unread || 0))
    setApiNotice('')
    setAuthInit(true)
  }, [])

  const notify = useCallback((message, type = 'info', title = '') => {
    addToast({
      message,
      title: title || (type === 'error' ? 'Lỗi' : type === 'success' ? 'Thành công' : 'Thông báo'),
      type,
    })
  }, [addToast])

  const handleAdminNotice = useCallback((message) => {
    notify(message, 'success')
  }, [notify])

  useEffect(() => {
    let isMounted = true

    if (initialOAuthCallback) {
      clearOAuthCallbackUrl()
    }

    publicApi.getServices()
      .then((data) => {
        if (isMounted) {
          setApiServices(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiServices([])
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!accessToken) {
      return
    }

    persistAccessToken(accessToken, rememberSession)
    fetchUserBootstrap(accessToken)
      .then(applyBootstrapData)
      .catch(() => {
        const message = 'Không kết nối được API hoặc token đã hết hạn.'
        setApiNotice(message)
        notify(message, 'error')
        setAuthInit(true)
      })
  }, [accessToken, applyBootstrapData, notify, rememberSession])

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
    ]).then((results) => {
      if (cancelled) return
      setAdminDashboard(settledValue(results[0], null))
      setAdminRevenue(settledValue(results[1], null))
      setAdminCategories(settledValue(results[2], []))
      setAdminServices(settledValue(results[3], []))
      setAdminPricing(settledValue(results[4], []))
      setAdminDashboardSummary(settledValue(results[5], null))
      setAdminRevenueChart(settledValue(results[6], []))
      setAdminServicePerformance(settledValue(results[7], []))
      setAdminUserActivity(settledValue(results[8], null))
      setAdminOverviewError(results.some((r) => r.status === 'rejected') ? 'Một phần dữ liệu tổng quan admin chưa tải được.' : '')
    }).catch(() => {
      if (!cancelled) setAdminOverviewError('Không tải được dữ liệu tổng quan admin. Kiểm tra quyền hoặc trạng thái backend.')
    })

    return () => {
      cancelled = true
    }
  }, [accessToken, isAdmin])

  useEffect(() => {
    if (!accessToken || !authInit || !currentUser) {
      return undefined
    }

    let socket = null
    let reconnectTimer = 0
    let closedByClient = false

    const connect = () => {
      const wsUrl = `${toWebSocketUrl('/ws/notifications')}?token=${encodeURIComponent(accessToken)}`
      socket = new WebSocket(wsUrl)

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type !== 'notification.created') {
            return
          }

          if (Number.isFinite(Number(payload.unreadCount))) {
            setUnreadNotifications(Number(payload.unreadCount))
          } else {
            setUnreadNotifications((count) => count + 1)
          }

          if (payload.notification) {
            setNotifications((items) => [
              payload.notification,
              ...normalizeList(items).filter((item) => item.id !== payload.notification.id),
            ].slice(0, 20))
            notify(payload.notification.message || payload.notification.title || 'Bạn có thông báo mới.', 'info', payload.notification.title || 'Thông báo mới')
          }
        } catch {
          // Ignore malformed websocket messages from stale connections.
        }
      }

      socket.onclose = () => {
        if (!closedByClient) {
          reconnectTimer = window.setTimeout(connect, 3000)
        }
      }

      socket.onerror = () => {
        socket?.close()
      }
    }

    connect()

    return () => {
      closedByClient = true
      window.clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [accessToken, authInit, currentUser, notify])

  useEffect(() => {
    if (authInit && accessToken && currentUser && !isAdmin && isAdminPath) {
      navigate('/', { replace: true })
    }
  }, [accessToken, authInit, currentUser, isAdmin, isAdminPath, navigate])

  useEffect(() => {
    if (!accessToken || !authInit || isAdmin || isAdminPath) {
      return
    }

    let cancelled = false

    const loadRouteData = async () => {
      setRouteLoading(true)
      try {
        if (userActiveView === 'overview') {
          const [orders, transactions, favorites, recent] = await Promise.all([
            userApi.searchOrders({ size: 50 }, accessToken),
            userApi.getWalletTransactions({ size: 20 }, accessToken),
            userApi.getFavoriteServices(accessToken),
            userApi.getRecentServices(accessToken),
          ])
          if (cancelled) return
          setApiOrders(normalizeList(orders))
          setApiWalletTransactions(normalizeList(transactions))
          setFavoriteServices(normalizeList(favorites))
          setRecentServices(normalizeList(recent))
          return
        }

        if (userActiveView === 'deposit') {
          const params = { size: 20, ...depositFilters }
          if (params.fromDate) {
            params.fromDate = params.fromDate + 'T00:00:00Z'
          }
          if (params.toDate) {
            params.toDate = params.toDate + 'T23:59:59Z'
          }
          const deposits = normalizeList(await userApi.getDeposits(params, accessToken))
          if (cancelled) return
          setApiDeposits(deposits)
          setActiveDeposit((current) => (
            current && deposits.some((deposit) => deposit.depositCode === current.depositCode)
              ? deposits.find((deposit) => deposit.depositCode === current.depositCode)
              : deposits.find((deposit) => deposit.status === 'PENDING') || deposits[0] || null
          ))
          return
        }

        if (userActiveView === 'services') {
          const [favorites, recent] = await Promise.all([
            userApi.getFavoriteServices(accessToken),
            userApi.getRecentServices(accessToken),
          ])
          if (cancelled) return
          setFavoriteServices(normalizeList(favorites))
          setRecentServices(normalizeList(recent))
          return
        }

        if (userActiveView === 'orders') {
          const orders = await userApi.searchOrders({ size: 50 }, accessToken)
          if (!cancelled) {
            setApiOrders(normalizeList(orders))
          }
        }
      } catch (err) {
        if (!cancelled) {
          notify(err.message || 'Không tải được dữ liệu trang hiện tại.', 'error')
        }
      } finally {
        if (!cancelled) {
          setRouteLoading(false)
        }
      }
    }

    loadRouteData()

    return () => {
      cancelled = true
      setRouteLoading(false)
    }
  }, [accessToken, authInit, depositFilters, isAdmin, isAdminPath, notify, userActiveView])

  const handleAuthSuccess = (response, remember = true) => {
    setRememberSession(remember)
    setAccessToken(response.accessToken)
    setCurrentUser(response.user)
    setShowAuthScreen(false)
    const message = 'Đăng nhập thành công.'
    setApiNotice(message)
    notify(message, 'success')
  }

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await authApi.logout(accessToken)
      } catch {
        // Local logout still needs to clear client state if the API is unreachable.
      }
    }

    clearStoredAccessToken()
    setAccessToken('')
    setCurrentUser(null)
    setWallet(null)
    setApiOrders([])
    setApiWalletTransactions([])
    setApiDeposits([])
    setApiTickets([])
    setFavoriteServices([])
    setRecentServices([])
    setUserDashboard(null)
    setUnreadNotifications(0)
    setNotifications([])
    setNotificationsLoading(false)
    setSupportAttachments([])
    setSupportFile(null)
    setSupportMessage('')
    setSupportSelectedCode(null)
    setActiveDeposit(null)
    setAdminCategories([])
    setAdminServices([])
    setAdminPricing([])
    setAdminDashboard(null)
    setAdminRevenue(null)
    setAdminDashboardSummary(null)
    setAdminRevenueChart([])
    setAdminServicePerformance([])
    setAdminUserActivity(null)
    setAdminOverviewError('')
    setShowAuthScreen(false)
    const message = 'Đã đăng xuất.'
    setApiNotice(message)
    notify(message, 'info')
    navigate('/', { replace: true })
  }

  const handleOpenAuth = () => {
    setShowAuthScreen(true)
    if (apiNotice === 'Đã đăng xuất.') {
      setApiNotice('')
    }
  }

  const handleAdminViewChange = useCallback((viewId) => {
    const nextItem = adminNavItems.find((item) => item.id === viewId)
    navigate(nextItem?.path || '/admin')
  }, [navigate])

  const handleUserViewChange = useCallback((viewId) => {
    const nextItem = navItems.find((item) => item.id === viewId)
    navigate(nextItem?.path || '/')
  }, [navigate])

  const handleAdminRouteError = useCallback(() => {}, [])

  const handleUserSettingsError = useCallback((message) => {
    if (message) {
      notify(message, 'error')
    }
  }, [notify])

  const loadNotifications = useCallback(async () => {
    if (!accessToken) {
      return
    }

    setNotificationsLoading(true)
    try {
      const [items, count] = await Promise.all([
        userApi.getNotifications(accessToken),
        userApi.getUnreadNotificationCount(accessToken),
      ])
      setNotifications(normalizeList(items))
      setUnreadNotifications(Number(count?.unread || 0))
    } catch (err) {
      notify(err.message || 'Không tải được thông báo.', 'error')
    } finally {
      setNotificationsLoading(false)
    }
  }, [accessToken, notify])

  const handleMarkNotificationRead = useCallback(async (notification) => {
    if (!accessToken || !notification?.id) {
      return
    }

    const route = notificationRoute(notification.actionUrl)
    if (route) {
      navigate(route)
    }

    if (notification.readAt) {
      return
    }

    try {
      const saved = await userApi.markNotificationRead(notification.id, accessToken)
      setNotifications((items) => normalizeList(items).map((item) => (item.id === saved.id ? saved : item)))
      setUnreadNotifications((count) => Math.max(0, count - 1))
    } catch (err) {
      notify(err.message || 'Không cập nhật được thông báo.', 'error')
    }
  }, [accessToken, navigate, notify])

  const handleDepositAmountChange = (value) => {
    setDepositAmount(parseMoneyInput(value))
  }

  const refreshBootstrapData = useCallback(async () => {
    if (!accessToken) {
      return
    }

    applyBootstrapData(await fetchUserBootstrap(accessToken))
  }, [accessToken, applyBootstrapData])

  const handleCreateDeposit = async () => {
    if (!accessToken) {
      const message = 'Vui lòng đăng nhập trước khi tạo yêu cầu nạp.'
      setApiNotice(message)
      notify(message, 'info')
      return
    }

    if (amountNumber <= MIN_DEPOSIT_AMOUNT) {
      const message = 'Số tiền nạp phải lớn hơn 1.000đ.'
      setApiNotice(message)
      notify(message, 'error')
      return
    }

    try {
      const deposit = await userApi.createDeposit({ amount: amountNumber }, accessToken)

      setActiveDeposit(deposit)
      setApiDeposits((items) => [deposit, ...normalizeList(items).filter((item) => item.depositCode !== deposit.depositCode)])
      await refreshBootstrapData()
      const message = `Đã tạo mã nạp ${deposit.depositCode}.`
      setApiNotice(message)
      notify(message, 'success')
    } catch {
      const message = 'Không tạo được yêu cầu nạp. Kiểm tra backend hoặc số tiền tối thiểu.'
      setApiNotice(message)
      notify(message, 'error')
    }
  }

  const handleDepositFiltersChange = (filters) => {
    setDepositFilters(filters)
  }

  const handleRefreshDeposit = async (depositCode) => {
    if (!accessToken) {
      return
    }

    try {
      if (depositCode) {
        const [deposit, status, walletData] = await Promise.all([
          userApi.getDeposit(depositCode, accessToken),
          userApi.getDepositStatus(depositCode, accessToken),
          userApi.getWallet(accessToken),
        ])
        const merged = { ...deposit, ...status }
        setActiveDeposit(merged)
        setApiDeposits((items) => normalizeList(items).map((item) => (item.depositCode === depositCode ? merged : item)))
        setWallet(walletData)
        const notice = depositStatusNotice(depositCode, merged.status)
        notify(notice.message, notice.type, notice.title)
      } else {
        const params = { size: 20, ...depositFilters }
        if (params.fromDate) {
          params.fromDate = params.fromDate + 'T00:00:00Z'
        }
        if (params.toDate) {
          params.toDate = params.toDate + 'T23:59:59Z'
        }
        const [depositData, walletData] = await Promise.all([
          userApi.getDeposits(params, accessToken),
          userApi.getWallet(accessToken),
        ])
        const deposits = normalizeList(depositData)
        setApiDeposits(deposits)
        setActiveDeposit((current) => (
          current && deposits.some((deposit) => deposit.depositCode === current.depositCode)
            ? deposits.find((deposit) => deposit.depositCode === current.depositCode)
            : deposits.find((deposit) => deposit.status === 'PENDING') || deposits[0] || null
        ))
        setWallet(walletData)
        notify('Đã tải lại lịch sử nạp tiền.', 'success')
      }
    } catch (err) {
      notify(err.message || 'Không cập nhật được yêu cầu nạp.', 'error')
    }
  }

  const handleCancelDeposit = async (deposit) => {
    if (!accessToken || !deposit?.depositCode) {
      return
    }

    try {
      const saved = await userApi.cancelDeposit(deposit.depositCode, { reason: 'Người dùng hủy yêu cầu nạp' }, accessToken)
      setActiveDeposit(saved)
      setApiDeposits((items) => normalizeList(items).map((item) => (item.depositCode === saved.depositCode ? saved : item)))
      notify(`Đã hủy yêu cầu nạp ${saved.depositCode}.`, 'success')
    } catch (err) {
      notify(err.message || 'Không hủy được yêu cầu nạp.', 'error')
    }
  }

  const handlePurchase = async (service) => {
    if (!accessToken) {
      const message = 'Vui lòng đăng nhập trước khi mua dịch vụ.'
      setApiNotice(message)
      notify(message, 'info')
      return
    }

    try {
      const serviceId = resolveServiceId(service)
      if (!serviceId) {
        throw new Error('Dịch vụ chưa có mã hợp lệ để tạo đơn.')
      }

      if (service.ctaType && service.ctaType !== 'BUY_NOW') {
        throw new Error('Dịch vụ này cần tư vấn trước khi mua. Vui lòng tạo ticket hỗ trợ.')
      }

      const servicePrice = Number(service.price)
      if (Number.isFinite(servicePrice) && servicePrice > displayBalance) {
        throw new Error('Số dư ví không đủ để mua dịch vụ này. Vui lòng nạp thêm tiền.')
      }

      const order = await userApi.createOrder({
        serviceId,
        inputData: JSON.stringify({ source: 'dashboard' }),
        idempotencyKey: createIdempotencyKey(serviceId),
      }, accessToken)

      if (!order?.orderCode) {
        throw new Error('API tạo đơn không trả về mã đơn. Vui lòng tải lại trang và thử lại.')
      }

      setApiOrders((items) => [order, ...normalizeList(items).filter((item) => item.orderCode !== order.orderCode)])
      await refreshBootstrapData()
      const message = `Đã tạo đơn ${order.orderCode}.`
      setApiNotice(message)
      notify(message, 'success')
    } catch (err) {
      const message = purchaseErrorMessage(err)
      setApiNotice(message)
      notify(message, 'error')
    }
  }

  const handleToggleFavoriteService = async (service) => {
    if (!accessToken || !service?.id) {
      const message = 'Vui lòng đăng nhập trước khi ghim dịch vụ.'
      setApiNotice(message)
      notify(message, 'info')
      return
    }

    const isFavorite = favoriteServices.some((item) => item.id === service.id)

    try {
      if (isFavorite) {
        await userApi.removeFavoriteService(service.id, accessToken)
        setFavoriteServices((items) => items.filter((item) => item.id !== service.id))
        notify(`Đã bỏ ghim ${service.name}.`, 'success')
      } else {
        const saved = await userApi.addFavoriteService(service.id, accessToken)
        setFavoriteServices((items) => [saved, ...items.filter((item) => item.id !== saved.id)])
        notify(`Đã ghim ${saved.name}.`, 'success')
      }
    } catch (err) {
      notify(err.message || 'Không cập nhật được dịch vụ yêu thích.', 'error')
    }
  }

  const handleCancelOrder = async (order) => {
    if (!accessToken || !order?.orderCode) {
      return
    }

    try {
      const saved = await userApi.cancelOrder(order.orderCode, { reason: 'Người dùng hủy đơn' }, accessToken)
      setApiOrders((items) => normalizeList(items).map((item) => (item.orderCode === saved.orderCode ? saved : item)))
      await refreshBootstrapData()
      notify(`Đã hủy đơn ${saved.orderCode}.`, 'success')
    } catch (err) {
      notify(err.message || 'Không hủy được đơn hàng.', 'error')
    }
  }

  const handleReorder = async (order) => {
    if (!accessToken || !order?.orderCode) {
      return
    }

    try {
      const saved = await userApi.reorder(order.orderCode, accessToken)
      setApiOrders((items) => [saved, ...normalizeList(items).filter((item) => item.orderCode !== saved.orderCode)])
      await refreshBootstrapData()
      notify(`Đã tạo lại đơn ${saved.orderCode}.`, 'success')
    } catch (err) {
      notify(err.message || 'Không mua lại được đơn hàng.', 'error')
    }
  }

  const loadTickets = useCallback(async () => {
    if (!accessToken || !authInit || isAdmin || userActiveView !== 'support') {
      return
    }

    setSupportLoading(true)
    try {
      const data = normalizeList(await userApi.searchTickets({
        query: supportQuery.trim(),
        status: supportStatus,
      }, accessToken))
      setApiTickets(data)
      setSupportSelectedCode((current) => (
        current && data.some((ticket) => ticket.ticketCode === current)
          ? current
          : data[0]?.ticketCode || null
      ))
    } catch (err) {
      notify(err.message || 'Không tải được ticket hỗ trợ.', 'error')
    } finally {
      setSupportLoading(false)
    }
  }, [accessToken, authInit, isAdmin, notify, supportQuery, supportStatus, userActiveView])

  useEffect(() => {
    const timer = window.setTimeout(loadTickets, 250)
    return () => window.clearTimeout(timer)
  }, [loadTickets])

  const loadTicketDetail = async (ticketCode) => {
    if (!accessToken || !ticketCode) {
      return
    }

    setSupportSelectedCode(ticketCode)
    try {
      const [ticket, attachments] = await Promise.all([
        userApi.getTicket(ticketCode, accessToken),
        userApi.getTicketAttachments(ticketCode, accessToken),
      ])
      setApiTickets((items) => {
        const list = normalizeList(items)
        return list.some((item) => item.ticketCode === ticket.ticketCode)
          ? list.map((item) => (item.ticketCode === ticket.ticketCode ? ticket : item))
          : [ticket, ...list]
      })
      setSupportAttachments(normalizeList(attachments))
    } catch (err) {
      notify(err.message || 'Không tải được chi tiết ticket.', 'error')
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (userActiveView === 'support' && selectedTicket?.ticketCode) {
        loadTicketDetail(selectedTicket.ticketCode)
      } else if (userActiveView === 'support') {
        setSupportAttachments([])
      }
    }, 0)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicket?.ticketCode, userActiveView])

  const updateTicketForm = (field, value) => {
    setTicketForm((current) => ({ ...current, [field]: value }))
  }

  const handleCreateTicket = async (event) => {
    event.preventDefault()
    if (!accessToken) {
      return
    }

    setSupportSubmitting(true)
    try {
      const saved = await userApi.createTicket({
        category: ticketForm.category,
        depositCode: ticketForm.depositCode.trim() || undefined,
        message: ticketForm.message.trim(),
        orderCode: ticketForm.orderCode.trim() || undefined,
        priority: ticketForm.priority,
        subject: ticketForm.subject.trim(),
      }, accessToken)
      setApiTickets((items) => [saved, ...normalizeList(items).filter((item) => item.ticketCode !== saved.ticketCode)])
      setSupportSelectedCode(saved.ticketCode)
      setTicketForm({ category: 'DEPOSIT', depositCode: '', message: '', orderCode: '', priority: 'NORMAL', subject: '' })
      notify(`Đã tạo ticket ${saved.ticketCode}.`, 'success')
    } catch (err) {
      notify(err.message || 'Không tạo được ticket.', 'error')
    } finally {
      setSupportSubmitting(false)
    }
  }

  const handleSendTicketMessage = async (event) => {
    event.preventDefault()
    if (!accessToken || !selectedTicket || !supportMessage.trim()) {
      return
    }

    setSupportSubmitting(true)
    try {
      const saved = await userApi.sendTicketMessage(selectedTicket.ticketCode, { message: supportMessage.trim() }, accessToken)
      setApiTickets((items) => normalizeList(items).map((item) => (item.ticketCode === saved.ticketCode ? saved : item)))
      setSupportMessage('')
      notify(`Đã phản hồi ticket ${saved.ticketCode}.`, 'success')
    } catch (err) {
      notify(err.message || 'Không gửi được phản hồi ticket.', 'error')
    } finally {
      setSupportSubmitting(false)
    }
  }

  const handleTicketState = async (ticketCode, action) => {
    if (!accessToken || !ticketCode) {
      return
    }

    setSupportSubmitting(true)
    try {
      const saved = action === 'close'
        ? await userApi.closeTicket(ticketCode, accessToken)
        : await userApi.reopenTicket(ticketCode, accessToken)
      setApiTickets((items) => normalizeList(items).map((item) => (item.ticketCode === saved.ticketCode ? saved : item)))
      notify(`Đã cập nhật ticket ${saved.ticketCode}.`, 'success')
    } catch (err) {
      notify(err.message || 'Không cập nhật được ticket.', 'error')
    } finally {
      setSupportSubmitting(false)
    }
  }

  const handleUploadTicketAttachment = async (event) => {
    event.preventDefault()
    if (!accessToken || !selectedTicket || !supportFile) {
      return
    }

    setSupportSubmitting(true)
    try {
      await userApi.uploadTicketAttachment(selectedTicket.ticketCode, supportFile, accessToken)
      setSupportFile(null)
      setSupportAttachments(normalizeList(await userApi.getTicketAttachments(selectedTicket.ticketCode, accessToken)))
      notify('Đã upload attachment.', 'success')
    } catch (err) {
      notify(err.message || 'Không upload được attachment.', 'error')
    } finally {
      setSupportSubmitting(false)
    }
  }

  const handleDeleteTicketAttachment = async (ticketCode, attachmentId) => {
    if (!accessToken) {
      return
    }

    setSupportSubmitting(true)
    try {
      await userApi.deleteTicketAttachment(ticketCode, attachmentId, accessToken)
      setSupportAttachments(normalizeList(await userApi.getTicketAttachments(ticketCode, accessToken)))
      notify(`Đã xóa attachment #${attachmentId}.`, 'success')
    } catch (err) {
      notify(err.message || 'Không xóa được attachment.', 'error')
    } finally {
      setSupportSubmitting(false)
    }
  }

  if (!accessToken) {
    if (showAuthScreen) {
      return (
        <AuthScreen
          notice={apiNotice}
          oauthChallenge={initialOAuthCallback?.oauthTwoFactorChallenge ? {
            challengeToken: initialOAuthCallback.oauthTwoFactorChallenge,
            email: initialOAuthCallback.email,
            expiresAt: initialOAuthCallback.expiresAt,
            provider: initialOAuthCallback.provider,
          } : null}
          onBack={() => setShowAuthScreen(false)}
          onSuccess={handleAuthSuccess}
        />
      )
    }

    return <PublicHome notice={apiNotice} onLoginClick={handleOpenAuth} />
  }

  if (!authInit) {
    return <Loading message="Đang khởi tạo ứng dụng..." subMessage="Vui lòng chờ trong giây lát" />
  }

  if (isAdmin) {
    return (
      <DashboardShell
        activeView={adminActiveView}
        currentUser={currentUser}
        displayBalance={displayBalance}
        items={adminNavItems}
        notificationCount={unreadNotifications}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        onLogout={handleLogout}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenNotifications={loadNotifications}
        onViewChange={handleAdminViewChange}
        showBalance={false}
        subtitle="Quản trị nội dung public site"
      >
        {adminActiveView === 'admin-overview' && adminOverviewError && (
          <p className="admin-message error">{adminOverviewError}</p>
        )}
        <AdminRoutes
          categories={adminCategories}
          currentUser={currentUser}
          dashboard={adminDashboard}
          dashboardSummary={adminDashboardSummary}
          mountedPaths={adminRoutePaths}
          onCurrentUserChange={setCurrentUser}
          onSetError={handleAdminRouteError}
          onSetNotice={handleAdminNotice}
          pricingItems={adminPricing}
          revenue={adminRevenue}
          revenueChart={adminRevenueChart}
          servicePerformance={adminServicePerformance}
          services={adminServices}
          token={accessToken}
          userActivity={adminUserActivity}
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      activeView={userActiveView}
      currentUser={currentUser}
      displayBalance={displayBalance}
      items={navItems}
      notificationCount={unreadNotifications}
      notifications={notifications}
      notificationsLoading={notificationsLoading}
      onLogout={handleLogout}
      onMarkNotificationRead={handleMarkNotificationRead}
      onOpenNotifications={loadNotifications}
      onViewChange={handleUserViewChange}
    >
      {routeLoading && userActiveView !== 'support' && userActiveView !== 'settings' && (
        <Loading fullScreen={false} message="Đang tải dữ liệu..." subMessage="" />
      )}
      <UserRoutes
        activeDeposit={activeDeposit}
        amountNumber={amountNumber}
        apiDeposits={apiDeposits}
        apiTickets={apiTickets}
        apiWalletTransactions={apiWalletTransactions}
        copied={copied}
        currentUser={currentUser}
        depositAmount={depositAmount}
        favoriteServices={favoriteServices}
        metrics={metrics}
        onAmountChange={handleDepositAmountChange}
        onCancelDeposit={handleCancelDeposit}
        onCancelOrder={handleCancelOrder}
        onCloseTicket={(ticketCode) => handleTicketState(ticketCode, 'close')}
        onCopy={copyText}
        onCreateDeposit={handleCreateDeposit}
        onCreateTicket={handleCreateTicket}
        onCurrentUserChange={setCurrentUser}
        onDeleteAttachment={handleDeleteTicketAttachment}
        onFileChange={setSupportFile}
        onLoadTicket={loadTicketDetail}
        onOpenServices={() => handleUserViewChange('services')}
        onPurchase={handlePurchase}
        onRefreshDeposit={handleRefreshDeposit}
        onFiltersChange={handleDepositFiltersChange}
        onRefreshTickets={loadTickets}
        onReopenTicket={(ticketCode) => handleTicketState(ticketCode, 'reopen')}
        onReorder={handleReorder}
        onSearchChange={setSupportQuery}
        onSendMessage={handleSendTicketMessage}
        onSetMessage={setSupportMessage}
        onSetNotice={(message) => notify(message, 'success')}
        onSetSettingsError={handleUserSettingsError}
        onStatusChange={setSupportStatus}
        onTicketFormChange={updateTicketForm}
        onToggleFavorite={handleToggleFavoriteService}
        onUploadAttachment={handleUploadTicketAttachment}
        onViewChange={handleUserViewChange}
        orderList={orderList}
        recentServices={recentServices}
        serviceList={serviceList}
        supportAttachments={supportAttachments}
        supportFile={supportFile}
        supportLoading={supportLoading}
        supportMessage={supportMessage}
        supportQuery={supportQuery}
        supportSelectedTicket={selectedTicket}
        supportStatus={supportStatus}
        supportSubmitting={supportSubmitting}
        ticketForm={ticketForm}
        token={accessToken}
      />
    </DashboardShell>
  )
}

export default App
