import { AdminStatusBadge } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

function HealthTab({ health }) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Health</h3>
        <AdminStatusBadge status={health?.status || 'UNKNOWN'} />
      </div>
      <dl className="admin-detail-list">
        <div><dt>Service</dt><dd>{health?.service || 'Unknown'}</dd></div>
        <div><dt>Time</dt><dd>{formatAdminDate(health?.timestamp)}</dd></div>
      </dl>
    </div>
  )
}

export default HealthTab
