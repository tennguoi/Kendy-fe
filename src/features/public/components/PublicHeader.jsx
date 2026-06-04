import { ArrowRight, LogIn } from 'lucide-react'

function PublicHeader({ logo, navItems, onLoginClick }) {
  return (
    <header className="public-site-header">
      <a className="public-brand" href="#top" aria-label="Kendy Digital">
        <img src={logo} alt="" />
        <span>
          <strong>Kendy Digital</strong>
          <small>Digital services platform</small>
        </span>
      </a>

      <nav className="public-nav" aria-label="Điều hướng chính">
        {navItems.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="public-header-actions">
        <button type="button" className="public-btn ghost" onClick={onLoginClick}>
          <LogIn size={17} strokeWidth={2} aria-hidden="true" />
          <span>Đăng nhập</span>
        </button>
        <button type="button" className="public-btn primary" onClick={onLoginClick}>
          <span>Bắt đầu ngay</span>
          <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

export default PublicHeader
