import { Bell, Menu, User } from 'lucide-react'
import SearchField from '../SearchField/SearchField'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { money } from '../../utils/currency'

function Topbar({
  currentUser,
  title,
  displayBalance,
  notificationCount = 0,
  notifications = [],
  notificationsLoading = false,
  onMarkNotificationRead,
  onOpenNotifications,
  onViewChange,
  searchTargetView,
  showBalance = true,
  subtitle,
  onToggleSidebar,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { t, i18n } = useTranslation()

  const formatNotificationTime = (value) => {
    if (!value) return ''
    return new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
    }).format(new Date(value))
  }
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatar || currentUser?.picture || currentUser?.imageUrl || currentUser?.photoUrl
  const userInitial = (currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()

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
          aria-label={t('topbar.openMenu')}
        >
          <Menu size={22} strokeWidth={2} />
        </button>
        <div>
          <p>{subtitle || t('topbar.subtitle')}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <SearchField
        className="search"
        placeholder={t('topbar.searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleSearchKeyDown}
      />
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
            title={t('topbar.notifications')}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="dialog"
            onClick={handleToggleNotifications}
          >
            <Bell size={18} strokeWidth={2} aria-hidden="true" />
            {notificationCount > 0 && <span className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>}
          </button>
          {isNotificationsOpen && (
            <div className="notification-panel" role="dialog" aria-label={t('topbar.notifications')}>
              <div className="notification-panel-head">
                <strong>{t('topbar.notifications')}</strong>
                <span>{notificationCount} {t('topbar.unread')}</span>
              </div>
              <div className="notification-list">
                {notificationsLoading && <p className="notification-empty">{t('topbar.loadingNotifications')}</p>}
                {!notificationsLoading && notifications.map((notification) => (
                  <button
                    type="button"
                    className={notification.readAt ? 'notification-item' : 'notification-item unread'}
                    key={notification.id}
                    onClick={() => onMarkNotificationRead?.(notification)}
                  >
                    <strong>{notification.title || t('topbar.defaultNotification')}</strong>
                    <span>{notification.message || t('topbar.defaultNotificationMessage')}</span>
                    <small>{formatNotificationTime(notification.createdAt)}</small>
                  </button>
                ))}
                {!notificationsLoading && notifications.length === 0 && (
                  <p className="notification-empty">{t('topbar.noNotifications')}</p>
                )}
              </div>
            </div>
          )}
        </div>
        {currentUser && (
          <button
            type="button"
            className="topbar-profile-button"
            onClick={() => onViewChange?.(isAdmin ? 'admin-settings' : 'profile')}
            title={t('topbar.myProfile')}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <span>{userInitial || <User size={16} strokeWidth={2} />}</span>
            )}
            <strong>{currentUser.name || currentUser.email || t('topbar.profile')}</strong>
          </button>
        )}

      </div>
    </header>
  )
}

export default Topbar
