import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate, formatAdminMoney, includesKeyword } from './adminFormat'

const financeTabs = [
  { id: 'bank', label: 'Bank transactions' },
  { id: 'deposits', label: 'Yêu cầu nạp' },
  { id: 'wallet', label: 'Ví tiền' },
]

function AdminFinanceView({
  bankTransactions,
  dashboard,
  deposits,
  error,
  loading,
  onReload,
  revenue,
  walletTransactions,
}) {
  const [activeTab, setActiveTab] = useState('bank')
  const [query, setQuery] = useState('')

  const financeMetrics = [
    { label: 'Tiền nạp hoàn tất', value: formatAdminMoney(dashboard?.completedDepositAmount) },
    { label: 'Doanh thu hôm nay', value: formatAdminMoney(dashboard?.todayRevenue) },
    { label: 'Ví đang giữ', value: formatAdminMoney(revenue?.walletLiability || dashboard?.totalWalletBalance) },
    { label: 'Bank chưa khớp', value: String(dashboard?.unmatchedBankCount ?? 0) },
  ]

  const visibleBank = useMemo(
    () => bankTransactions.filter((item) => includesKeyword(item, query, ['referenceCode', 'content', 'code', 'status', 'matchedUserId'])),
    [bankTransactions, query],
  )

  const visibleDeposits = useMemo(
    () => deposits.filter((item) => includesKeyword(item, query, ['depositCode', 'transferContent', 'status', 'userId'])),
    [deposits, query],
  )

  const visibleWallet = useMemo(
    () => walletTransactions.filter((item) => includesKeyword(item, query, ['transactionCode', 'description', 'type', 'direction', 'referenceType'])),
    [query, walletTransactions],
  )

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Finance</span>
          <h2>Quản lý tài chính</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={onReload} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && <p className={error ? 'admin-message error' : 'admin-message'}>{error || 'Đang tải tài chính...'}</p>}

      <div className="admin-metrics">
        {financeMetrics.map((metric) => (
          <article className="admin-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Báo cáo doanh thu</h3>
          <span>Lãi tạm tính {formatAdminMoney(revenue?.profit)}</span>
        </div>
        <div className="admin-report-grid">
          <div><span>Deposit volume</span><strong>{formatAdminMoney(revenue?.depositVolume)}</strong></div>
          <div><span>Gross revenue</span><strong>{formatAdminMoney(revenue?.grossRevenue)}</strong></div>
          <div><span>Refund</span><strong>{formatAdminMoney(revenue?.totalRefunds)}</strong></div>
          <div><span>Net revenue</span><strong>{formatAdminMoney(revenue?.netRevenue)}</strong></div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Đối soát và lịch sử ví</h3>
          <div className="admin-tabs">
            {financeTabs.map((tab) => (
              <button type="button" className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-filters single-filter">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm nội dung, mã giao dịch, user id" type="search" />
        </div>

        {activeTab === 'bank' && (
          <div className="admin-data-table">
            <div className="admin-data-row head bank">
              <span>Reference</span>
              <span>Số tiền</span>
              <span>Nội dung</span>
              <span>Trạng thái</span>
              <span>Nhận lúc</span>
            </div>
            {visibleBank.map((item) => (
              <div className="admin-data-row bank" key={item.id}>
                <span>
                  <strong>{item.referenceCode || `#${item.id}`}</strong>
                  <small>{item.bankName || item.gateway}</small>
                </span>
                <span>{formatAdminMoney(item.transferAmount)}</span>
                <span>{item.content || item.code || 'Không có nội dung'}</span>
                <span><AdminStatusBadge status={item.status} /></span>
                <span>{formatAdminDate(item.receivedAt || item.transactionDate)}</span>
              </div>
            ))}
            {visibleBank.length === 0 && <AdminEmptyState />}
          </div>
        )}

        {activeTab === 'deposits' && (
          <div className="admin-data-table">
            <div className="admin-data-row head deposits">
              <span>Mã nạp</span>
              <span>User</span>
              <span>Số tiền</span>
              <span>Trạng thái</span>
              <span>Hết hạn</span>
            </div>
            {visibleDeposits.map((item) => (
              <div className="admin-data-row deposits" key={item.id}>
                <span>
                  <strong>{item.depositCode}</strong>
                  <small>{item.transferContent}</small>
                </span>
                <span>#{item.userId}</span>
                <span>{formatAdminMoney(item.amount)}</span>
                <span><AdminStatusBadge status={item.status} /></span>
                <span>{formatAdminDate(item.expiredAt)}</span>
              </div>
            ))}
            {visibleDeposits.length === 0 && <AdminEmptyState />}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="admin-data-table">
            <div className="admin-data-row head wallet">
              <span>Mã GD</span>
              <span>Loại</span>
              <span>Số tiền</span>
              <span>Số dư sau</span>
              <span>Thời gian</span>
            </div>
            {visibleWallet.map((item) => (
              <div className="admin-data-row wallet" key={item.id}>
                <span>
                  <strong>{item.transactionCode}</strong>
                  <small>{item.description || item.referenceType}</small>
                </span>
                <span>{item.type} · {item.direction}</span>
                <span>{formatAdminMoney(item.amount)}</span>
                <span>{formatAdminMoney(item.balanceAfter)}</span>
                <span>{formatAdminDate(item.createdAt)}</span>
              </div>
            ))}
            {visibleWallet.length === 0 && <AdminEmptyState />}
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminFinanceView
