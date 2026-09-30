import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import { statusLabel } from '../../data/statusLabels'

export function AdminStatusBadge({ status, type = 'general' }) {
  const { t } = useTranslation()
  const raw = String(status ?? '').trim()
  const normalized = raw.toLowerCase().replaceAll('_', '-')
  let label = ''

  if (type === 'user') {
    if (raw === 'ACTIVE') label = t('admin.users.status.ACTIVE', { defaultValue: 'Hoạt động' })
    else if (raw === 'LOCKED') label = t('admin.users.status.LOCKED', { defaultValue: 'Đã khóa' })
    else if (raw === 'PENDING_VERIFY') label = t('admin.users.status.PENDING_VERIFY', { defaultValue: 'Chờ xác thực' })
    else if (raw === 'DISABLED') label = t('admin.users.status.DISABLED', { defaultValue: 'Vô hiệu hóa' })
  } else if (type === 'service') {
    if (raw === 'ACTIVE') label = t('admin.services.status.ACTIVE', { defaultValue: 'Đang bán' })
    else if (raw === 'INACTIVE') label = t('admin.services.status.INACTIVE', { defaultValue: 'Ngừng bán' })
    else if (raw === 'MAINTENANCE') label = t('admin.services.status.MAINTENANCE', { defaultValue: 'Bảo trì' })
  }

  if (!label) {
    label = t('statuses.' + raw, { defaultValue: '' })
  }
  if (!label) {
    label = statusLabel[raw] || raw || t('common.unknown', { defaultValue: 'Không xác định' })
  }
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
