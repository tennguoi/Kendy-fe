import { useCallback, useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from './components/Toast'
import { adminNavItems } from './features/admin/adminNavigation'
import { navItems } from './features/user/navigation'
import AdminRoutes from './features/admin/AdminRoutes'
import AuthScreen from './features/auth/AuthScreen'
import DashboardShell from './components/layout/DashboardShell'
import UserRoutes from './features/user/UserRoutes'
import PublicHome from './features/public/PublicHome'
import Catalog from './features/public/components/Catalog/Catalog'
import ProductDetail from './features/public/components/ProductDetail/ProductDetail'
import PublicLayout from './features/public/components/PublicLayout/PublicLayout'
import Loading from './components/Loading/Loading'
import SupportWidget from './features/user/support/components/SupportWidget'
import PaymentChoiceModal from './features/user/services/components/PaymentChoiceModal'
import TransferPaymentModal from './features/user/services/components/TransferPaymentModal'
import { useClipboard } from './hooks/useClipboard'
import { authApi } from './api/auth.api'
import { publicApi } from './api/public.api'
import { userApi } from './api/user.api'
import { createIdempotencyKey } from './utils/idempotency'
import { parseMoneyInput } from './utils/moneyInput'
import { clearOAuthCallbackUrl } from './utils/oauthCallback'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  hasPersistentSession,
  persistAccessToken,
} from './utils/session'
import { normalizePaged } from './utils/pagination'
import { adminRoutePaths, depositStatusNotice, fetchUserBootstrap, initialOAuthCallback, MIN_DEPOSIT_AMOUNT, normalizeList, normalizePathname, purchaseErrorMessage, resolveAdminActiveView, resolveServiceId, resolveUserActiveView } from './utils/appHelpers'
import { useAdminOverview } from './features/admin/hooks/useAdminOverview'
import { useDashboardMetrics } from './features/user/overview/hooks/useDashboardMetrics'
import { useNotifications } from './features/notifications/hooks/useNotifications'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showAuthScreen, setShowAuthScreen] = useState(() => (
    Boolean(initialOAuthCallback?.error || initialOAuthCallback?.oauthTwoFactorChallenge)
  ))
  const [depositAmount, setDepositAmount] = useState('250000')
  const [checkoutService, setCheckoutService] = useState(null)
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('')
  const [checkoutCouponError, setCheckoutCouponError] = useState('')
  const [checkoutCouponQuote, setCheckoutCouponQuote] = useState(null)
  const [checkoutCouponSubmitting, setCheckoutCouponSubmitting] = useState(false)
  const [accessToken, setAccessToken] = useState(() => initialOAuthCallback?.token || getStoredAccessToken())
  const [rememberSession, setRememberSession] = useState(() => Boolean(initialOAuthCallback?.token) || hasPersistentSession())
  const [currentUser, setCurrentUser] = useState(null)
  const [authInit, setAuthInit] = useState(() => !accessToken)
  const [wallet, setWallet] = useState(null)
  const [apiServices, setApiServices] = useState([])
  const [apiOrders, setApiOrders] = useState([])
  const [detailOrderLoading, setDetailOrderLoading] = useState(false)
  const [apiTickets, setApiTickets] = useState([])
  const [apiDeposits, setApiDeposits] = useState([])
  const [depositFilters, setDepositFilters] = useState({})
  const [apiWalletTransactions, setApiWalletTransactions] = useState([])
  const [favoriteServices, setFavoriteServices] = useState([])
  const [recentServices, setRecentServices] = useState([])
  const [routeLoading, setRouteLoading] = useState(false)
  const [userDashboard, setUserDashboard] = useState(null)
  const [supportAttachments, setSupportAttachments] = useState([])
  const [supportFile, setSupportFile] = useState(null)
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportMessage, setSupportMessage] = useState('')
  const [supportPage, setSupportPage] = useState(0)
  const [supportTotalPages, setSupportTotalPages] = useState(0)
  const [supportQuery, setSupportQuery] = useState('')
  const [supportSelectedCode, setSupportSelectedCode] = useState(null)
  const [supportStatus, setSupportStatus] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [activeCheckout, setActiveCheckout] = useState(null)
  const [ticketForm, setTicketForm] = useState({
    category: 'DEPOSIT',
    depositCode: '',
    message: '',
    orderCode: '',
    priority: 'NORMAL',
    subject: '',
  })
  const [activeDeposit, setActiveDeposit] = useState(null)
  const [apiNotice, setApiNotice] = useState('')
  const { copied, copyText } = useClipboard()
  const { addToast } = useToast()

  const amountNumber = Number(depositAmount) || 0
  const serviceList = useMemo(() => (Array.isArray(apiServices) ? apiServices : []), [apiServices])
  const orderList = useMemo(() => (Array.isArray(apiOrders) ? apiOrders : []), [apiOrders])
  const ticketList = useMemo(() => (Array.isArray(apiTickets) ? apiTickets : []), [apiTickets])
  const selectedTicket = ticketList.find((ticket) => ticket.ticketCode === supportSelectedCode) || ticketList[0] || null
  const displayBalance = Number(wallet?.balance ?? currentUser?.balance ?? 0)
  const checkoutPayableAmount = Number(
    checkoutCouponQuote?.valid
      ? checkoutCouponQuote.payableAmount
      : checkoutService?.price
  ) || 0
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  const normalizedPathname = normalizePathname(location.pathname)
  const isAdminPath = normalizedPathname === '/admin' || normalizedPathname.startsWith('/admin/')
  const adminActiveView = resolveAdminActiveView(normalizedPathname)
  const userActiveView = resolveUserActiveView(normalizedPathname)

  const notify = useCallback((message, type = 'info', title = '') => {
    addToast({
      message,
      title: title || (type === 'error' ? 'Lỗi' : type === 'success' ? 'Thành công' : 'Thông báo'),
      type,
    })
  }, [addToast])

  const { adminOverview, resetAdminOverview } = useAdminOverview(accessToken, isAdmin)
  const {
    handleMarkNotificationRead,
    loadNotifications,
    notifications,
    notificationsLoading,
    resetNotifications,
    setUnreadNotifications,
    unreadNotifications,
  } = useNotifications({
    accessToken,
    authInit,
    currentUser,
    navigate,
    notify,
  })

  const metrics = useDashboardMetrics({
    displayBalance,
    orderList,
    ticketList,
    unreadNotifications,
    userDashboard,
  })

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
  }, [setUnreadNotifications])

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
    if (authInit && accessToken && currentUser && !isAdmin && isAdminPath) {
      navigate('/', { replace: true })
    }
  }, [accessToken, authInit, currentUser, isAdmin, isAdminPath, navigate])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      let attempts = 0
      const scrollToElement = () => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
        if (attempts < 5) {
          attempts++
          const timer = setTimeout(scrollToElement, 150)
          return timer
        }
      }
      const activeTimer = scrollToElement()
      return () => clearTimeout(activeTimer)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.pathname, location.hash])

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
    setCheckoutService(null)
    setCheckoutSubmitting(false)
    setCheckoutCouponCode('')
    setCheckoutCouponError('')
    setCheckoutCouponQuote(null)
    setCheckoutCouponSubmitting(false)
    setCurrentUser(null)
    setWallet(null)
    setApiOrders([])
    setDetailOrderLoading(false)
    setApiWalletTransactions([])
    setApiDeposits([])
    setApiTickets([])
    setActiveCheckout(null)
    setFavoriteServices([])
    setRecentServices([])
    setUserDashboard(null)
    resetNotifications()
    setSupportAttachments([])
    setSupportFile(null)
    setSupportMessage('')
    setSupportSelectedCode(null)
    setActiveDeposit(null)
    resetAdminOverview()
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
    if (viewId === 'admin-profile') {
      navigate('/admin/profile')
      return
    }
    if (viewId === 'admin-settings') {
      navigate('/admin/settings')
      return
    }
    const nextItem = adminNavItems.find((item) => item.id === viewId)
    navigate(nextItem?.path || '/admin')
  }, [navigate])

  const handleUserViewChange = useCallback((viewId) => {
    if (viewId === 'settings') {
      navigate('/profile')
      return
    }
    const nextItem = navItems.find((item) => item.id === viewId)
    navigate(nextItem?.path || '/')
  }, [navigate])

  const handleAdminRouteError = useCallback(() => { }, [])

  const handleUserSettingsError = useCallback((message) => {
    if (message) {
      notify(message, 'error')
    }
  }, [notify])

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
      if (depositCode && activeCheckout?.checkoutCode && activeCheckout?.deposit?.depositCode === depositCode) {
        const checkout = await userApi.getCheckoutStatus(activeCheckout.checkoutCode, accessToken)
        setActiveCheckout(checkout)
        if (checkout.deposit) {
          setActiveDeposit(checkout.deposit)
          setApiDeposits((items) => normalizeList(items).map((item) => (
            item.depositCode === checkout.deposit.depositCode ? checkout.deposit : item
          )))
        }
        if (checkout.order) {
          setApiOrders((items) => [checkout.order, ...normalizeList(items).filter((item) => item.orderCode !== checkout.order.orderCode)])
          await refreshBootstrapData()
          notify(`Thanh toán hoàn tất, đã tạo đơn ${checkout.order.orderCode}.`, 'success')
        } else {
          const notice = depositStatusNotice(depositCode, checkout.deposit?.status || checkout.status)
          notify(notice.message, notice.type, notice.title)
        }
        return
      }

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
      if (!Number.isFinite(servicePrice) || servicePrice <= 0) {
        throw new Error('Service price must be greater than zero')
      }

      setCheckoutCouponCode('')
      setCheckoutCouponError('')
      setCheckoutCouponQuote(null)
      setCheckoutService(service)
    } catch (err) {
      const message = purchaseErrorMessage(err)
      setApiNotice(message)
      notify(message, 'error')
    }
  }

  const handleCheckoutCouponChange = (value) => {
    setCheckoutCouponCode(value)
    setCheckoutCouponError('')
    setCheckoutCouponQuote(null)
  }

  const handleApplyCheckoutCoupon = async () => {
    if (!accessToken || !checkoutService) {
      return
    }
    const code = checkoutCouponCode.trim()
    if (!code) {
      setCheckoutCouponError('Vui lòng nhập mã giảm giá.')
      return
    }

    setCheckoutCouponSubmitting(true)
    try {
      const serviceId = resolveServiceId(checkoutService)
      const quote = await userApi.validateCoupon({ serviceId, couponCode: code }, accessToken)
      if (!quote?.valid) {
        setCheckoutCouponQuote(null)
        setCheckoutCouponError(quote?.message || 'Mã giảm giá không hợp lệ.')
        return
      }
      setCheckoutCouponQuote(quote)
      setCheckoutCouponCode(quote.couponCode || code)
      setCheckoutCouponError('')
    } catch (err) {
      setCheckoutCouponQuote(null)
      setCheckoutCouponError(err.message || 'Không kiểm tra được mã giảm giá.')
    } finally {
      setCheckoutCouponSubmitting(false)
    }
  }

  const closeCheckoutModal = () => {
    setCheckoutService(null)
    setCheckoutCouponCode('')
    setCheckoutCouponError('')
    setCheckoutCouponQuote(null)
  }

  const handlePayWithWallet = async (formData = {}) => {
    if (!accessToken || !checkoutService) {
      return
    }

    const serviceId = resolveServiceId(checkoutService)
    const payableAmount = checkoutPayableAmount
    if (Number.isFinite(payableAmount) && payableAmount > displayBalance) {
      const message = 'Số dư ví không đủ. Chọn thanh toán chuyển khoản để tạo mã QR đúng số tiền dịch vụ.'
      setApiNotice(message)
      notify(message, 'info')
      return
    }

    setCheckoutSubmitting(true)
    try {
      const order = await userApi.createOrder({
        serviceId,
        inputData: JSON.stringify({ ...formData, source: 'dashboard' }),
        idempotencyKey: createIdempotencyKey(serviceId),
        couponCode: checkoutCouponCode.trim() || undefined,
      }, accessToken)

      if (!order?.orderCode) {
        throw new Error('API tạo đơn không trả về mã đơn. Vui lòng tải lại trang và thử lại.')
      }

      setApiOrders((items) => [order, ...normalizeList(items).filter((item) => item.orderCode !== order.orderCode)])
      await refreshBootstrapData()
      const message = `Đã tạo đơn ${order.orderCode}.`
      setApiNotice(message)
      notify(message, 'success')
      closeCheckoutModal()
    } catch (err) {
      const message = purchaseErrorMessage(err)
      setApiNotice(message)
      notify(message, 'error')
    } finally {
      setCheckoutSubmitting(false)
    }
  }

  const handlePayByTransfer = async (formData = {}) => {
    if (!accessToken || !checkoutService) {
      return
    }

    const payableAmount = checkoutPayableAmount
    if (!Number.isFinite(payableAmount) || payableAmount <= MIN_DEPOSIT_AMOUNT) {
      const message = 'Số tiền thanh toán phải lớn hơn 1.000đ để tạo mã QR.'
      setApiNotice(message)
      notify(message, 'error')
      return
    }

    setCheckoutSubmitting(true)
    try {
      const serviceId = resolveServiceId(checkoutService)
      const checkout = await userApi.createServiceCheckout({
        serviceId,
        inputData: JSON.stringify({ ...formData, source: 'checkout' }),
        idempotencyKey: createIdempotencyKey(serviceId),
        couponCode: checkoutCouponCode.trim() || undefined,
      }, accessToken)
      const deposit = checkout.deposit
      setActiveDeposit(deposit)
      setActiveCheckout(checkout)
      setApiDeposits((items) => [deposit, ...normalizeList(items).filter((item) => item.depositCode !== deposit.depositCode)])
      setDepositAmount(String(payableAmount))
      closeCheckoutModal()
      notify(`Đã tạo mã thanh toán ${deposit.depositCode} cho ${checkout.serviceName || checkoutService.name}.`, 'success')
    } catch (err) {
      const message = err.message || 'Không tạo được mã thanh toán. Vui lòng thử lại.'
      setApiNotice(message)
      notify(message, 'error')
    } finally {
      setCheckoutSubmitting(false)
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

  const handleLoadOrderDetail = async (order) => {
    const orderCode = order?.orderCode || order?.code
    if (!accessToken || !orderCode) {
      return order || null
    }

    setDetailOrderLoading(true)
    try {
      const detail = await userApi.getOrder(orderCode, accessToken)
      setApiOrders((items) => {
        const list = normalizeList(items)
        return list.some((item) => (item.orderCode || item.code) === orderCode)
          ? list.map((item) => ((item.orderCode || item.code) === orderCode ? detail : item))
          : [detail, ...list]
      })
      return detail
    } catch (err) {
      notify(err.message || 'Không tải được chi tiết đơn hàng.', 'error')
      return order || null
    } finally {
      setDetailOrderLoading(false)
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

  const loadTickets = useCallback(async (page) => {
    if (!accessToken || !authInit || isAdmin || userActiveView !== 'support') {
      return
    }

    const targetPage = page ?? supportPage
    setSupportLoading(true)
    try {
      const response = await userApi.searchTickets({
        query: supportQuery.trim(),
        status: supportStatus,
        page: targetPage,
      }, accessToken)
      const { items, totalPages } = normalizePaged(response, 50)
      setApiTickets(items)
      setSupportTotalPages(totalPages)
      setSupportPage(targetPage)
      setSupportSelectedCode((current) => (
        current && items.some((ticket) => ticket.ticketCode === current)
          ? current
          : items[0]?.ticketCode || null
      ))
    } catch (err) {
      notify(err.message || 'Không tải được ticket hỗ trợ.', 'error')
    } finally {
      setSupportLoading(false)
    }
  }, [accessToken, authInit, isAdmin, notify, supportQuery, supportPage, supportStatus, userActiveView])

  useEffect(() => {
    setSupportPage(0)
  }, [supportQuery, supportStatus])

  useEffect(() => {
    const timer = window.setTimeout(() => loadTickets(), 250)
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
        subject: ticketForm.subject.trim() || `Yêu cầu hỗ trợ ${ticketForm.category}`,
      }, accessToken)
      if (supportFile) {
        await userApi.uploadTicketAttachment(saved.ticketCode, supportFile, accessToken)
        setSupportFile(null)
      }
      setApiTickets((items) => [saved, ...normalizeList(items).filter((item) => item.ticketCode !== saved.ticketCode)])
      setSupportSelectedCode(saved.ticketCode)
      setTicketForm({ category: 'DEPOSIT', depositCode: '', message: '', orderCode: '', priority: 'NORMAL', subject: '' })
      notify(`Đã tạo ticket ${saved.ticketCode}.`, 'success')
      return saved
    } catch (err) {
      notify(err.message || 'Không tạo được ticket.', 'error')
      return null
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

    return (
      <Routes>
        <Route path="/catalog" element={
          <PublicLayout onLoginClick={handleOpenAuth}>
            <Catalog />
          </PublicLayout>
        } />
        <Route path="/services" element={
          <PublicLayout onLoginClick={handleOpenAuth}>
            <Catalog />
          </PublicLayout>
        } />
        <Route path="/product/:slug" element={
          <PublicLayout onLoginClick={handleOpenAuth}>
            <ProductDetail onLoginClick={handleOpenAuth} />
          </PublicLayout>
        } />
        <Route path="/service/:slug" element={
          <PublicLayout onLoginClick={handleOpenAuth}>
            <ProductDetail onLoginClick={handleOpenAuth} />
          </PublicLayout>
        } />
        <Route path="*" element={
          <PublicHome notice={apiNotice} onLoginClick={handleOpenAuth} />
        } />
      </Routes>
    )
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
        {adminActiveView === 'admin-overview' && adminOverview.error && (
          <p className="admin-message error">{adminOverview.error}</p>
        )}
        <AdminRoutes
          categories={adminOverview.categories}
          currentUser={currentUser}
          dashboard={adminOverview.dashboard}
          dashboardSummary={adminOverview.dashboardSummary}
          mountedPaths={adminRoutePaths}
          onCurrentUserChange={setCurrentUser}
          onSetError={handleAdminRouteError}
          onSetNotice={handleAdminNotice}
          pricingItems={adminOverview.pricing}
          revenue={adminOverview.revenue}
          revenueChart={adminOverview.revenueChart}
          health={adminOverview.health}
          auditLogs={adminOverview.auditLogs}
          bankTransactions={adminOverview.bankTransactions}
          servicePerformance={adminOverview.servicePerformance}
          services={adminOverview.services}
          token={accessToken}
          userActivity={adminOverview.userActivity}
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
      {routeLoading && userActiveView !== 'support' && userActiveView !== 'profile' && (
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
        detailOrderLoading={detailOrderLoading}
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
        onLoadOrder={handleLoadOrderDetail}
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
      <SupportWidget
        file={supportFile}
        onCreateTicket={handleCreateTicket}
        onFileChange={setSupportFile}
        onTicketFormChange={updateTicketForm}
        orders={orderList}
        submitting={supportSubmitting}
        ticketForm={ticketForm}
      />
      <PaymentChoiceModal
        balance={displayBalance}
        couponCode={checkoutCouponCode}
        couponError={checkoutCouponError}
        couponQuote={checkoutCouponQuote}
        couponSubmitting={checkoutCouponSubmitting}
        onApplyCoupon={handleApplyCheckoutCoupon}
        onClose={closeCheckoutModal}
        onCouponChange={handleCheckoutCouponChange}
        onPayTransfer={handlePayByTransfer}
        onPayWallet={handlePayWithWallet}
        service={checkoutService}
        submitting={checkoutSubmitting}
      />
      <TransferPaymentModal
        activeCheckout={activeCheckout}
        copied={copied}
        onCopy={copyText}
        onRefresh={handleRefreshDeposit}
        onCancel={handleCancelDeposit}
        onClose={() => {
          const isCompleted = activeCheckout?.deposit?.status === 'COMPLETED' || activeCheckout?.status === 'COMPLETED'
          setActiveCheckout(null)
          if (isCompleted) {
            handleUserViewChange('orders')
          }
        }}
      />
    </DashboardShell>
  )
}

export default App
