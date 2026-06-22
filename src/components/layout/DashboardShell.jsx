import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './layout.css'
import './shared.css'

function DashboardShell({
  activeView,
  brand,
  children,
  currentUser,
  displayBalance,
  items = [],
  notificationCount = 0,
  notifications = [],
  notificationsLoading = false,
  onLogout,
  onMarkNotificationRead,
  onOpenNotifications,
  onViewChange,
  showBalance = true,
  subtitle,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { t } = useTranslation()
  const activeTitle = t(items.find((item) => item.id === activeView)?.label || 'nav.overview')
  const searchTargetView = items.find((item) => item.id === 'services' || item.id === 'admin-services')?.id

  const handleCloseSidebar = () => setIsSidebarOpen(false)
  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={handleCloseSidebar} aria-hidden="true" />
      )}
      <Sidebar
        activeView={activeView}
        brand={brand}
        items={items}
        onViewChange={(view) => {
          onViewChange(view)
          handleCloseSidebar()
        }}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        currentUser={currentUser}
        onLogout={onLogout}
      />
      <main className="workspace">
        <Topbar
          title={activeTitle}
          currentUser={currentUser}
          displayBalance={displayBalance}
          notificationCount={notificationCount}
          notifications={notifications}
          notificationsLoading={notificationsLoading}
          onLogout={onLogout}
          onMarkNotificationRead={onMarkNotificationRead}
          onOpenNotifications={onOpenNotifications}
          searchTargetView={searchTargetView}
          onViewChange={(view) => {
            onViewChange(view)
            handleCloseSidebar()
          }}
          showBalance={showBalance}
          subtitle={subtitle}
          onToggleSidebar={handleToggleSidebar}
        />
        {children}
      </main>
    </div>
  )
}

export default DashboardShell
