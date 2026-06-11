import { X } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import { navItems } from '../user/navigation'

function Sidebar({
  activeView,
  footerLabel = 'Hỗ trợ',
  footerTitle = 'Ticket sau mua',
  items = navItems,
  onViewChange,
  isOpen,
  onClose,
}) {
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
        {items.map((item) => {
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

      <div className="sidebar-footer">
        <span>{footerLabel}</span>
        <strong>{footerTitle}</strong>
      </div>
    </aside>
  )
}

export default Sidebar
