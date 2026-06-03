import { statusLabel } from '../../data/statusLabels'

function StatusBadge({ status }) {
  return <span className={`status ${status.toLowerCase()}`}>{statusLabel[status] || status}</span>
}

export default StatusBadge
