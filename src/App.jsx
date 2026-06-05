import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OrderTable from './components/orders/OrderTable'
import { adminNavItems } from './data/adminNavigation'
import { mockOrders, mockServices } from './data/mockData'
import AdminRoutes from './features/admin/AdminRoutes'
import AuthScreen from './features/auth/AuthScreen'
import DashboardShell from './features/dashboard/DashboardShell'
import DepositView from './features/deposit/DepositView'
import OverviewView from './features/overview/OverviewView'
import PublicHome from './features/public/PublicHome'
import ServicesView from './features/services/ServicesView'
import SupportView from './features/support/SupportView'
import { useClipboard } from './hooks/useClipboard'
import { adminApi } from './api/admin.api'
import { authApi } from './api/auth.api'
import { publicApi } from './api/public.api'
import { userApi } from './api/user.api'
import { money } from './utils/currency'
import { createPreviewDepositCode } from './utils/deposit'
import { createIdempotencyKey } from './utils/idempotency'
import { clearOAuthCallbackUrl, readOAuthCallback } from './utils/oauthCallback'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  hasPersistentSession,
  persistAccessToken,
} from './utils/session'

const initialOAuthCallback = readOAuthCallback()
const adminRoutePaths = adminNavItems.map((item) => item.path)

async function fetchAuthenticatedData(token) {
  const [me, walletData, orderData] = await Promise.all([
    userApi.getMe(token),
    userApi.getWallet(token),
    userApi.getOrders(token),
  ])

  return { me, orderData, walletData }
}

function settledValue(result, fallback) {
  return result.status === 'fulfilled' ? result.value : fallback
}

function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('overview')
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
  const [adminCategories, setAdminCategories] = useState([])
  const [adminServices, setAdminServices] = useState([])
  const [adminPricing, setAdminPricing] = useState([])
  const [adminDashboard, setAdminDashboard] = useState(null)
  const [adminRevenue, setAdminRevenue] = useState(null)
  const [adminOverviewError, setAdminOverviewError] = useState('')
  const [adminNotice, setAdminNotice] = useState('')
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

  const amountNumber = Number(depositAmount) || 0
  const depositCode = activeDeposit?.depositCode || createPreviewDepositCode(amountNumber)
  const serviceList = Array.isArray(apiServices) && apiServices.length > 0 ? apiServices : mockServices
  const orderList = Array.isArray(apiOrders) && apiOrders.length > 0 ? apiOrders : mockOrders
  const displayBalance = Number(wallet?.balance ?? currentUser?.balance ?? 1325000)
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  const normalizedPathname = normalizePathname(location.pathname)
  const isAdminPath = normalizedPathname === '/admin' || normalizedPathname.startsWith('/admin/')
  const adminActiveView = adminNavItems.find((item) => item.path === normalizedPathname)?.id || 'admin-overview'
  const userActiveView = activeView

  const metrics = useMemo(
    () => [
      { label: 'Số dư ví', value: money.format(displayBalance), tone: 'green' },
      {
        label: 'Đơn đang xử lý',
        value: String(orderList.filter((order) => order.status === 'PROCESSING').length).padStart(2, '0'),
        tone: 'orange',
      },
      { label: 'Ticket mở', value: '01', tone: 'blue' },
      { label: 'Manual review', value: '02', tone: 'red' },
    ],
    [displayBalance, orderList],
  )

  const applyAuthenticatedData = useCallback(({ me, orderData, walletData }) => {
    setCurrentUser(me)
    setWallet(walletData)
    setApiOrders(orderData)
    setApiNotice('')
    setAuthInit(true)
  }, [])

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
    fetchAuthenticatedData(accessToken)
      .then(applyAuthenticatedData)
      .catch(() => {
        setApiNotice('Không kết nối được API hoặc token đã hết hạn.')
        setAuthInit(true)
      })
  }, [accessToken, applyAuthenticatedData, rememberSession])

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
    ]).then((results) => {
      if (cancelled) return
      setAdminDashboard(settledValue(results[0], null))
      setAdminRevenue(settledValue(results[1], null))
      setAdminCategories(settledValue(results[2], []))
      setAdminServices(settledValue(results[3], []))
      setAdminPricing(settledValue(results[4], []))
      setAdminOverviewError(results.some((r) => r.status === 'rejected') ? 'Một phần dữ liệu tổng quan admin chưa tải được.' : '')
    }).catch(() => {
      if (!cancelled) setAdminOverviewError('Không tải được dữ liệu tổng quan admin. Kiểm tra quyền hoặc trạng thái backend.')
    })

    return () => {
      cancelled = true
    }
  }, [accessToken, isAdmin])

  useEffect(() => {
    if (authInit && accessToken && currentUser && !isAdmin && isAdminPath) {
      navigate('/', { replace: true })
    }
  }, [accessToken, authInit, currentUser, isAdmin, isAdminPath, navigate])

  const handleAuthSuccess = (response, remember = true) => {
    setRememberSession(remember)
    setAccessToken(response.accessToken)
    setCurrentUser(response.user)
    setShowAuthScreen(false)
    setApiNotice('Đăng nhập thành công.')
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
    setAdminCategories([])
    setAdminServices([])
    setAdminPricing([])
    setAdminDashboard(null)
    setAdminRevenue(null)
    setAdminOverviewError('')
    setAdminNotice('')
    setShowAuthScreen(false)
    setApiNotice('Đã đăng xuất.')
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

  const handleAdminRouteError = useCallback(() => {}, [])

  const handleDepositAmountChange = (value) => {
    setDepositAmount(value.replace(/\D/g, ''))
  }

  const handleCreateDeposit = async () => {
    if (!accessToken) {
      setApiNotice('Vui lòng đăng nhập trước khi tạo yêu cầu nạp.')
      return
    }

    try {
      const deposit = await userApi.createDeposit({ amount: amountNumber }, accessToken)

      setActiveDeposit(deposit)
      setApiNotice(`Đã tạo mã nạp ${deposit.depositCode}.`)
    } catch {
      setApiNotice('Không tạo được yêu cầu nạp. Kiểm tra backend hoặc số tiền tối thiểu.')
    }
  }

  const handlePurchase = async (service) => {
    if (!accessToken) {
      setApiNotice('Vui lòng đăng nhập trước khi mua dịch vụ.')
      return
    }

    try {
      const order = await userApi.createOrder({
        serviceId: service.id,
        inputData: JSON.stringify({ source: 'dashboard' }),
        idempotencyKey: createIdempotencyKey(service.id),
      }, accessToken)

      setApiOrders((items) => [order, ...items.filter((item) => item.orderCode !== order.orderCode)])
      applyAuthenticatedData(await fetchAuthenticatedData(accessToken))
      setApiNotice(`Đã tạo đơn ${order.orderCode}.`)
    } catch {
      setApiNotice('Không tạo được đơn. Kiểm tra số dư ví hoặc trạng thái dịch vụ.')
    }
  }

  const renderActiveView = () => {
    if (userActiveView === 'overview') {
      return <OverviewView metrics={metrics} orders={orderList} />
    }

    if (userActiveView === 'deposit') {
      return (
        <DepositView
          activeDeposit={activeDeposit}
          amountNumber={amountNumber}
          copied={copied}
          depositAmount={depositAmount}
          depositCode={depositCode}
          onAmountChange={handleDepositAmountChange}
          onCopy={copyText}
          onCreateDeposit={handleCreateDeposit}
        />
      )
    }

    if (userActiveView === 'services') {
      return <ServicesView services={serviceList} onPurchase={handlePurchase} />
    }

    if (userActiveView === 'orders') {
      return <OrderTable orders={orderList} />
    }

    return <SupportView />
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
    return <div className="loading">Đang tải...</div>
  }

  if (isAdmin) {
    return (
      <DashboardShell
        activeView={adminActiveView}
        displayBalance={displayBalance}
        footerLabel="Admin"
        footerTitle="Dịch vụ & bảng giá"
        items={adminNavItems}
        onLogout={handleLogout}
        onViewChange={handleAdminViewChange}
        showBalance={false}
        subtitle="Quản trị nội dung public site"
      >
        {adminNotice && <p className="admin-message">{adminNotice}</p>}
        {adminActiveView === 'admin-overview' && adminOverviewError && (
          <p className="admin-message error">{adminOverviewError}</p>
        )}
        <AdminRoutes
          categories={adminCategories}
          currentUser={currentUser}
          dashboard={adminDashboard}
          mountedPaths={adminRoutePaths}
          onCurrentUserChange={setCurrentUser}
          onSetError={handleAdminRouteError}
          onSetNotice={setAdminNotice}
          pricingItems={adminPricing}
          revenue={adminRevenue}
          services={adminServices}
          token={accessToken}
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      activeView={userActiveView}
      displayBalance={displayBalance}
      onLogout={handleLogout}
      onViewChange={setActiveView}
    >
      {renderActiveView()}
    </DashboardShell>
  )
}

export default App
