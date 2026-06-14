import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  FolderOpen,
  Gauge,
  Layers,
  LifeBuoy,
  PackageCheck,
  Plus,
  RefreshCcw,
  Search,
  Server,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  XCircle,
  Zap,
} from 'lucide-react'
import { formatAdminMoney } from '../adminFormat'

/* ================================================
 * AdminOverviewView.jsx
 * Viết lại dashboard theo hướng SaaS Command Center
 * Không tách component ra file nhỏ, giữ toàn bộ trong 1 file.
 * ================================================ */

const STATUS_SUCCESS = ['COMPLETED', 'CREDITED', 'MATCHED', 'SUCCESS', 'DONE', 'PAID']
const STATUS_PENDING = ['PENDING', 'PROCESSING', 'PENDING_VERIFY', 'MANUAL_REVIEW', 'UNMATCHED', 'WAITING']
const STATUS_FAILED = ['FAILED', 'ERROR', 'IGNORED', 'DUPLICATE', 'CANCELLED', 'REJECTED']

function safeArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  return ['content', 'items', 'data', 'records', 'results', 'rows'].map((key) => value[key]).find(Array.isArray) || []
}

function safeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function firstNumber(...values) {
  const found = values.find((value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)))
  return safeNumber(found, 0)
}

function sumBy(rows, keys) {
  return safeArray(rows).reduce((total, row) => total + pickNumber(row, keys), 0)
}

function pickNumber(row, keys) {
  const key = keys.find((item) => Number.isFinite(Number(row?.[item])))
  return safeNumber(row?.[key], 0)
}

function percent(part, total) {
  const base = safeNumber(total)
  if (base <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((safeNumber(part) / base) * 100)))
}

function normalizeStatus(value) {
  return String(value || '').trim().toUpperCase()
}

function countStatus(rows, statuses) {
  const allowed = new Set(statuses)
  return safeArray(rows).filter((row) => allowed.has(normalizeStatus(row.status || row.state || row.matchStatus || row.paymentStatus))).length
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function compactDate(value) {
  if (!value) return '-'
  const raw = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(5, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return raw.slice(0, 5)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date)
}

function trendText(current, previous) {
  const now = safeNumber(current)
  const prev = safeNumber(previous)
  if (prev <= 0 && now > 0) return '+100%'
  if (prev <= 0) return '0%'
  const value = Math.round(((now - prev) / prev) * 100)
  return `${value >= 0 ? '+' : ''}${value}%`
}

function MetricCard({ icon: Icon, label, value, hint, tone = 'blue', trend, onClick }) {
  return (
    <article className={`ov-card ov-metric ov-tone-${tone}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="ov-icon"><Icon size={21} strokeWidth={2.2} /></div>
      <div className="ov-metric-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
      {trend && <em>{trend}</em>}
    </article>
  )
}

function MiniStat({ label, value, icon: Icon, tone = 'blue' }) {
  return (
    <div className={`ov-mini-stat ov-tone-${tone}`}>
      <Icon size={18} strokeWidth={2.2} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function EmptyState({ text = 'Chưa có dữ liệu.' }) {
  return <p className="ov-empty-state">{text}</p>
}

function AreaChart({ rows = [], keys = ['grossRevenue'], labelKey = 'date', valueFormatter = (v) => v, tone = 'blue' }) {
  const data = safeArray(rows)
  if (!data.length) return <EmptyState text="Chưa có dữ liệu biểu đồ." />

  const width = 720
  const height = 260
  const padding = { top: 20, right: 18, bottom: 42, left: 76 }
  const values = data.map((row) => pickNumber(row, keys))
  const max = Math.max(1, ...values)
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const points = data.map((row, index) => {
    const x = padding.left + (data.length <= 1 ? innerW / 2 : (index / (data.length - 1)) * innerW)
    const y = padding.top + (1 - values[index] / max) * innerH
    return { x, y, row, value: values[index] }
  })
  const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${points.at(-1).x.toFixed(1)},${height - padding.bottom} L${points[0].x.toFixed(1)},${height - padding.bottom} Z`
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: padding.top + (1 - ratio) * innerH,
    value: Math.round(max * ratio),
  }))

  return (
    <svg className={`ov-area-chart ov-chart-${tone}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ thống kê">
      {ticks.map((tick) => (
        <g key={tick.y}>
          <line x1={padding.left} x2={width - padding.right} y1={tick.y} y2={tick.y} />
          <text x={padding.left - 12} y={tick.y + 4}>{valueFormatter(tick.value)}</text>
        </g>
      ))}
      <path className="ov-area-fill" d={areaPath} />
      <path className="ov-area-line" d={linePath} />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="4.5">
          <title>{`${point.row?.[labelKey] || index + 1}: ${valueFormatter(point.value)}`}</title>
        </circle>
      ))}
      {points.filter((_, index) => index % 2 === 0 || index === points.length - 1).map((point, index) => (
        <text className="ov-x-label" key={`${point.x}-${index}`} x={point.x} y={height - 12}>{compactDate(point.row?.[labelKey])}</text>
      ))}
    </svg>
  )
}

function Sparkline({ rows = [], keys = ['value'], tone = 'blue' }) {
  const data = safeArray(rows)
  const values = data.map((row) => pickNumber(row, keys))
  if (!values.length) return <div className="ov-sparkline-empty" />
  const max = Math.max(1, ...values)
  const points = values.map((value, index) => {
    const x = values.length <= 1 ? 50 : (index / (values.length - 1)) * 100
    const y = 84 - (value / max) * 70
    return `${x},${y}`
  }).join(' ')
  return (
    <svg className={`ov-sparkline ov-chart-${tone}`} viewBox="0 0 100 90" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
    </svg>
  )
}

function Donut({ value, total, label, tone = 'blue' }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const pct = percent(value, total)
  const dash = (pct / 100) * circumference
  return (
    <div className={`ov-donut ov-chart-${tone}`}>
      <svg viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r={radius} className="ov-donut-track" />
        <circle cx="56" cy="56" r={radius} className="ov-donut-fill" style={{ strokeDasharray: `${dash} ${circumference}` }} />
        <text x="56" y="52">{pct}%</text>
        <text x="56" y="70" className="ov-donut-label">{label}</text>
      </svg>
    </div>
  )
}

function ProgressRow({ title, subtitle, value, max, amount }) {
  const pct = Math.max(6, percent(value, max))
  return (
    <article className="ov-progress-row">
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className="ov-progress-meta">
        <b>{amount}</b>
        <i><em style={{ width: `${pct}%` }} /></i>
      </div>
    </article>
  )
}

function ActivityFeed({ logs = [] }) {
  const rows = safeArray(logs).slice(0, 10)
  if (!rows.length) return <EmptyState text="Chưa có activity feed từ audit logs." />
  return (
    <div className="ov-feed">
      {rows.map((log, index) => (
        <article key={log.id || log.auditId || index}>
          <span className="ov-feed-dot" />
          <div>
            <strong>{log.action || log.event || log.description || 'Hoạt động hệ thống'}</strong>
            <small>
              {log.actorName || log.adminEmail || log.username || log.entityType || 'System'}
              {log.ipAddress ? ` (${log.ipAddress})` : ''} · {formatDateTime(log.createdAt || log.timestamp)}
            </small>
          </div>
        </article>
      ))}
    </div>
  )
}

function BankStack({ success, pending, failed }) {
  const total = Math.max(1, success + pending + failed)
  return (
    <div className="ov-bank-stack">
      <div className="ov-bank-stack-bar">
        <span className="success" style={{ width: `${(success / total) * 100}%` }} />
        <span className="pending" style={{ width: `${(pending / total) * 100}%` }} />
        <span className="failed" style={{ width: `${(failed / total) * 100}%` }} />
      </div>
      <div className="ov-bank-legend">
        <b className="success">Thành công {success}</b>
        <b className="pending">Chờ {pending}</b>
        <b className="failed">Lỗi {failed}</b>
      </div>
    </div>
  )
}

function AdminOverviewView({
  auditLogs = [],
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
  const navigate = useNavigate()

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
      revenueRows,
      revenueRows14,
      revenueRows7,
      serviceRows,
      serviceMaxOrders,
      topCustomers,
      userGrowth,
      totalOrders,
      completedOrders,
      processingOrders,
      pendingTickets,
      todayRevenue,
      monthRevenue,
      walletBalance,
      newUsersToday,
      newUsersMonth,
      lockedUsers,
      activeServices,
      featuredServices,
      consultingOnly,
      bankSuccess,
      bankPending,
      bankFailed,
      manualReviewBankTransactions,
      totalRevenue14: sumBy(revenueRows14, ['grossRevenue', 'revenue', 'amount']),
      totalDeposits7: sumBy(revenueRows7, ['depositVolume', 'depositAmount', 'deposits']),
      totalRefunds7: sumBy(revenueRows7, ['refunds', 'refundAmount', 'failedAmount']),
    }
  }, [bankTransactions, categories, dashboard, dashboardSummary, pricingItems, revenue, revenueChart, servicePerformance, services, userActivity])

  const completionRate = percent(data.completedOrders, data.totalOrders)
  const latestRevenue = pickNumber(data.revenueRows.at(-1), ['grossRevenue', 'revenue', 'amount'])
  const previousRevenue = pickNumber(data.revenueRows.at(-2), ['grossRevenue', 'revenue', 'amount'])
  const latestOrders = pickNumber(data.revenueRows.at(-1), ['orderCount', 'orders', 'completedOrders'])
  const previousOrders = pickNumber(data.revenueRows.at(-2), ['orderCount', 'orders', 'completedOrders'])

  const quickActions = [
    { label: 'Tạo dịch vụ', desc: 'Thêm sản phẩm mới', path: '/admin/services', icon: Plus },
    { label: 'Tạo danh mục', desc: 'Quản lý catalog', path: '/admin/services', icon: FolderOpen },
    { label: 'Nạp thủ công', desc: 'Điều chỉnh ví user', path: '/admin/finance', icon: WalletCards },
    { label: 'Xử lý ticket', desc: 'Hỗ trợ khách hàng', path: '/admin/tickets', icon: LifeBuoy },
  ]

  return (
    <section className="admin-view ov-dashboard">
      <div className="ov-hero">
        <div>
          <h1>Tổng quan vận hành</h1>
          <p>Theo dõi doanh thu, đơn hàng, nạp tiền, ticket và sức khỏe hệ thống trong một màn hình.</p>
        </div>
        <div className="ov-hero-actions">
          <button type="button" onClick={() => navigate('/admin/orders')}><Search size={17} /> Tra cứu đơn</button>
          <button type="button" className="primary" onClick={() => navigate('/admin/services')}><Plus size={17} /> Tạo dịch vụ</button>
        </div>
      </div>

      <div className="ov-metrics-grid">
        <MetricCard icon={CircleDollarSign} label="Doanh thu hôm nay" value={formatAdminMoney(data.todayRevenue)} hint="Gross revenue trong ngày" tone="green" trend={trendText(latestRevenue, previousRevenue)} />
        <MetricCard icon={TrendingUp} label="Doanh thu tháng" value={formatAdminMoney(data.monthRevenue)} hint={`${formatAdminMoney(data.totalRevenue14)} trong 14 ngày`} tone="blue" />
        <MetricCard icon={ShoppingCart} label="Tổng đơn hàng" value={data.totalOrders} hint={`${data.completedOrders} đơn hoàn tất`} tone="violet" trend={trendText(latestOrders, previousOrders)} />
        <MetricCard icon={BadgeCheck} label="Tỷ lệ hoàn thành" value={`${completionRate}%`} hint={`${data.completedOrders}/${data.totalOrders} đơn`} tone="cyan" />
        <MetricCard icon={UserPlus} label="User mới" value={data.newUsersToday} hint={`${data.newUsersMonth} user mới trong tháng`} tone="blue" />
        <MetricCard icon={Ticket} label="Ticket chờ xử lý" value={data.pendingTickets} hint="Cần admin phản hồi" tone="orange" onClick={() => navigate('/admin/tickets')} />
        <MetricCard icon={ShieldAlert} label="Nạp cần kiểm tra" value={data.manualReviewBankTransactions} hint="Bank transaction cần đối soát" tone="rose" onClick={() => navigate('/admin/finance')} />
        <MetricCard icon={CreditCard} label="Ví đang giữ" value={formatAdminMoney(data.walletBalance)} hint="Liability hiện tại" tone="slate" />
      </div>

      <div className="ov-grid ov-grid-main">
        <section className="ov-panel ov-revenue-panel">
          <div className="ov-panel-head">
            <div>
              <span className="ov-eyebrow">Revenue Analytics</span>
              <h2>Doanh thu theo ngày</h2>
              <p>{formatAdminMoney(data.totalRevenue14)} gross · 14 ngày gần nhất</p>
            </div>
            <button type="button" onClick={() => navigate('/admin/finance')}>Xem tài chính <ArrowRight size={16} /></button>
          </div>
          <AreaChart rows={data.revenueRows14} keys={['grossRevenue', 'revenue', 'amount']} labelKey="date" valueFormatter={formatAdminMoney} tone="blue" />
        </section>

        <section className="ov-panel ov-side-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">Realtime</span>
              <h2>Hoạt động gần đây</h2>
            </div>
            <Activity size={20} />
          </div>
          <ActivityFeed logs={auditLogs} />
        </section>
      </div>

      <div className="ov-grid ov-grid-two">
        <section className="ov-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">Operations</span>
              <h2>Điểm cần theo dõi</h2>
            </div>
            <Gauge size={20} />
          </div>
          <div className="ov-mini-grid">
            <MiniStat icon={Users} label="User hoạt động" value={firstNumber(dashboard?.activeUsers, dashboardSummary?.activeUsers)} tone="blue" />
            <MiniStat icon={Clock3} label="Đơn xử lý" value={data.processingOrders} tone="orange" />
            <MiniStat icon={AlertTriangle} label="Nạp kiểm tra" value={data.manualReviewBankTransactions} tone="rose" />
            <MiniStat icon={Ticket} label="Ticket admin" value={data.pendingTickets} tone="violet" />
          </div>
        </section>

        <section className="ov-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">Catalog</span>
              <h2>Dịch vụ public site</h2>
            </div>
            <PackageCheck size={20} />
          </div>
          <div className="ov-mini-grid">
            <MiniStat icon={Layers} label="Đang bật" value={data.activeServices} tone="green" />
            <MiniStat icon={Sparkles} label="Gói nổi bật" value={data.featuredServices} tone="orange" />
            <MiniStat icon={LifeBuoy} label="Cần tư vấn" value={data.consultingOnly} tone="violet" />
            <MiniStat icon={FolderOpen} label="Nhóm dịch vụ" value={safeArray(categories).length} tone="blue" />
          </div>
        </section>
      </div>

      <div className="ov-growth-strip">
        <article className="ov-spark-card ov-tone-blue">
          <div><span>Tăng trưởng doanh thu</span><strong>{formatAdminMoney(latestRevenue)}</strong><small>{trendText(latestRevenue, previousRevenue)} so với kỳ trước</small></div>
          <Sparkline rows={data.revenueRows14} keys={['grossRevenue', 'revenue', 'amount']} tone="blue" />
        </article>
        <article className="ov-spark-card ov-tone-green">
          <div><span>Tăng trưởng nạp tiền</span><strong>{formatAdminMoney(sumBy(data.revenueRows7, ['depositVolume', 'depositAmount', 'deposits']))}</strong><small>7 ngày gần nhất</small></div>
          <Sparkline rows={data.revenueRows14} keys={['depositVolume', 'depositAmount', 'deposits']} tone="green" />
        </article>
        <article className="ov-spark-card ov-tone-violet">
          <div><span>Tăng trưởng đơn hàng</span><strong>{latestOrders}</strong><small>{trendText(latestOrders, previousOrders)} so với kỳ trước</small></div>
          <Sparkline rows={data.revenueRows14} keys={['orderCount', 'orders', 'completedOrders']} tone="violet" />
        </article>
      </div>

      <div className="ov-grid ov-grid-two ov-insight-grid">
        <section className="ov-panel ov-top-customers-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">Top Customers</span>
              <h2>Khách hàng giá trị cao</h2>
            </div>
            <span className="ov-count">{data.topCustomers.length} khách</span>
          </div>
          <div className="ov-customer-list compact">
            {data.topCustomers.slice(0, 4).map((customer, index) => (
              <article key={customer.userId || customer.id || customer.email || index}>
                <span>#{index + 1}</span>
                <div>
                  <strong>{customer.fullName || customer.name || customer.email || `Khách hàng ${index + 1}`}</strong>
                  <small>{customer.email || customer.username || '-'}</small>
                </div>
                <b>{formatAdminMoney(customer.revenue ?? customer.totalRevenue ?? customer.totalSpent ?? customer.amount)}</b>
              </article>
            ))}
            {!data.topCustomers.length && <EmptyState text="Backend chưa trả dữ liệu top khách hàng." />}
          </div>
        </section>

        <section className="ov-panel ov-order-quality-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">Order Quality</span>
              <h2>Tỷ lệ hoàn thành đơn</h2>
              <p>{data.completedOrders}/{data.totalOrders} đơn hoàn tất</p>
            </div>
          </div>
          <div className="ov-donut-layout">
            <Donut value={data.completedOrders} total={data.totalOrders} label="Hoàn tất" tone="cyan" />
            <div className="ov-donut-info">
              <strong>{completionRate}%</strong>
              <span>Đơn được xử lý thành công</span>
              <p>{Math.max(0, data.totalOrders - data.completedOrders)} đơn còn lại đang chờ xử lý hoặc cần kiểm tra.</p>
            </div>
          </div>
        </section>
        <section className="ov-panel ov-bank-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">Bank Monitoring</span>
              <h2>Ngân hàng & đối soát</h2>
              <p>7 ngày: Nạp {formatAdminMoney(data.totalDeposits7)} · Hoàn {formatAdminMoney(data.totalRefunds7)}</p>
            </div>
            <Banknote size={20} />
          </div>
          <BankStack success={data.bankSuccess} pending={data.bankPending} failed={data.bankFailed} />
          <div className="ov-mini-grid three bank">
            <MiniStat icon={CheckCircle2} label="Thành công" value={data.bankSuccess} tone="green" />
            <MiniStat icon={Clock3} label="Chờ xử lý" value={data.bankPending} tone="orange" />
            <MiniStat icon={XCircle} label="Giao dịch lỗi" value={data.bankFailed} tone="rose" />
          </div>
        </section>

        <section className="ov-panel ov-top-services-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">Top Services</span>
              <h2>Dịch vụ bán chạy</h2>
            </div>
            <span className="ov-count">{data.serviceRows.length} dịch vụ</span>
          </div>
          <div className="ov-progress-list">
            {data.serviceRows.slice(0, 8).map((item, index) => (
              <ProgressRow
                key={item.serviceId || item.id || item.serviceName || index}
                title={item.serviceName || item.name || `Dịch vụ ${index + 1}`}
                subtitle={formatAdminMoney(item.revenue || item.amount)}
                value={safeNumber(item.orderCount)}
                max={data.serviceMaxOrders}
                amount={`${safeNumber(item.orderCount)} đơn`}
              />
            ))}
            {!data.serviceRows.length && <EmptyState text="Chưa có dữ liệu dịch vụ." />}
          </div>
        </section>
      </div>

      <section className="ov-panel ov-actions-panel">
        <div className="ov-panel-head compact">
          <div>
            <span className="ov-eyebrow">Quick Actions</span>
            <h2>Thao tác nhanh</h2>
          </div>
        </div>
        <div className="ov-action-grid">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button type="button" key={action.label} onClick={() => navigate(action.path)}>
                <Icon size={20} strokeWidth={2.2} />
                <span>{action.label}</span>
                <small>{action.desc}</small>
              </button>
            )
          })}
        </div>
      </section>
    </section>
  )
}

export default AdminOverviewView
