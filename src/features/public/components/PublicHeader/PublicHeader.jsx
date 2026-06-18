import { ArrowRight, LogIn, Menu, Moon, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../../../../components/Button/Button'
import { useTheme } from '../../../../contexts/ThemeContext'
import './PublicHeader.css'

function PublicHeader({
  brand = { name: 'Kendy Digital', tagline: 'Tài khoản, nâng cấp & quảng cáo' },
  logo,
  navItems,
  onLoginClick,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const closeMenu = () => setIsMenuOpen(false)
  const openAuth = () => {
    closeMenu()
    onLoginClick()
  }

  const handleNavClick = (event, href) => {
    const normalizedPathname = location.pathname === '/' ? '/' : location.pathname

    if (href === '/' || href === '/#') {
      if (normalizedPathname === '/' || normalizedPathname === '') {
        event.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    if (href.includes('#')) {
      const [path, hash] = href.split('#')
      if (normalizedPathname === path || (path === '/' && (normalizedPathname === '/' || normalizedPathname === ''))) {
        event.preventDefault()
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  return (
    <header className="public-site-header">
      <Link className="public-brand" to="/" aria-label={brand.name}>
        <img src={logo} alt={`Logo ${brand.name}`} />
        <span>
          <strong>{brand.name}</strong>
          <small>{brand.tagline}</small>
        </span>
      </Link>

      <nav className="public-nav" aria-label="Điều hướng chính">
        {navItems.map((item) =>
          item.href.startsWith('/') ? (
            <Link to={item.href} key={item.href} onClick={(e) => handleNavClick(e, item.href)}>
              {item.label}
            </Link>
          ) : (
            <a href={item.href} key={item.href} onClick={(e) => handleNavClick(e, item.href)}>
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
        <Button variant="ghost" onClick={openAuth}>
          <LogIn size={17} strokeWidth={2} aria-hidden="true" />
          <span>Đăng nhập</span>
        </Button>
        <Button variant="primary" to="/catalog">
          <span>Xem dịch vụ</span>
          <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
        </Button>
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
              <Link to={item.href} key={item.href} onClick={(e) => { closeMenu(); handleNavClick(e, item.href); }}>
                {item.label}
              </Link>
            ) : (
              <a href={item.href} key={item.href} onClick={(e) => { closeMenu(); handleNavClick(e, item.href); }}>
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
