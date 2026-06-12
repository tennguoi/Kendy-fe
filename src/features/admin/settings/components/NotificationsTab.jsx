import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate } from '../../adminFormat'

function NotificationsTab({
  notifications,
  notificationSetting,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onSetNotificationSetting,
  onUpdateNotificationSetting,
  submitting,
}) {
  return (
    <div className="admin-grid two-columns">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Notification settings</h3>
          <button type="button" onClick={onUpdateNotificationSetting} disabled={submitting}>Lưu</button>
        </div>
        <label className="admin-form">
          <span>JSON value</span>
          <textarea value={notificationSetting?.value || '{}'} onChange={(event) => onSetNotificationSetting((current) => ({ ...(current || {}), value: event.target.value }))} rows="10" />
        </label>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Admin notifications</h3>
          <button type="button" onClick={onMarkAllNotificationsRead} disabled={submitting}>Đọc tất cả</button>
        </div>
        <div className="admin-mini-list">
          {notifications.map((notification) => (
            <article key={notification.id}>
              <strong>{notification.title || notification.type || `Notification #${notification.id}`}</strong>
              <span>{notification.message || notification.payload || 'Không có nội dung'} · {formatAdminDate(notification.createdAt)}</span>
              {!notification.readAt && (
                <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={() => onMarkNotificationRead(notification.id)}>
                  Đã đọc
                </button>
              )}
            </article>
          ))}
          {notifications.length === 0 && <AdminEmptyState message="Chưa có notification." />}
        </div>
      </div>
    </div>
  )
}

export default NotificationsTab
