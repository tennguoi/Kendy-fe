import { Inbox } from 'lucide-react'
import { statusLabel } from '../../data/statusLabels'

export function AdminStatusBadge({ status }) {
  const raw = String(status ?? '')
  const normalized = raw.toLowerCase().replaceAll('_', '-')
  const label = statusLabel[raw] || raw || 'UNKNOWN'
  if (!raw) return <span className="admin-status unknown">Không xác định</span>
  return <span className={`admin-status ${normalized}`}>{label}</span>
}

export function AdminEmptyState({ message = 'Chưa có dữ liệu phù hợp.', hint = 'Thử thay đổi bộ lọc hoặc tải lại trang.' }) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon">
        <Inbox size={24} strokeWidth={1.5} />
      </div>
      <span>{message}</span>
      <small>{hint}</small>
    </div>
  )
}
