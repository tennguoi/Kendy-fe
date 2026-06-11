import { formatAdminMoney } from '../adminFormat'

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
    { label: 'User hoạt động', value: dashboard?.activeUsers ?? 0 },
    { label: 'Đơn đang xử lý', value: dashboard?.processingOrders ?? 0 },
    { label: 'Nạp cần kiểm tra', value: dashboard?.manualReviewDeposits ?? 0 },
    { label: 'Ticket chờ admin', value: dashboard?.pendingAdminTickets ?? 0 },
    { label: 'Ví đang giữ', value: formatAdminMoney(revenue?.walletLiability || dashboard?.totalWalletBalance) },
    { label: 'Doanh thu hôm nay', value: formatAdminMoney(dashboard?.todayRevenue) },
    { label: 'Dịch vụ đang bật', value: activeServices },
    { label: 'Nhóm dịch vụ', value: categories.length },
  ]

  return (
    <section className="admin-view">
      <div className="admin-metrics">
        {metrics.map((metric) => (
          <article className="admin-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
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
            <h3>Revenue chart</h3>
            <span>{revenueChart.length} ngày</span>
          </div>
          <div className="admin-mini-list">
            {revenueChart.slice(-7).map((row) => (
              <article key={row.date}>
                <strong>{row.date}</strong>
                <span>Deposit {formatAdminMoney(row.depositVolume)} · Revenue {formatAdminMoney(row.grossRevenue)} · Refund {formatAdminMoney(row.refunds)}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Service performance</h3>
            <span>{servicePerformance.length} dịch vụ</span>
          </div>
          <div className="admin-mini-list">
            {servicePerformance.map((item) => (
              <article key={item.serviceId}>
                <strong>{item.serviceName}</strong>
                <span>{item.orderCount} đơn · {formatAdminMoney(item.revenue)}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminOverviewView
