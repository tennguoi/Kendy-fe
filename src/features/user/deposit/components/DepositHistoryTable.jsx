import StatusBadge from '../../../../components/status/StatusBadge'
import { money } from '../../../../utils/currency'
import { formatDepositDate } from '../depositFormat'
import { useState } from 'react'

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'MANUAL_REVIEW', label: 'Cần kiểm tra' },
  { value: 'EXPIRED', label: 'Hết hạn' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

function DepositHistoryTable({
  deposits = [],
  onFiltersChange,
  onRefreshDeposit,
}) {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')

  const clearFilters = () => {
    setFilterStatus('')
    setFilterFromDate('')
    setFilterToDate('')
    onFiltersChange?.({})
  }

  return (
    <section className="table-panel">
      <div className="section-head">
        <h2>Lịch sử nạp tiền</h2>
        <button type="button" onClick={() => onRefreshDeposit?.()}>Tải lại</button>
      </div>
      <div className="deposit-filters">
        <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <input type="date" value={filterFromDate} onChange={(event) => setFilterFromDate(event.target.value)} placeholder="Từ ngày" />
        <input type="date" value={filterToDate} onChange={(event) => setFilterToDate(event.target.value)} placeholder="Đến ngày" />
        <button type="button" onClick={() => onFiltersChange?.({ status: filterStatus, fromDate: filterFromDate, toDate: filterToDate })}>Lọc</button>
        {(filterStatus || filterFromDate || filterToDate) && (
          <button type="button" className="admin-danger-button" onClick={clearFilters}>Xóa lọc</button>
        )}
      </div>
      <div className="data-table">
        <div className="deposit-row table-head">
          <span>Mã nạp</span>
          <span>Số tiền</span>
          <span>Trạng thái</span>
          <span>Hết hạn</span>
          <span>Hoàn tất</span>
        </div>
        {deposits.map((deposit) => (
          <button className="deposit-row" key={deposit.depositCode} type="button" onClick={() => onRefreshDeposit?.(deposit.depositCode)}>
            <strong>{deposit.depositCode}</strong>
            <span>{money.format(deposit.amount)}</span>
            <StatusBadge status={deposit.status} />
            <span>{formatDepositDate(deposit.expiredAt)}</span>
            <span>{formatDepositDate(deposit.completedAt)}</span>
          </button>
        ))}
        {deposits.length === 0 && <p className="admin-empty-state">Chưa có yêu cầu nạp tiền.</p>}
      </div>
    </section>
  )
}

export default DepositHistoryTable
