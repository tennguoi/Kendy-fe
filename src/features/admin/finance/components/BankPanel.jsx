import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { statusLabel } from '../../../../data/statusLabels'
import BaseSelect from '../../../../components/ui/BaseSelect'

function BankPanel({
  bankStatus,
  bankStatuses,
  bankTransactions,
  selectedBank,
  setBankStatus,
  setSelectedBankId,
}) {
  return (
    <div className="admin-data-table">
      <div className="admin-filters single-filter">
        <BaseSelect
          value={bankStatus}
          onChange={(value) => setBankStatus(value)}
          options={bankStatuses.map((status) => ({
            value: status,
            label: statusLabel[status] || status || 'Tất cả bank status'
          }))}
          placeholder="Tất cả bank status"
        />
      </div>
      <div className="admin-data-row head bank">
        <span>Reference</span>
        <span>Số tiền</span>
        <span>Nội dung</span>
        <span>Trạng thái</span>
        <span>Nhận lúc</span>
      </div>
      {bankTransactions.map((item) => (
        <button className={`admin-data-row bank ${selectedBank?.id === item.id ? 'selected' : ''}`} key={item.id} type="button" onClick={() => setSelectedBankId(item.id)}>
          <span>
            <strong>{item.referenceCode || `#${item.id}`}</strong>
            <small>{item.bankName || item.gateway}</small>
          </span>
          <span>{formatAdminMoney(item.transferAmount)}</span>
          <span>{item.content || item.code || 'Không có nội dung'}</span>
          <span><AdminStatusBadge status={item.status} /></span>
          <span>{formatAdminDate(item.receivedAt || item.transactionDate)}</span>
        </button>
      ))}
      {bankTransactions.length === 0 && <AdminEmptyState />}
    </div>
  )
}

export default BankPanel
