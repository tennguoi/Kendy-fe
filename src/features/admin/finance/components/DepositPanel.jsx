import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { statusLabel } from '../../../../data/statusLabels'

function DepositPanel({
  depositStatus,
  depositStatuses,
  deposits,
  selectedDeposit,
  setDepositStatus,
  setSelectedDepositCode,
}) {
  return (
    <div className="admin-data-table">
      <div className="admin-filters single-filter">
        <select value={depositStatus} onChange={(event) => setDepositStatus(event.target.value)}>
          {depositStatuses.map((status) => <option value={status} key={status || 'all'}>{statusLabel[status] || status || 'Tất cả deposit status'}</option>)}
        </select>
      </div>
      <div className="admin-data-row head deposits">
        <span>Mã nạp</span>
        <span>User</span>
        <span>Số tiền</span>
        <span>Trạng thái</span>
        <span>Hết hạn</span>
      </div>
      {deposits.map((item) => (
        <button className={`admin-data-row deposits ${selectedDeposit?.id === item.id ? 'selected' : ''}`} key={item.id} type="button" onClick={() => setSelectedDepositCode(item.depositCode)}>
          <span>
            <strong>{item.depositCode}</strong>
            <small>{item.transferContent}</small>
          </span>
          <span>#{item.userId}</span>
          <span>{formatAdminMoney(item.amount)}</span>
          <span><AdminStatusBadge status={item.status} /></span>
          <span>{formatAdminDate(item.expiredAt)}</span>
        </button>
      ))}
      {deposits.length === 0 && <AdminEmptyState />}
    </div>
  )
}

export default DepositPanel
