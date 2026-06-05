import OrderTable from '../../../components/orders/OrderTable'
import StatusBadge from '../../../components/status/StatusBadge'
import RecentTransactions from '../../../components/wallet/RecentTransactions'
import { money } from '../../../utils/currency'

function pickServices(services = [], favoriteServices = [], recentServices = []) {
  const byId = new Map()
  favoriteServices.forEach((service) => byId.set(service.id, service))
  recentServices.forEach((service) => byId.set(service.id, service))
  services.filter((service) => service.featured).forEach((service) => byId.set(service.id, service))

  if (byId.size === 0) {
    services.slice(0, 3).forEach((service) => byId.set(service.id, service))
  }

  return Array.from(byId.values()).slice(0, 3)
}

function OverviewView({
  favoriteServices,
  metrics,
  onOpenServices,
  onPurchase,
  onViewChange,
  orders,
  recentServices,
  services,
  transactions,
}) {
  const quickServices = pickServices(services, favoriteServices, recentServices)

  return (
    <>
      <section className="metric-grid">
        {metrics.map((metric) => (
          <article className={`metric ${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="operations-band">
        <div>
          <span className="eyebrow">Tài khoản của bạn</span>
          <h2>Theo dõi số dư, đơn hàng và hỗ trợ</h2>
        </div>
        <div className="ops-list">
          <span>Ví tiền</span>
          <span>Đơn hàng</span>
          <span>Nạp tiền</span>
          <span>Ticket</span>
        </div>
      </section>

      <section className="quick-services-panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Dịch vụ nên dùng</span>
            <h2>Mua nhanh từ dịch vụ yêu thích và gần đây</h2>
          </div>
          <button type="button" onClick={onOpenServices}>Mở catalog</button>
        </div>
        <div className="quick-service-list">
          {quickServices.map((service) => (
            <article className="quick-service-card" key={service.id}>
              <div>
                <span>{service.categoryName || service.type || 'Dịch vụ'}</span>
                <h3>{service.name}</h3>
              </div>
              <p>{service.shortDescription || service.description || 'Dịch vụ đang sẵn sàng xử lý theo quy trình Kendy Digital.'}</p>
              <div className="quick-service-meta">
                <strong>{service.priceText || money.format(service.price)}</strong>
                <StatusBadge status={service.stockStatus || service.status} />
              </div>
              <button
                type="button"
                disabled={service.status !== 'ACTIVE' || service.stockStatus === 'OUT_OF_STOCK'}
                onClick={() => onPurchase(service)}
              >
                Mua ngay
              </button>
            </article>
          ))}
          {quickServices.length === 0 && <p className="admin-empty-state">Chưa có dịch vụ để gợi ý.</p>}
        </div>
      </section>

      <section className="split-layout">
        <RecentTransactions onViewChange={onViewChange} transactions={transactions} />
        <OrderTable compact orders={orders} />
      </section>
    </>
  )
}

export default OverviewView
