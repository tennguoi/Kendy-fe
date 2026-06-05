export function AdminStatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase().replaceAll('_', '-')
  return <span className={`admin-status ${normalized}`}>{status || 'UNKNOWN'}</span>
}

export function AdminEmptyState({ message = 'Chưa có dữ liệu phù hợp.' }) {
  return <p className="admin-empty-state">{message}</p>
}

