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
  onLogout,
  onViewChange,
  showBalance = true,
  subtitle,
}) {
  const activeTitle = items.find((item) => item.id === activeView)?.label || 'Tổng quan'

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        footerLabel={footerLabel}
        footerTitle={footerTitle}
        items={items}
        onViewChange={onViewChange}
      />
      <main className="workspace">
        <Topbar
          title={activeTitle}
          currentUser={currentUser}
          displayBalance={displayBalance}
          notificationCount={notificationCount}
          onLogout={onLogout}
          onViewChange={onViewChange}
          showBalance={showBalance}
          subtitle={subtitle}
        />
        {children}
      </main>
    </div>
  )
}

export default DashboardShell
