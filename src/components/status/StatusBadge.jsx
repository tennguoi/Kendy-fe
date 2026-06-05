import { statusLabel } from '../../data/statusLabels'

function StatusBadge({ status }) {
  const raw = String(status ?? '')
  const label = statusLabel[raw] || raw
  if (!raw) return <span className="status unknown">Không xác định</span>
  return <span className={`status ${raw.toLowerCase()}`}>{label}</span>
}

export default StatusBadge
