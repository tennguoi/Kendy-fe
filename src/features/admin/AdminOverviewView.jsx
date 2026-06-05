import { formatAdminMoney } from './adminFormat'

function AdminOverviewView({ categories, dashboard, pricingItems, revenue, services }) {
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
          <p>
            Ưu tiên xử lý giao dịch chưa khớp, nạp tiền cần kiểm tra, đơn đang xử lý quá hạn và ticket chờ admin.
            Các màn hình User, Đơn hàng, Tài chính và Ticket dùng dữ liệu API admin hiện có.
          </p>
        </div>

        <div className="admin-empty-panel">
          <span className="eyebrow">Catalog</span>
          <h2>Dịch vụ public site</h2>
          <p>
            Hiện có {featuredServices} gói nổi bật và {consultingOnly} gói cần tư vấn. Dịch vụ và bảng giá vẫn là nguồn
            dữ liệu chính cho public site, dashboard user và quy trình mua hàng.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AdminOverviewView
