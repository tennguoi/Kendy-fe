import { Inbox } from 'lucide-react'

export function AdminStatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase().replaceAll('_', '-')
  return <span className={`admin-status ${normalized}`}>{status || 'UNKNOWN'}</span>
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
