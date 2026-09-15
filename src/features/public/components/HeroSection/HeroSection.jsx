import { ArrowRight, CheckCircle2, Shield, Zap, Users, TrendingUp, Search, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import './HeroSection.css'

function HeroSection({ logo, notice, onLoginClick, serviceSignals, dynamicContent }) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  const kicker = dynamicContent?.kicker || t('public.hero.kicker', { defaultValue: 'Mua tài khoản, nâng cấp gói và đăng ký dịch vụ Facebook' })
  const title = dynamicContent?.title || t('public.hero.title', { defaultValue: 'Mua tài khoản CapCut, Facebook và dịch vụ quảng cáo nhanh chóng, minh bạch' })
  const description = dynamicContent?.description || t('public.hero.description', { defaultValue: 'Kendy Digital giúp bạn mua tài khoản, nâng cấp gói, nạp tiền tự động, theo dõi đơn hàng và nhận hỗ trợ sau mua trên một hệ thống có ví tiền, mã đơn và ticket rõ ràng.' })
  const primaryCta = dynamicContent?.primaryCta || t('public.hero.primaryCta', { defaultValue: 'Xem dịch vụ' })
  const secondaryCta = dynamicContent?.secondaryCta || t('public.hero.secondaryCta', { defaultValue: 'Liên hệ tư vấn' })

  const defaultTrustItems = [
    t('public.signals.fbAds', { defaultValue: 'Facebook Ads' }),
    t('public.signals.upgradeValue', { defaultValue: 'CapCut Pro' }),
    t('public.policies.service.link3', { defaultValue: 'Nâng cấp tài khoản' }),
    t('public.signals.clearTermsValue', { defaultValue: 'Bảo hành rõ điều kiện' })
  ]
  const trustItems = dynamicContent?.trustItems || t('public.hero.trustItems', { returnObjects: true, defaultValue: defaultTrustItems })

  // Search suggestions based on service categories
  const searchSuggestions = [
    { label: t('public.hero.search.capcut', { defaultValue: 'CapCut Pro 12 tháng' }), category: 'capcut' },
    { label: t('public.hero.search.facebook', { defaultValue: 'Tài khoản Facebook Ads' }), category: 'facebook' },
    { label: t('public.hero.search.upgrade', { defaultValue: 'Nâng cấp Fanpage/BM' }), category: 'upgrade' },
    { label: t('public.hero.search.ads', { defaultValue: 'Chạy quảng cáo Facebook' }), category: 'ads' },
  ]

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to catalog with search query
      window.location.href = `/catalog?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.label)
    setShowSuggestions(false)
    window.location.href = `/catalog?category=${suggestion.category}`
  }

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
    if (searchQuery.trim()) {
      setShowSuggestions(true)
    }
  }

  const handleSearchBlur = () => {
    setIsSearchFocused(false)
    // Delay to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setShowSuggestions(value.trim().length > 0)
  }

  // Close suggestions on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        searchRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <section className="public-hero" id="top" aria-labelledby="hero-title">
      {/* Animated Background */}
      <div className="public-hero__bg" aria-hidden="true">
        <div className="public-hero__gradient orb orb-1" />
        <div className="public-hero__gradient orb orb-2" />
        <div className="public-hero__gradient orb orb-3" />
        <div className="public-hero__grid" />
      </div>

      <div className="public-hero__container container">
        {/* Kicker & Badge */}
        <div className="public-hero__kicker-wrapper">
          <span className="public-hero__kicker">
            <CheckCircle2 size={16} strokeWidth={2.5} aria-hidden="true" />
            {kicker}
          </span>
        </div>

        {/* Main Headline */}
        <h1 id="hero-title" className="public-hero__title text-display">
          {title}
        </h1>

        {/* Description */}
        <p className="public-hero__description text-body-lg">
          {description}
        </p>

        {/* Search Bar - Primary CTA */}
        <form className="public-hero__search" onSubmit={handleSearchSubmit} role="search" aria-label="Tìm kiếm dịch vụ">
          <div className="public-hero__search-wrapper" ref={searchRef}>
            <label htmlFor="hero-search" className="sr-only">{t('public.hero.search.placeholder', { defaultValue: 'Tìm kiếm dịch vụ CapCut, Facebook, quảng cáo...' })}</label>
            <Search className="public-hero__search-icon" size={20} strokeWidth={2} aria-hidden="true" />
            <input
              id="hero-search"
              type="search"
              className="public-hero__search-input"
              placeholder={t('public.hero.search.placeholder', { defaultValue: 'Tìm kiếm dịch vụ CapCut, Facebook, quảng cáo...' })}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="hero-suggestions"
              aria-expanded={showSuggestions}
            />
            <button
              type="submit"
              className="public-hero__search-btn btn btn-primary"
              aria-label={t('public.hero.search.submit', { defaultValue: 'Tìm kiếm' })}
              disabled={!searchQuery.trim()}
            >
              <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <ul id="hero-suggestions" className="public-hero__suggestions" role="listbox">
              {searchSuggestions
                .filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((suggestion, index) => (
                  <li key={index} role="option" onClick={() => handleSuggestionClick(suggestion)} className="public-hero__suggestion-item">
                    <Search size={16} strokeWidth={2} className="public-hero__suggestion-icon" aria-hidden="true" />
                    <span>{suggestion.label}</span>
                  </li>
                ))}
              {searchSuggestions.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <li className="public-hero__suggestion-item public-hero__suggestion-empty">
                  <span>{t('public.hero.search.noResults', { defaultValue: 'Không tìm thấy gợi ý phù hợp' })}</span>
                </li>
              )}
            </ul>
          )}

          <p className="public-hero__search-hint">
            {t('public.hero.search.hint', { defaultValue: 'Nhấn Enter để tìm kiếm hoặc chọn gợi ý' })}
          </p>
        </form>

        {/* Secondary Actions */}
        <div className="public-hero__actions">
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {primaryCta}
            <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-lg"
            onClick={onLoginClick}
          >
            {secondaryCta}
          </button>
        </div>

        {/* Trust Strip */}
        <div className="public-hero__trust" aria-label="Điểm tin cậy">
          {Array.isArray(trustItems) && trustItems.map((item, idx) => (
            <span key={idx} className="public-hero__trust-item">
              {item}
            </span>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="public-hero__stats" aria-label="Thống kê">
          <div className="public-hero__stat">
            <div className="public-hero__stat-value">10,000+</div>
            <div className="public-hero__stat-label">{t('public.hero.stats.orders', { defaultValue: 'Đơn hàng đã xử lý' })}</div>
          </div>
          <div className="public-hero__stat-divider" aria-hidden="true" />
          <div className="public-hero__stat">
            <div className="public-hero__stat-value">99.8%</div>
            <div className="public-hero__stat-label">{t('public.hero.stats.success', { defaultValue: 'Tỷ lệ thành công' })}</div>
          </div>
          <div className="public-hero__stat-divider" aria-hidden="true" />
          <div className="public-hero__stat">
            <div className="public-hero__stat-value">{"<5p"}</div>
            <div className="public-hero__stat-label">{t('public.hero.stats.speed', { defaultValue: 'Thời gian xử lý TB' })}</div>
          </div>
          <div className="public-hero__stat-divider" aria-hidden="true" />
          <div className="public-hero__stat">
            <div className="public-hero__stat-value">24/7</div>
            <div className="public-hero__stat-label">{t('public.hero.stats.support', { defaultValue: 'Hỗ trợ khách hàng' })}</div>
          </div>
        </div>
      </div>

      {/* Visual Demo Card */}
      <div className="public-hero__visual" aria-hidden="true">
        <HeroVisualDemo serviceSignals={serviceSignals} t={t} />
      </div>

      {/* Scroll Indicator */}
      <div className="public-hero__scroll" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

/* Visual Demo Component */
function HeroVisualDemo({ serviceSignals, t }) {
  return (
    <div className="hero-visual">
      <div className="hero-visual__card">
        {/* Top Bar */}
        <div className="hero-visual__topbar">
          <strong>{t('public.hero.mockupTitle', { defaultValue: 'Ví, đơn hàng và dịch vụ' })}</strong>
          <span className="hero-visual__badge badge badge-primary">
            <Zap size={10} strokeWidth={2.5} aria-hidden="true" />
            {t('public.hero.mockupLive', { defaultValue: 'Thời gian thực' })}
          </span>
        </div>

        {/* Wallet Preview */}
        <div className="hero-visual__wallet">
          <div className="hero-visual__wallet-header">
            <span>{t('public.hero.mockupBalance', { defaultValue: 'Số dư ví' })}</span>
            <span className="hero-visual__wallet-status">
              <span className="hero-visual__status-dot" aria-hidden="true" />
              {t('public.hero.mockupActive', { defaultValue: 'Hoạt động' })}
            </span>
          </div>
          <div className="hero-visual__wallet-amount">1.250.000<span className="hero-visual__currency">đ</span></div>
          <div className="hero-visual__wallet-detail">
            <span className="hero-visual__detail-positive">+500.000đ</span>
            <span>{t('public.hero.mockupBalanceDetail', { defaultValue: 'Giao dịch nạp tiền thành công' })}</span>
          </div>
        </div>

        {/* Service Stack */}
        <div className="hero-visual__services" role="list" aria-label="Dịch vụ phổ biến">
          {[
            { label: t('public.policies.service.link1', { defaultValue: 'CapCut Pro' }), icon: '🎬' },
            { label: t('public.policies.service.link2', { defaultValue: 'Tài khoản Facebook' }), icon: '📘' },
            { label: t('public.policies.service.link3', { defaultValue: 'Nâng cấp tài khoản' }), icon: '⬆️' },
            { label: t('public.policies.service.link4', { defaultValue: 'Chạy quảng cáo' }), icon: '📢' },
          ].map((item, idx) => (
            <div key={idx} className="hero-visual__service-item" role="listitem">
              <span className="hero-visual__service-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              <span className="hero-visual__service-status">
                <span className="hero-visual__status-dot hero-visual__status-dot--green" aria-hidden="true" />
                {t('public.hero.mockupAvailable', { defaultValue: 'Còn hàng' })}
              </span>
            </div>
          ))}
        </div>

        {/* Signal Grid */}
        <div className="hero-visual__signals" role="list" aria-label="Chỉ số dịch vụ">
          {serviceSignals.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.label} className="hero-visual__signal" role="listitem">
                <div className="hero-visual__signal-icon">
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="hero-visual__signal-content">
                  <span className="hero-visual__signal-label">
                    {item.labelKey ? t(item.labelKey, { defaultValue: item.label }) : item.label}
                  </span>
                  <strong className="hero-visual__signal-value">
                    {item.valueKey ? t(item.valueKey, { defaultValue: item.value }) : item.value}
                  </strong>
                </div>
              </article>
            )
          })}
        </div>

        {/* Order Preview */}
        <div className="hero-visual__order">
          <div className="hero-visual__order-info">
            <span className="hero-visual__order-label">{t('public.hero.mockupRecentOrder', { defaultValue: 'Đơn gần đây' })}</span>
            <strong className="hero-visual__order-name">{t('public.hero.mockupService', { defaultValue: 'Nâng cấp CapCut Pro 12 tháng' })}</strong>
          </div>
          <div className="hero-visual__order-status">
            <span className="badge badge-secondary">
              <Loader2 size={12} strokeWidth={2.5} className="animate-spin" aria-hidden="true" />
              {t('public.hero.mockupProcessing', { defaultValue: 'Đang xử lý' })}
            </span>
          </div>
        </div>

        {/* Login Link */}
        <button
          type="button"
          className="hero-visual__login btn btn-ghost btn-full"
          onClick={t}
        >
          <Users size={16} strokeWidth={2} aria-hidden="true" />
          {t('public.hero.mockupLoginLink', { defaultValue: 'Đã có tài khoản? Đăng nhập để theo dõi đơn' })}
        </button>
      </div>

      {/* Floating Trust Badges */}
      <div className="hero-visual__floating-badges" aria-hidden="true">
        <div className="hero-visual__float-badge">
          <Shield size={16} strokeWidth={2} aria-hidden="true" />
          <span>{t('public.hero.float.security', { defaultValue: 'Bảo mật SSL 256-bit' })}</span>
        </div>
        <div className="hero-visual__float-badge">
          <TrendingUp size={16} strokeWidth={2} aria-hidden="true" />
          <span>{t('public.hero.float.uptime', { defaultValue: 'Uptime 99.99%' })}</span>
        </div>
        <div className="hero-visual__float-badge">
          <Users size={16} strokeWidth={2} aria-hidden="true" />
          <span>{t('public.hero.float.users', { defaultValue: '50,000+ khách hàng' })}</span>
        </div>
      </div>
    </div>
  )
}

export default HeroSection