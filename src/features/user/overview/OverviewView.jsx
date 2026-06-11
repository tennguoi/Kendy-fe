import OrderTable from '../../../components/orders/OrderTable'
import RecentTransactions from '../../../components/wallet/RecentTransactions'
import MetricGrid from './components/MetricGrid'
import OperationsBand from './components/OperationsBand'
import QuickServicesPanel from './components/QuickServicesPanel'

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
      <MetricGrid metrics={metrics} />
      <OperationsBand onViewChange={onViewChange} />
      <QuickServicesPanel onOpenServices={onOpenServices} onPurchase={onPurchase} services={quickServices} />

      <section className="split-layout">
        <RecentTransactions onViewChange={onViewChange} transactions={transactions} />
        <OrderTable compact orders={orders} />
      </section>
    </>
  )
}

export default OverviewView
