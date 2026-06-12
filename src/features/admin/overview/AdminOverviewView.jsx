import { Activity, Clock, CreditCard, DollarSign, FolderOpen, Layers, ShieldAlert, Users } from 'lucide-react'
import { formatAdminMoney } from '../adminFormat'

function maxValue(rows, key) {
  return Math.max(1, ...rows.map((row) => Number(row[key]) || 0))
}

function AdminOverviewView({
  categories,
  dashboard,
  dashboardSummary,
  pricingItems,
  revenue,
  revenueChart = [],
  servicePerformance = [],
  services,
  userActivity,
}) {
  const activeServices = services.filter((service) => service.status === 'ACTIVE').length
  const featuredServices = pricingItems.filter((service) => service.featured).length
  const consultingOnly = pricingItems.filter((service) => service.stockStatus === 'CONSULTING_ONLY').length
  const metrics = [
    { label: 'User hoạt động', value: dashboard?.activeUsers ?? 0, icon: Users, accent: '' },
    { label: 'Đơn đang xử lý', value: dashboard?.processingOrders ?? 0, icon: Clock, accent: 'accent-amber' },
    { label: 'Nạp cần kiểm tra', value: dashboard?.manualReviewDeposits ?? 0, icon: ShieldAlert, accent: 'accent-rose' },
    { label: 'Ticket chờ admin', value: dashboard?.pendingAdminTickets ?? 0, icon: Activity, accent: 'accent-violet' },
    { label: 'Ví đang giữ', value: formatAdminMoney(revenue?.walletLiability || dashboard?.totalWalletBalance), icon: CreditCard, accent: '' },
    { label: 'Doanh thu hôm nay', value: formatAdminMoney(dashboard?.todayRevenue), icon: DollarSign, accent: 'accent-emerald' },
    { label: 'Dịch vụ đang bật', value: activeServices, icon: Layers, accent: '' },
    { label: 'Nhóm dịch vụ', value: categories.length, icon: FolderOpen, accent: '' },
  ]
  const recentRevenue = revenueChart.slice(-7)
  const maxRevenue = maxValue(recentRevenue, 'grossRevenue')
  const maxOrders = maxValue(servicePerformance, 'orderCount')

  return (
    <section className="admin-view">
      <div className="admin-metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article className={`admin-metric ${metric.accent}`} key={metric.label}>
              <div className="admin-metric-icon">
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="admin-metric-body">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            </article>
          )
        })}
      </div>

      <div className="admin-grid two-columns">
        <div className="admin-empty-panel">
          <span className="eyebrow">Operations</span>
          <h2>Điểm cần theo dõi trong ngày</h2>
          <div className="admin-report-grid compact-report">
            <div><span>Tổng user</span><strong>{dashboardSummary?.users ?? 0}</strong></div>
            <div><span>User mới hôm nay</span><strong>{userActivity?.newUsersToday ?? 0}</strong></div>
            <div><span>User khóa</span><strong>{userActivity?.lockedUsers ?? dashboardSummary?.lockedUsers ?? 0}</strong></div>
            <div><span>Bank transactions</span><strong>{dashboardSummary?.bankTransactions ?? 0}</strong></div>
          </div>
        </div>

        <div className="admin-empty-panel">
          <span className="eyebrow">Catalog</span>
          <h2>Dịch vụ public site</h2>
          <div className="admin-report-grid compact-report">
            <div><span>Gói nổi bật</span><strong>{featuredServices}</strong></div>
            <div><span>Cần tư vấn</span><strong>{consultingOnly}</strong></div>
            <div><span>Tổng đơn</span><strong>{dashboardSummary?.orders ?? 0}</strong></div>
            <div><span>Hoàn tất</span><strong>{dashboardSummary?.completedOrders ?? 0}</strong></div>
          </div>
        </div>
      </div>

      <div className="admin-grid two-columns">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Doanh thu 7 ngày</h3>
            <span>{revenueChart.length} ngày</span>
          </div>
          <div className="admin-trend-list">
            {recentRevenue.map((row) => (
              <article key={row.date}>
                <div>
                  <strong>{row.date}</strong>
                  <span>Nạp {formatAdminMoney(row.depositVolume)} · Hoàn {formatAdminMoney(row.refunds)}</span>
                </div>
                <div className="admin-trend-value">
                  <strong>{formatAdminMoney(row.grossRevenue)}</strong>
                  <span style={{ width: `${Math.max(8, ((Number(row.grossRevenue) || 0) / maxRevenue) * 100)}%` }} />
                </div>
              </article>
            ))}
            {recentRevenue.length === 0 && <p className="admin-empty-state">Chưa có dữ liệu doanh thu.</p>}
          </div>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Hiệu suất dịch vụ</h3>
            <span>{servicePerformance.length} dịch vụ</span>
          </div>
          <div className="admin-trend-list">
            {servicePerformance.map((item) => (
              <article key={item.serviceId}>
                <div>
                  <strong>{item.serviceName}</strong>
                  <span>{formatAdminMoney(item.revenue)}</span>
                </div>
                <div className="admin-trend-value">
                  <strong>{item.orderCount} đơn</strong>
                  <span style={{ width: `${Math.max(8, ((Number(item.orderCount) || 0) / maxOrders) * 100)}%` }} />
                </div>
              </article>
            ))}
            {servicePerformance.length === 0 && <p className="admin-empty-state">Chưa có dữ liệu dịch vụ.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminOverviewView
