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
  FolderOpen,
  Gauge,
  Layers,
  LifeBuoy,
  PackageCheck,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  XCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { formatAdminMoney } from '../adminFormat'
import ActivityFeed from './components/ActivityFeed'
import AreaChart from './components/AreaChart'
import BankStack from './components/BankStack'
import Donut from './components/Donut'
import EmptyState from './components/EmptyState'
import MetricCard from './components/MetricCard'
import MiniStat from './components/MiniStat'
import ProgressRow from './components/ProgressRow'
import Sparkline from './components/Sparkline'
import { useOverviewMetrics } from './hooks/useOverviewMetrics'
import { firstNumber, safeArray, safeNumber, sumBy, trendText } from './overview.utils'

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
  const { t } = useTranslation()

  const {
    completionRate,
    data,
    latestOrders,
    latestRevenue,
    previousOrders,
    previousRevenue,
  } = useOverviewMetrics({
    bankTransactions,
    categories,
    dashboard,
    dashboardSummary,
    pricingItems,
    revenue,
    revenueChart,
    servicePerformance,
    services,
    userActivity,
  })

  const quickActions = [
    { desc: t('admin.overview.createServiceDesc'), icon: Plus, label: t('admin.overview.createServiceAction'), path: '/admin/services' },
    { desc: t('admin.overview.createCategoryDesc'), icon: FolderOpen, label: t('admin.overview.createCategory'), path: '/admin/services' },
    { desc: t('admin.overview.manualDepositDesc'), icon: WalletCards, label: t('admin.overview.manualDeposit'), path: '/admin/finance' },
    { desc: t('admin.overview.processTicketDesc'), icon: LifeBuoy, label: t('admin.overview.processTicket'), path: '/admin/tickets' },
  ]

  return (
    <section className="admin-view ov-dashboard">
      <div className="ov-hero">
        <div>
          <h1>{t('admin.overview.title')}</h1>
          <p>{t('admin.overview.description')}</p>
        </div>
        <div className="ov-hero-actions">
          <button type="button" onClick={() => navigate('/admin/orders')}>
            <Search size={17} /> {t('admin.overview.lookupOrder')}
          </button>
          <button type="button" className="primary" onClick={() => navigate('/admin/services')}>
            <Plus size={17} /> {t('admin.overview.createService')}
          </button>
        </div>
      </div>

      <div className="ov-metrics-grid">
        <MetricCard
          icon={CircleDollarSign}
          label={t('admin.overview.metrics.revenueToday')}
          value={formatAdminMoney(data.todayRevenue)}
          hint={t('admin.overview.metrics.revenueTodayHint')}
          tone="green"
          trend={trendText(latestRevenue, previousRevenue)}
        />
        <MetricCard
          icon={TrendingUp}
          label={t('admin.overview.metrics.monthRevenue')}
          value={formatAdminMoney(data.monthRevenue)}
          hint={`${formatAdminMoney(data.totalRevenue14)} ${t('admin.overview.metrics.monthRevenueHint')}`}
          tone="blue"
        />
        <MetricCard
          icon={ShoppingCart}
          label={t('admin.overview.metrics.totalOrders')}
          value={data.totalOrders}
          hint={`${data.completedOrders} ${t('admin.overview.metrics.totalOrdersHint')}`}
          tone="violet"
          trend={trendText(latestOrders, previousOrders)}
        />
        <MetricCard
          icon={BadgeCheck}
          label={t('admin.overview.metrics.completionRate')}
          value={`${completionRate}%`}
          hint={`${data.completedOrders}/${data.totalOrders} ${t('admin.overview.metrics.completionRateHint')}`}
          tone="cyan"
        />
        <MetricCard
          icon={UserPlus}
          label={t('admin.overview.metrics.newUsers')}
          value={data.newUsersToday}
          hint={`${data.newUsersMonth} ${t('admin.overview.metrics.newUsersHint')}`}
          tone="blue"
        />
        <MetricCard
          icon={Ticket}
          label={t('admin.overview.metrics.pendingTickets')}
          value={data.pendingTickets}
          hint={t('admin.overview.metrics.pendingTicketsHint')}
          tone="orange"
          onClick={() => navigate('/admin/tickets')}
        />
        <MetricCard
          icon={ShieldAlert}
          label={t('admin.overview.metrics.manualReview')}
          value={data.manualReviewBankTransactions}
          hint={t('admin.overview.metrics.manualReviewHint')}
          tone="rose"
          onClick={() => navigate('/admin/finance')}
        />
        <MetricCard
          icon={CreditCard}
          label={t('admin.overview.metrics.walletLiability')}
          value={formatAdminMoney(data.walletBalance)}
          hint={t('admin.overview.metrics.walletLiabilityHint')}
          tone="slate"
        />
        {data.lowStockServices > 0 && (
          <MetricCard
            icon={AlertTriangle}
            label={t('admin.overview.metrics.lowStock')}
            value={data.lowStockServices}
            hint={t('admin.overview.metrics.lowStockHint')}
            tone="rose"
            onClick={() => navigate('/admin/services')}
          />
        )}
        <MetricCard
          icon={RefreshCcw}
          label={t('admin.overview.metrics.manualProcessing')}
          value={data.manualProcessingOrders}
          hint={t('admin.overview.metrics.manualProcessingHint')}
          tone="orange"
          onClick={() => navigate('/admin/orders')}
        />
        <MetricCard
          icon={LifeBuoy}
          label={t('admin.overview.metrics.warrantyPending')}
          value={data.openWarrantyRequests}
          hint={t('admin.overview.metrics.warrantyPendingHint')}
          tone="violet"
          onClick={() => navigate('/admin/warranty')}
        />
        {data.expiringCredentials > 0 && (
          <MetricCard
            icon={Clock3}
            label={t('admin.overview.metrics.expiringSoon')}
            value={data.expiringCredentials}
            hint={t('admin.overview.metrics.expiringSoonHint')}
            tone="rose"
            onClick={() => navigate('/admin/services')}
          />
        )}
      </div>

      <div className="ov-grid ov-grid-main">
        <section className="ov-panel ov-revenue-panel">
          <div className="ov-panel-head">
            <div>
              <span className="ov-eyebrow">{t('admin.overview.revenueChart.eyebrow')}</span>
              <h2>{t('admin.overview.revenueChart.title')}</h2>
              <p>{formatAdminMoney(data.totalRevenue14)} {t('admin.overview.revenueChart.subtitle')}</p>
            </div>
            <button type="button" onClick={() => navigate('/admin/finance')}>
              {t('admin.overview.revenueChart.viewFinance')} <ArrowRight size={16} />
            </button>
          </div>
          <AreaChart
            rows={data.revenueRows14}
            keys={['grossRevenue', 'revenue', 'amount']}
            labelKey="date"
            valueFormatter={formatAdminMoney}
            tone="blue"
          />
        </section>

        <section className="ov-panel ov-side-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">{t('admin.overview.activityFeed.eyebrow')}</span>
              <h2>{t('admin.overview.activityFeed.title')}</h2>
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
              <span className="ov-eyebrow">{t('admin.overview.monitoring.eyebrow')}</span>
              <h2>{t('admin.overview.monitoring.title')}</h2>
            </div>
            <Gauge size={20} />
          </div>
          <div className="ov-mini-grid">
            <MiniStat
              icon={Users}
              label={t('admin.overview.miniStats.activeUsers')}
              value={firstNumber(dashboard?.activeUsers, dashboardSummary?.activeUsers)}
              tone="blue"
            />
            <MiniStat
              icon={Clock3}
              label={t('admin.overview.miniStats.processingOrders')}
              value={data.processingOrders}
              tone="orange"
            />
            <MiniStat
              icon={AlertTriangle}
              label={t('admin.overview.miniStats.manualReviewNaps')}
              value={data.manualReviewBankTransactions}
              tone="rose"
            />
            <MiniStat
              icon={Ticket}
              label={t('admin.overview.miniStats.ticketAdmin')}
              value={data.pendingTickets}
              tone="violet"
            />
            {data.manualProcessingOrders > 0 && (
              <MiniStat
                icon={RefreshCcw}
                label={t('admin.overview.miniStats.manual')}
                value={data.manualProcessingOrders}
                tone="orange"
              />
            )}
            {data.openWarrantyRequests > 0 && (
              <MiniStat
                icon={LifeBuoy}
                label={t('admin.overview.miniStats.warranty')}
                value={data.openWarrantyRequests}
                tone="violet"
              />
            )}
            {data.lowStockServices > 0 && (
              <MiniStat
                icon={AlertTriangle}
                label={t('admin.overview.miniStats.lowStock')}
                value={data.lowStockServices}
                tone="rose"
              />
            )}
            {data.expiringCredentials > 0 && (
              <MiniStat
                icon={Clock3}
                label={t('admin.overview.miniStats.expired')}
                value={data.expiringCredentials}
                tone="rose"
              />
            )}
          </div>
        </section>

        <section className="ov-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">{t('admin.overview.catalog.eyebrow')}</span>
              <h2>{t('admin.overview.catalog.title')}</h2>
            </div>
            <PackageCheck size={20} />
          </div>
          <div className="ov-mini-grid">
            <MiniStat icon={Layers} label={t('admin.overview.catalog.active')} value={data.activeServices} tone="green" />
            <MiniStat icon={Sparkles} label={t('admin.overview.catalog.featured')} value={data.featuredServices} tone="orange" />
            <MiniStat icon={LifeBuoy} label={t('admin.overview.catalog.consulting')} value={data.consultingOnly} tone="violet" />
            <MiniStat icon={FolderOpen} label={t('admin.overview.catalog.categories')} value={safeArray(categories).length} tone="blue" />
          </div>
        </section>
      </div>

      <div className="ov-growth-strip">
        <article className="ov-spark-card ov-tone-blue">
          <div>
            <span>{t('admin.overview.growth.revenue')}</span>
            <strong>{formatAdminMoney(latestRevenue)}</strong>
            <small>{trendText(latestRevenue, previousRevenue)} {t('admin.overview.growth.vsPrevious')}</small>
          </div>
          <Sparkline rows={data.revenueRows14} keys={['grossRevenue', 'revenue', 'amount']} tone="blue" />
        </article>
        <article className="ov-spark-card ov-tone-green">
          <div>
            <span>{t('admin.overview.growth.deposit')}</span>
            <strong>{formatAdminMoney(sumBy(data.revenueRows7, ['depositVolume', 'depositAmount', 'deposits']))}</strong>
            <small>{t('admin.overview.growth.last7Days')}</small>
          </div>
          <Sparkline rows={data.revenueRows14} keys={['depositVolume', 'depositAmount', 'deposits']} tone="green" />
        </article>
        <article className="ov-spark-card ov-tone-violet">
          <div>
            <span>{t('admin.overview.growth.orders')}</span>
            <strong>{latestOrders}</strong>
            <small>{trendText(latestOrders, previousOrders)} {t('admin.overview.growth.vsPrevious')}</small>
          </div>
          <Sparkline rows={data.revenueRows14} keys={['orderCount', 'orders', 'completedOrders']} tone="violet" />
        </article>
      </div>

      <div className="ov-grid ov-grid-two ov-insight-grid">
        <section className="ov-panel ov-top-customers-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">{t('admin.overview.topCustomers.eyebrow')}</span>
              <h2>{t('admin.overview.topCustomers.title')}</h2>
            </div>
            <span className="ov-count">{data.topCustomers.length} {t('admin.overview.topCustomers.customers')}</span>
          </div>
          <div className="ov-customer-list compact">
            {data.topCustomers.slice(0, 4).map((customer, index) => (
              <article key={customer.userId || customer.id || customer.email || index}>
                <span>#{index + 1}</span>
                <div>
                  <strong>
                    {customer.fullName || customer.name || customer.email || `${t('admin.overview.topCustomers.customer')} ${index + 1}`}
                  </strong>
                  <small>{customer.email || customer.username || '-'}</small>
                </div>
                <b>{formatAdminMoney(customer.revenue ?? customer.totalRevenue ?? customer.totalSpent ?? customer.amount)}</b>
              </article>
            ))}
            {!data.topCustomers.length && <EmptyState text={t('admin.overview.topCustomers.empty')} />}
          </div>
        </section>

        <section className="ov-panel ov-order-quality-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">{t('admin.overview.orderQuality.eyebrow')}</span>
              <h2>{t('admin.overview.orderQuality.title')}</h2>
              <p>{data.completedOrders}/{data.totalOrders} {t('admin.overview.orderQuality.completed')}</p>
            </div>
          </div>
          <div className="ov-donut-layout">
            <Donut value={data.completedOrders} total={data.totalOrders} label={t('admin.overview.orderQuality.completed')} tone="cyan" />
            <div className="ov-donut-info">
              <strong>{completionRate}%</strong>
              <span>{t('admin.overview.orderQuality.successLabel')}</span>
              <p>{Math.max(0, data.totalOrders - data.completedOrders)} {t('admin.overview.orderQuality.remainingLabel')}</p>
            </div>
          </div>
        </section>

        <section className="ov-panel ov-bank-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">{t('admin.overview.bankMonitoring.eyebrow')}</span>
              <h2>{t('admin.overview.bankMonitoring.title')}</h2>
              <p>
                {t('admin.overview.bankMonitoring.subtitle', {
                  deposits: formatAdminMoney(data.totalDeposits7),
                  refunds: formatAdminMoney(data.totalRefunds7),
                })}
              </p>
            </div>
            <Banknote size={20} />
          </div>
          <BankStack success={data.bankSuccess} pending={data.bankPending} failed={data.bankFailed} />
          <div className="ov-mini-grid three bank">
            <MiniStat icon={CheckCircle2} label={t('admin.overview.bankMonitoring.successCount')} value={data.bankSuccess} tone="green" />
            <MiniStat icon={Clock3} label={t('admin.overview.bankMonitoring.pendingCount')} value={data.bankPending} tone="orange" />
            <MiniStat icon={XCircle} label={t('admin.overview.bankMonitoring.failedCount')} value={data.bankFailed} tone="rose" />
          </div>
        </section>

        <section className="ov-panel ov-top-services-panel">
          <div className="ov-panel-head compact">
            <div>
              <span className="ov-eyebrow">{t('admin.overview.topServices.eyebrow')}</span>
              <h2>{t('admin.overview.topServices.title')}</h2>
            </div>
            <span className="ov-count">{data.serviceRows.length} {t('admin.overview.topServices.services')}</span>
          </div>
          <div className="ov-progress-list">
            {data.serviceRows.slice(0, 8).map((item, index) => (
              <ProgressRow
                key={item.serviceId || item.id || item.serviceName || index}
                title={item.serviceName || item.name || `${t('admin.overview.topServices.service')} ${index + 1}`}
                subtitle={formatAdminMoney(item.revenue || item.amount)}
                value={safeNumber(item.orderCount)}
                max={data.serviceMaxOrders}
                amount={`${safeNumber(item.orderCount)} ${t('admin.overview.topServices.orders')}`}
              />
            ))}
            {!data.serviceRows.length && <EmptyState text={t('admin.overview.topServices.empty')} />}
          </div>
        </section>
      </div>

      <section className="ov-panel ov-actions-panel">
        <div className="ov-panel-head compact">
          <div>
            <span className="ov-eyebrow">{t('admin.overview.quickActions')}</span>
            <h2>{t('admin.overview.quickActions')}</h2>
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
