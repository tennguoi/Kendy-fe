import { LogIn, Menu, Moon, Sun, X, ShoppingCart, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../../contexts/ThemeContext'
import LanguageSwitcher from '../../../../components/LanguageSwitcher/LanguageSwitcher'
import './PublicHeader.css'

function PublicHeader({
  brand = { name: 'Kendy Digital', tagline: 'Tài khoản, nâng cấp & quảng cáo' },
  logo,
  navItems,
  onLoginClick,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
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

  const isHome = location.pathname === '/' || location.pathname === ''

  return (
    <header className={`public-header ${isHome ? 'public-header--home' : ''}`} role="banner">
      <div className="public-header__container container">
        <Link className="public-header__brand" to="/" aria-label={brand.name}>
          <img src={logo} alt={`Logo ${brand.name}`} className="public-header__logo" />
          <span className="public-header__brand-text">
            <strong>{brand.name}</strong>
            <small>{brand.tagline}</small>
          </span>
        </Link>

        <nav className="public-header__nav" aria-label="Điều hướng chính">
          {navItems.map((item) =>
            item.href.startsWith('/') ? (
              <Link
                to={item.href}
                key={item.href}
                className="public-header__nav-link"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label}
              </Link>
            ) : (
              <a
                href={item.href}
                key={item.href}
                className="public-header__nav-link"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label}
              </a>
            )
          )}
        </nav>

        <div className="public-header__actions">
          <LanguageSwitcher />

          <button
            type="button"
            className="public-header__theme-toggle btn btn-ghost btn-sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('auth.switchToLight') : t('auth.switchToDark')}
            aria-label={theme === 'dark' ? t('auth.switchToLight') : t('auth.switchToDark')}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>

          <Button variant="ghost" className="public-header__btn-login" onClick={openAuth}>
            <LogIn size={17} strokeWidth={2} aria-hidden="true" />
            <span>{t('public.header.login')}</span>
          </Button>

          <Button variant="primary" className="public-header__btn-services" to="/catalog">
            <ShoppingCart size={17} strokeWidth={2} aria-hidden="true" />
            <span>{t('public.header.services')}</span>
          </Button>

          <button
            type="button"
            className="public-header__mobile-toggle"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? t('sidebar.closeMenu') : t('topbar.openMenu')}
          >
            {isMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="public-header__mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
          <nav className="public-header__mobile-nav">
            {navItems.map((item) =>
              item.href.startsWith('/') ? (
                <Link
                  to={item.href}
                  key={item.href}
                  className="public-header__mobile-nav-link"
                  onClick={(e) => { closeMenu(); handleNavClick(e, item.href); }}
                >
                  {item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  key={item.href}
                  className="public-header__mobile-nav-link"
                  onClick={(e) => { closeMenu(); handleNavClick(e, item.href); }}
                >
                  {item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label}
                </a>
              )
            )}
            <Button variant="primary" className="public-header__mobile-cta" onClick={openAuth}>
              <User size={18} strokeWidth={2} aria-hidden="true" />
              {t('public.header.loginOrRegister')}
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

function Button({ variant = 'primary', className = '', to, onClick, children, ...props }) {
  const isLink = !!to
  const Component = isLink ? Link : 'button'

  const variantClasses = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    accent: 'btn btn-accent',
    ghost: 'btn btn-ghost',
    outline: 'btn btn-outline',
  }

  return (
    <Component
      className={`${variantClasses[variant]} ${className}`}
      to={to}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  )
}

export default PublicHeader