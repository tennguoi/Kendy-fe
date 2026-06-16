import { ArrowRight, LogIn, Menu, Moon, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../../../contexts/ThemeContext'
import './PublicHeader.css'

function PublicHeader({ logo, navItems, onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const closeMenu = () => setIsMenuOpen(false)
  const openAuth = () => {
    closeMenu()
    onLoginClick()
  }

  return (
    <header className="public-site-header">
      <Link className="public-brand" to="/" aria-label="Kendy Digital">
        <img src={logo} alt="" />
        <span>
          <strong>Kendy Digital</strong>
          <small>Tài khoản, nâng cấp & quảng cáo</small>
        </span>
      </Link>

      <nav className="public-nav" aria-label="Điều hướng chính">
        {navItems.map((item) =>
          item.href.startsWith('/') ? (
            <Link to={item.href} key={item.href}>
              {item.label}
            </Link>
          ) : (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          )
        )}
      </nav>

      <div className="public-header-actions">
        <button
          type="button"
          className="public-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
          aria-label={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>
        <button type="button" className="public-btn ghost" onClick={openAuth}>
          <LogIn size={17} strokeWidth={2} aria-hidden="true" />
          <span>Đăng nhập</span>
        </button>
        <Link className="public-btn primary" to="/catalog">
          <span>Xem dịch vụ</span>
          <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
        </Link>
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
          {navItems.map((item) =>
            item.href.startsWith('/') ? (
              <Link to={item.href} key={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            ) : (
              <a href={item.href} key={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            )
          )}
          <button type="button" onClick={openAuth}>
            Đăng nhập / đăng ký
          </button>
        </div>
      )}
    </header>
  )
}

export default PublicHeader
