import { useState, useRef, useEffect } from 'react'
import { X, LogOut, User, MoreVertical, Settings } from 'lucide-react'
import heroImg from '../../assets/hero.png'

function Sidebar({
  activeView,
  items = [],
  onViewChange,
  isOpen,
  onClose,
  currentUser,
  onLogout,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    if (!isDropdownOpen) return
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleProfileClick = () => {
    setIsDropdownOpen(false)
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
    onViewChange(isAdmin ? 'admin-profile' : 'profile')
  }

  const handleSettingsClick = () => {
    setIsDropdownOpen(false)
    onViewChange('admin-settings')
  }

  const userInitial = (currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()
  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatar || currentUser?.picture || currentUser?.imageUrl || currentUser?.photoUrl

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="brand">
        <img src={heroImg} alt="Kendy Digital" />
        <div>
          <strong>Kendy Digital</strong>
          <span>Ví mua dịch vụ</span>
        </div>
        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Đóng menu"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <nav className="nav">
        {items.filter((item) => !item.hidden).map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              className={activeView === item.id ? 'active' : ''}
              onClick={() => onViewChange(item.id)}
            >
              <span aria-hidden="true">
                <Icon size={18} strokeWidth={2} />
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>



      {currentUser && (
        <div className="sidebar-account-container" ref={dropdownRef}>
          {isDropdownOpen && (
            <div className="sidebar-account-dropdown">
              <div className="dropdown-user-info">
                <strong>{currentUser.name || 'Người dùng'}</strong>
                <span>{currentUser.email}</span>
              </div>
              <div className="dropdown-divider" />
              <button type="button" className="dropdown-item" onClick={handleProfileClick}>
                <User size={16} strokeWidth={2} />
                <span>Hồ sơ cá nhân</span>
              </button>
              {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                <button type="button" className="dropdown-item" onClick={handleSettingsClick}>
                  <Settings size={16} strokeWidth={2} />
                  <span>Cài đặt hệ thống</span>
                </button>
              )}
              <button type="button" className="dropdown-item logout" onClick={() => { setIsDropdownOpen(false); onLogout?.(); }}>
                <LogOut size={16} strokeWidth={2} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
          <button 
            type="button" 
            className={`sidebar-account-chip ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {avatarUrl ? (
              <img className="avatar-circle avatar-image" src={avatarUrl} alt="" />
            ) : (
              <div className="avatar-circle">
                {userInitial}
              </div>
            )}
            <div className="account-details">
              <strong>{currentUser.name || 'Người dùng'}</strong>
              <span>{currentUser.email}</span>
            </div>
            <MoreVertical size={16} className="more-icon" />
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
