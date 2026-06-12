import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

function JobsTab({
  jobs,
  loadJobLogs,
  onRefreshJobStatus,
  onRunJobAction,
  submitting,
}) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Jobs</h3>
        <div className="admin-action-row">
          <span>{jobs.length} job</span>
          <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={loadJobLogs}>Logs</button>
        </div>
      </div>
      <div className="admin-mini-list">
        {jobs.map((job) => (
          <article key={job.id}>
            <strong>{job.name || `Job #${job.id}`}</strong>
            <span>{job.status} · {formatAdminDate(job.createdAt || job.updatedAt)}</span>
            <div className="admin-action-row">
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onRefreshJobStatus(job.id)}>Status</button>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onRunJobAction(job.id, 'retry')}>Retry</button>
              <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onRunJobAction(job.id, 'cancel')}>Cancel</button>
            </div>
          </article>
        ))}
        {jobs.length === 0 && <AdminEmptyState message="Chưa có job." />}
      </div>
    </div>
  )
}

export default JobsTab
