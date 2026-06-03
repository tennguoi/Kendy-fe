import heroImg from '../../assets/hero.png'
import { navItems } from '../../data/navigation'

function Sidebar({ activeView, onViewChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={heroImg} alt="Kendy Digital" />
        <div>
          <strong>KendyDigital</strong>
          <span>Service wallet</span>
        </div>
      </div>

      <nav className="nav">
        {navItems.map((item) => {
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
        <span>Webhook</span>
        <strong>SePay ready</strong>
      </div>
    </aside>
  )
}

export default Sidebar
