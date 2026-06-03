import OrderTable from '../../components/orders/OrderTable'
import RecentTransactions from '../../components/wallet/RecentTransactions'

function OverviewView({ metrics, orders }) {
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
          <span className="eyebrow">Finance core</span>
          <h2>Ledger ví và đối soát ngân hàng</h2>
        </div>
        <div className="ops-list">
          <span>deposit_requests</span>
          <span>bank_transactions</span>
          <span>wallet_transactions</span>
          <span>audit_logs</span>
        </div>
      </section>

      <section className="split-layout">
        <RecentTransactions />
        <OrderTable compact orders={orders} />
      </section>
    </>
  )
}

export default OverviewView
