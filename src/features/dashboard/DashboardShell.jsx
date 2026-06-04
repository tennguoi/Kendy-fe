import { navItems } from '../../data/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './Dashboard.css'

function DashboardShell({
  activeView,
  children,
  displayBalance,
  footerLabel,
  footerTitle,
  items = navItems,
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
          displayBalance={displayBalance}
          onLogout={onLogout}
          showBalance={showBalance}
          subtitle={subtitle}
        />
        {children}
      </main>
    </div>
  )
}

export default DashboardShell
