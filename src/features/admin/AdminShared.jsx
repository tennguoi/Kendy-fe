import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { statusLabel } from '../../data/statusLabels'

export function AdminStatusBadge({ status }) {
  const { t } = useTranslation()
  const raw = String(status ?? '')
  const normalized = raw.toLowerCase().replaceAll('_', '-')
  const label = t('status.' + raw, { defaultValue: statusLabel[raw] || raw || 'UNKNOWN' })
  if (!raw) return <span className="admin-status unknown">{t('common.unknown', { defaultValue: 'Không xác định' })}</span>
  return <span className={`admin-status ${normalized}`}>{label}</span>
}

export function AdminEmptyState({ message, hint }) {
  const { t } = useTranslation()
  const displayMessage = message || t('common.noData', { defaultValue: 'Chưa có dữ liệu phù hợp.' })
  const displayHint = hint || t('admin.defaultEmptyHint', { defaultValue: 'Thử thay đổi bộ lọc hoặc tải lại trang.' })
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon">
        <Inbox size={24} strokeWidth={1.5} />
      </div>
      <span>{displayMessage}</span>
      <small>{displayHint}</small>
    </div>
  )
}
