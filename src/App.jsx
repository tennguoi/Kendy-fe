import { useCallback, useEffect, useMemo, useState } from 'react'
import OrderTable from './components/orders/OrderTable'
import { adminNavItems } from './data/adminNavigation'
import { mockOrders, mockServices } from './data/mockData'
import AdminOverviewView from './features/admin/AdminOverviewView'
import AdminPricingView from './features/admin/AdminPricingView'
import AdminServicesView from './features/admin/AdminServicesView'
import AdminSettingsView from './features/admin/AdminSettingsView'
import AuthScreen from './features/auth/AuthScreen'
import DashboardShell from './features/dashboard/DashboardShell'
import DepositView from './features/deposit/DepositView'
import OverviewView from './features/overview/OverviewView'
import PublicHome from './features/public/PublicHome'
import ServicesView from './features/services/ServicesView'
import SupportView from './features/support/SupportView'
import { useClipboard } from './hooks/useClipboard'
import { apiRequest } from './lib/api'
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

async function fetchAuthenticatedData(token) {
  const [me, walletData, orderData] = await Promise.all([
    apiRequest('/api/me', { token }),
    apiRequest('/api/wallet', { token }),
    apiRequest('/api/orders', { token }),
  ])

  return { me, orderData, walletData }
}

function App() {
  const [activeView, setActiveView] = useState('overview')
  const [showAuthScreen, setShowAuthScreen] = useState(() => Boolean(initialOAuthCallback?.error))
  const [depositAmount, setDepositAmount] = useState('250000')
  const [accessToken, setAccessToken] = useState(() => initialOAuthCallback?.token || getStoredAccessToken())
  const [rememberSession, setRememberSession] = useState(() => Boolean(initialOAuthCallback?.token) || hasPersistentSession())
  const [currentUser, setCurrentUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [apiServices, setApiServices] = useState([])
  const [apiOrders, setApiOrders] = useState([])
  const [adminCategories, setAdminCategories] = useState([])
  const [adminServices, setAdminServices] = useState([])
  const [adminPricing, setAdminPricing] = useState([])
  const [adminSettings, setAdminSettings] = useState({})
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminNotice, setAdminNotice] = useState('')
  const [activeDeposit, setActiveDeposit] = useState(null)
  const [apiNotice, setApiNotice] = useState(() => {
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
  const serviceList = apiServices.length > 0 ? apiServices : mockServices
  const orderList = apiOrders.length > 0 ? apiOrders : mockOrders
  const displayBalance = Number(wallet?.balance ?? currentUser?.balance ?? 1325000)
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  const adminActiveView = activeView.startsWith('admin-') ? activeView : 'admin-overview'
  const userActiveView = activeView.startsWith('admin-') ? 'overview' : activeView

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
  }, [])

  useEffect(() => {
    let isMounted = true

    if (initialOAuthCallback) {
      clearOAuthCallbackUrl()
    }

    apiRequest('/api/services')
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
      })
  }, [accessToken, applyAuthenticatedData, rememberSession])

  const loadAdminData = useCallback(async () => {
    if (!accessToken || !isAdmin) {
      return
    }

    setAdminLoading(true)
    setAdminError('')
    try {
      const [categories, services, pricing, settingsList] = await Promise.all([
        apiRequest('/api/admin/service-categories', { token: accessToken }),
        apiRequest('/api/admin/services/search?limit=200&sort=sort_order', { token: accessToken }),
        apiRequest('/api/admin/pricing?limit=200&sort=sort_order', { token: accessToken }),
        apiRequest('/api/admin/settings/search', { token: accessToken }),
      ])

      setAdminCategories(categories || [])
      setAdminServices(services || [])
      setAdminPricing(pricing || [])
      if (Array.isArray(settingsList)) {
        const map = {}
        settingsList.forEach((s) => { map[s.key] = s.value })
        setAdminSettings(map)
      }
    } catch {
      setAdminError('Không tải được dữ liệu admin. Kiểm tra quyền hoặc trạng thái backend.')
    } finally {
      setAdminLoading(false)
    }
  }, [accessToken, isAdmin])

  useEffect(() => {
    if (isAdmin) {
      Promise.resolve().then(loadAdminData)
    }
  }, [isAdmin, loadAdminData])

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
        await apiRequest('/api/auth/logout', { method: 'POST', token: accessToken })
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
    setAdminSettings({})
    setAdminError('')
    setAdminNotice('')
    setShowAuthScreen(false)
    setApiNotice('Đã đăng xuất.')
  }

  const handleOpenAuth = () => {
    setShowAuthScreen(true)
    if (apiNotice === 'Đã đăng xuất.') {
      setApiNotice('')
    }
  }

  const handleDepositAmountChange = (value) => {
    setDepositAmount(value.replace(/\D/g, ''))
  }

  const handleCreateDeposit = async () => {
    if (!accessToken) {
      setApiNotice('Vui lòng đăng nhập trước khi tạo yêu cầu nạp.')
      return
    }

    try {
      const deposit = await apiRequest('/api/deposits', {
        method: 'POST',
        token: accessToken,
        body: { amount: amountNumber },
      })

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
      const order = await apiRequest('/api/orders', {
        method: 'POST',
        token: accessToken,
        body: {
          serviceId: service.id,
          inputData: JSON.stringify({ source: 'dashboard' }),
          idempotencyKey: createIdempotencyKey(service.id),
        },
      })

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

  const renderAdminView = () => {
    if (adminActiveView === 'admin-services') {
      return (
        <AdminServicesView
          categories={adminCategories}
          error={adminError}
          loading={adminLoading}
          onReload={loadAdminData}
          onSetError={setAdminError}
          onSetNotice={setAdminNotice}
          onUpdateCategories={setAdminCategories}
          onUpdateServices={setAdminServices}
          services={adminServices}
          token={accessToken}
        />
      )
    }

    if (adminActiveView === 'admin-pricing') {
      return (
        <AdminPricingView
          categories={adminCategories}
          error={adminError}
          loading={adminLoading}
          onReload={loadAdminData}
          onSetError={setAdminError}
          onSetNotice={setAdminNotice}
          onUpdatePricing={setAdminPricing}
          pricingItems={adminPricing}
          token={accessToken}
        />
      )
    }

    if (adminActiveView === 'admin-settings') {
      return (
        <AdminSettingsView
          error={adminError}
          loading={adminLoading}
          onReload={loadAdminData}
          onSetError={setAdminError}
          onSetNotice={setAdminNotice}
          settings={adminSettings}
          token={accessToken}
        />
      )
    }

    return <AdminOverviewView categories={adminCategories} pricingItems={adminPricing} services={adminServices} />
  }

  if (!accessToken) {
    if (showAuthScreen) {
      return <AuthScreen notice={apiNotice} onBack={() => setShowAuthScreen(false)} onSuccess={handleAuthSuccess} />
    }

    return <PublicHome notice={apiNotice} onLoginClick={handleOpenAuth} />
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
        onViewChange={setActiveView}
        showBalance={false}
        subtitle="Quản trị nội dung public site"
      >
        {adminNotice && <p className="admin-message">{adminNotice}</p>}
        {renderAdminView()}
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
