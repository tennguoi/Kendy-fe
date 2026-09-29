import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../../utils/date'
import { safeArray } from '../overview.utils'
import EmptyState from './EmptyState'

function ActivityFeed({ logs = [] }) {
  const { t } = useTranslation()
  const rows = safeArray(logs).slice(0, 10)
  if (!rows.length) return <EmptyState text={t('admin.overview.activityFeed.empty')} />
  return (
    <div className="ov-feed">
      {rows.map((log, index) => (
        <article key={log.id || log.auditId || index}>
          <span className="ov-feed-dot" />
          <div>
            <strong>
              {log.action || log.event || log.description || t('admin.overview.activityFeed.defaultAction')}
            </strong>
            <small>
              {log.actorName || log.adminEmail || log.username || log.entityType || 'System'}
              {log.ipAddress ? ` (${log.ipAddress})` : ''} · {formatDate(log.createdAt || log.timestamp)}
            </small>
          </div>
        </article>
      ))}
    </div>
  )
}

export default ActivityFeed
