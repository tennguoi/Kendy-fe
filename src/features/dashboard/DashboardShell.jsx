import { useState } from 'react'
import { navItems } from '../user/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './Dashboard.css'

function DashboardShell({
  activeView,
  children,
  currentUser,
  displayBalance,
  footerLabel,
  footerTitle,
  items = navItems,
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
  const activeTitle = items.find((item) => item.id === activeView)?.label || 'Tổng quan'

  const handleCloseSidebar = () => setIsSidebarOpen(false)
  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  return (
    <div className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={handleCloseSidebar} aria-hidden="true" />
      )}
      <Sidebar
        activeView={activeView}
        footerLabel={footerLabel}
        footerTitle={footerTitle}
        items={items}
        onViewChange={(view) => {
          onViewChange(view)
          handleCloseSidebar()
        }}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
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
