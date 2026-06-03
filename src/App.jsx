import { useCallback, useEffect, useMemo, useState } from 'react'
import OrderTable from './components/orders/OrderTable'
import { mockOrders, mockServices } from './data/mockData'
import AuthScreen from './features/auth/AuthScreen'
import DashboardShell from './features/dashboard/DashboardShell'
import DepositView from './features/deposit/DepositView'
import OverviewView from './features/overview/OverviewView'
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
  const [depositAmount, setDepositAmount] = useState('250000')
  const [accessToken, setAccessToken] = useState(() => initialOAuthCallback?.token || getStoredAccessToken())
  const [rememberSession, setRememberSession] = useState(() => Boolean(initialOAuthCallback?.token) || hasPersistentSession())
  const [currentUser, setCurrentUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [apiServices, setApiServices] = useState([])
  const [apiOrders, setApiOrders] = useState([])
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

  const handleAuthSuccess = (response, remember = true) => {
    setRememberSession(remember)
    setAccessToken(response.accessToken)
    setCurrentUser(response.user)
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
    setApiNotice('Đã đăng xuất.')
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
    if (activeView === 'overview') {
      return <OverviewView metrics={metrics} orders={orderList} />
    }

    if (activeView === 'deposit') {
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

    if (activeView === 'services') {
      return <ServicesView services={serviceList} onPurchase={handlePurchase} />
    }

    if (activeView === 'orders') {
      return <OrderTable orders={orderList} />
    }

    return <SupportView />
  }

  if (!accessToken) {
    return <AuthScreen notice={apiNotice} onSuccess={handleAuthSuccess} />
  }

  return (
    <DashboardShell
      activeView={activeView}
      displayBalance={displayBalance}
      onLogout={handleLogout}
      onViewChange={setActiveView}
    >
      {renderActiveView()}
    </DashboardShell>
  )
}

export default App
