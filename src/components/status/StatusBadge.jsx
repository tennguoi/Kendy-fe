import { useTranslation } from 'react-i18next'

function StatusBadge({ status }) {
  const { t } = useTranslation()
  const raw = String(status ?? '')
  const label = t(`status.${raw}`, { defaultValue: raw })
  if (!raw) return <span className="status unknown">{t('status.unknown')}</span>
  return <span className={`status ${raw.toLowerCase()}`}>{label}</span>
}

export default StatusBadge
