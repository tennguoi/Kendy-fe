import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { money } from '../../utils/currency'

function formatNotificationTime(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}

function Topbar({
  currentUser,
  title,
  displayBalance,
  notificationCount = 0,
  notifications = [],
  notificationsLoading = false,
  onLogout,
  onMarkNotificationRead,
  onOpenNotifications,
  onViewChange,
  searchTargetView,
  showBalance = true,
  subtitle = 'Tài khoản & quảng cáo Facebook',
  onToggleSidebar,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter' && searchQuery.trim() && onViewChange && searchTargetView) {
      onViewChange(searchTargetView)
    }
  }

  const handleToggleNotifications = () => {
    const nextOpen = !isNotificationsOpen
    setIsNotificationsOpen(nextOpen)
    if (nextOpen) {
      onOpenNotifications?.()
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Mở menu"
        >
          <Menu size={22} strokeWidth={2} />
        </button>
        <div>
          <p>{subtitle}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <label className="search">
        <Search size={17} strokeWidth={2} aria-hidden="true" />
        <input
          type="search"
          placeholder="Đơn, dịch vụ, giao dịch"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </label>
      <div className="top-actions">
        {showBalance && (
          <button type="button" className="balance-button">
            {money.format(displayBalance)}
          </button>
        )}
        <div className="notification-menu">
          <button
            type="button"
            className="notification-bell"
            title="Thông báo"
            aria-expanded={isNotificationsOpen}
            aria-haspopup="dialog"
            onClick={handleToggleNotifications}
          >
            <Bell size={18} strokeWidth={2} aria-hidden="true" />
            {notificationCount > 0 && <span className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>}
          </button>
          {isNotificationsOpen && (
            <div className="notification-panel" role="dialog" aria-label="Thông báo">
              <div className="notification-panel-head">
                <strong>Thông báo</strong>
                <span>{notificationCount} chưa đọc</span>
              </div>
              <div className="notification-list">
                {notificationsLoading && <p className="notification-empty">Đang tải thông báo...</p>}
                {!notificationsLoading && notifications.map((notification) => (
                  <button
                    type="button"
                    className={notification.readAt ? 'notification-item' : 'notification-item unread'}
                    key={notification.id}
                    onClick={() => onMarkNotificationRead?.(notification)}
                  >
                    <strong>{notification.title || 'Thông báo'}</strong>
                    <span>{notification.message || 'Bạn có thông báo mới.'}</span>
                    <small>{formatNotificationTime(notification.createdAt)}</small>
                  </button>
                ))}
                {!notificationsLoading && notifications.length === 0 && (
                  <p className="notification-empty">Chưa có thông báo.</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

export default Topbar
