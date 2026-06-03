import { navItems } from '../../data/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './Dashboard.css'

function DashboardShell({ activeView, onViewChange, displayBalance, onLogout, children }) {
  const activeTitle = navItems.find((item) => item.id === activeView)?.label || 'Tổng quan'

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onViewChange={onViewChange} />
      <main className="workspace">
        <Topbar title={activeTitle} displayBalance={displayBalance} onLogout={onLogout} />
        {children}
      </main>
    </div>
  )
}

export default DashboardShell
