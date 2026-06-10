import { ArrowRight, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'
import './PublicHeader.css'

function PublicHeader({ logo, navItems, onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)
  const openAuth = () => {
    closeMenu()
    onLoginClick()
  }

  return (
    <header className="public-site-header">
      <a className="public-brand" href="#top" aria-label="Kendy Digital">
        <img src={logo} alt="" />
        <span>
          <strong>Kendy Digital</strong>
          <small>Tài khoản, nâng cấp & quảng cáo</small>
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
        <button type="button" className="public-btn ghost" onClick={openAuth}>
          <LogIn size={17} strokeWidth={2} aria-hidden="true" />
          <span>Đăng nhập</span>
        </button>
        <a className="public-btn primary" href="#services">
          <span>Xem dịch vụ</span>
          <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
        </a>
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
        >
          {isMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="mobile-nav-drawer">
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <button type="button" onClick={openAuth}>
            Đăng nhập / đăng ký
          </button>
        </div>
      )}
    </header>
  )
}

export default PublicHeader
