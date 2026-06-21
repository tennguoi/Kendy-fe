import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import StatusBadge from '../../../../components/status/StatusBadge'
import { money } from '../../../../utils/currency'
import { formatDepositDate } from '../depositFormat'
import Pagination from '../../../../components/Pagination/Pagination'

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
  const { t } = useTranslation()
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getStatusLabel = (val, defaultLabel) => {
    if (!val) return t('deposit.statusAll', { defaultValue: defaultLabel })
    const keyMap = {
      'PENDING': 'deposit.statusPending',
      'COMPLETED': 'deposit.statusCompleted',
      'MANUAL_REVIEW': 'deposit.statusManualReview',
      'EXPIRED': 'deposit.statusExpired',
      'CANCELLED': 'deposit.statusCancelled'
    }
    return t(keyMap[val], { defaultValue: defaultLabel })
  }

  const clearFilters = () => {
    setFilterStatus('')
    setFilterFromDate('')
    setFilterToDate('')
    onFiltersChange?.({})
  }

  const totalPages = Math.max(1, Math.ceil(deposits.length / itemsPerPage))
  const paginatedDeposits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return deposits.slice(start, start + itemsPerPage)
  }, [deposits, currentPage])

  useEffect(() => { setCurrentPage(1) }, [deposits.length])

  return (
    <section className="table-panel">
      <div className="section-head">
        <h2>{t('deposit.historyTitle', { defaultValue: 'Lịch sử nạp tiền' })}</h2>
        <button type="button" onClick={() => onRefreshDeposit?.()}>{t('deposit.reload', { defaultValue: 'Tải lại' })}</button>
      </div>
      <div className="deposit-filters">
        <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {getStatusLabel(option.value, option.label)}
            </option>
          ))}
        </select>
        <input type="date" value={filterFromDate} onChange={(event) => setFilterFromDate(event.target.value)} placeholder={t('deposit.fromDate', { defaultValue: 'Từ ngày' })} aria-label={t('deposit.fromDate', { defaultValue: 'Từ ngày' })} />
        <input type="date" value={filterToDate} onChange={(event) => setFilterToDate(event.target.value)} placeholder={t('deposit.toDate', { defaultValue: 'Đến ngày' })} aria-label={t('deposit.toDate', { defaultValue: 'Đến ngày' })} />
        <button type="button" className="primary-button" onClick={() => onFiltersChange?.({ status: filterStatus, ...(filterFromDate ? { fromDate: filterFromDate } : {}), ...(filterToDate ? { toDate: filterToDate } : {}) })}>{t('common.filter', { defaultValue: 'Lọc' })}</button>
        {(filterStatus || filterFromDate || filterToDate) && (
          <button type="button" className="admin-danger-button" onClick={clearFilters}>{t('common.clearFilter', { defaultValue: 'Xóa lọc' })}</button>
        )}
      </div>
      <div className="data-table">
        <div className="deposit-row table-head">
          <span>{t('deposit.depositCode', { defaultValue: 'Mã nạp' })}</span>
          <span>{t('common.amount', { defaultValue: 'Số tiền' })}</span>
          <span>{t('common.status', { defaultValue: 'Trạng thái' })}</span>
          <span>{t('deposit.expired', { defaultValue: 'Hết hạn' })}</span>
          <span>{t('deposit.completed', { defaultValue: 'Hoàn tất' })}</span>
        </div>
        {paginatedDeposits.map((deposit) => (
          <button className="deposit-row" key={deposit.depositCode} type="button" onClick={() => onRefreshDeposit?.(deposit.depositCode)}>
            <strong>{deposit.depositCode}</strong>
            <span>{money.format(deposit.amount)}</span>
            <StatusBadge status={deposit.status} />
            <span>{formatDepositDate(deposit.expiredAt)}</span>
            <span>{formatDepositDate(deposit.completedAt)}</span>
          </button>
        ))}
        {deposits.length === 0 && <p className="admin-empty-state">{t('deposit.noDeposits', { defaultValue: 'Chưa có yêu cầu nạp tiền.' })}</p>}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  )
}

export default DepositHistoryTable
