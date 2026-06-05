import { Bell, LogOut, Search } from 'lucide-react'
import { useState } from 'react'
import { money } from '../../utils/currency'

function Topbar({
  currentUser,
  title,
  displayBalance,
  notificationCount = 0,
  onLogout,
  onViewChange,
  showBalance = true,
  subtitle = 'Tài khoản & quảng cáo Facebook',
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter' && searchQuery.trim() && onViewChange) {
      onViewChange('services')
    }
  }

  return (
    <header className="topbar">
      <div>
        <p>{subtitle}</p>
        <h1>{title}</h1>
      </div>
      <div className="top-actions">
        {currentUser && (
          <div className="account-chip">
            <strong>{currentUser.name || 'Chưa đặt tên'}</strong>
            <span>{currentUser.email}</span>
          </div>
        )}
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
        {showBalance && (
          <button type="button" className="balance-button">
            {money.format(displayBalance)}
          </button>
        )}
        <button type="button" className="notification-bell" title="Thông báo">
          <Bell size={18} strokeWidth={2} aria-hidden="true" />
          {notificationCount > 0 && <span className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>}
        </button>
        <button type="button" className="logout-button" onClick={onLogout} title="Đăng xuất">
          <LogOut size={18} strokeWidth={2} aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}

export default Topbar
