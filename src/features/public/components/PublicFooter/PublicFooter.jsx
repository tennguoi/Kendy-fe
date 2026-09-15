import { MessageSquare, ArrowRight, Mail, Phone, MapPin, Shield, Zap, Headphones } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './PublicFooter.css'

function FacebookIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function YoutubeIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  )
}

function InstagramIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function PublicFooter({ brand = { name: 'Kendy Digital', tagline: 'Tài khoản, nâng cấp & quảng cáo' }, footerGroups = [], logo }) {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const defaultFooterGroups = [
    {
      title: t('public.footer.dichVu', { defaultValue: 'Dịch vụ' }),
      links: [
        { label: t('public.footer.capcut', { defaultValue: 'Tài khoản CapCut' }), href: '/catalog?category=capcut' },
        { label: t('public.footer.facebook', { defaultValue: 'Tài khoản Facebook' }), href: '/catalog?category=facebook' },
        { label: t('public.footer.upgrade', { defaultValue: 'Nâng cấp tài khoản' }), href: '/catalog?category=upgrade' },
        { label: t('public.footer.ads', { defaultValue: 'Chạy quảng cáo' }), href: '/catalog?category=ads' },
      ],
    },
    {
      title: t('public.footer.hoTro', { defaultValue: 'Hỗ trợ' }),
      links: [
        { label: t('public.footer.lienHe', { defaultValue: 'Liên hệ tư vấn' }), href: '/#contact' },
        { label: t('public.footer.faq', { defaultValue: 'Câu hỏi thường gặp' }), href: '/#faq' },
        { label: t('public.footer.chinhSach', { defaultValue: 'Chính sách bảo hành' }), href: '/#policies' },
        { label: t('public.footer.huongDan', { defaultValue: 'Hướng dẫn mua hàng' }), href: '/#workflow' },
      ],
    },
    {
      title: t('public.footer.congTy', { defaultValue: 'Công ty' }),
      links: [
        { label: t('public.footer.gioiThieu', { defaultValue: 'Giới thiệu' }), href: '/#about' },
        { label: t('public.footer.tuyenDung', { defaultValue: 'Tuyển dụng' }), href: '/careers' },
        { label: t('public.footer.press', { defaultValue: 'Báo chí' }), href: '/press' },
        { label: t('public.footer.lienHeCTy', { defaultValue: 'Liên hệ công ty' }), href: '/#contact' },
      ],
    },
    {
      title: t('public.footer.phapLy', { defaultValue: 'Pháp lý' }),
      links: [
        { label: t('public.footer.dieuKhoan', { defaultValue: 'Điều khoản sử dụng' }), href: '/terms' },
        { label: t('public.footer.baoMat', { defaultValue: 'Chính sách bảo mật' }), href: '/privacy' },
        { label: t('public.footer.hoanTien', { defaultValue: 'Chính sách hoàn tiền' }), href: '/refund' },
        { label: t('public.footer.cookie', { defaultValue: 'Chính sách Cookie' }), href: '/cookies' },
      ],
    },
  ]

const socialLinks = [
    { icon: MessageSquare, href: 'https://facebook.com/kendydigital', label: 'Facebook', color: '#1877F2' },
    { icon: MessageSquare, href: 'https://youtube.com/@kendydigital', label: 'YouTube', color: '#FF0000' },
    { icon: MessageSquare, href: 'https://instagram.com/kendydigital', label: 'Instagram', color: '#E4405F' },
    { icon: MessageSquare, href: 'https://zalo.me/kendydigital', label: 'Zalo', color: '#0068FF' },
  ]

  const contactInfo = {
    address: t('public.footer.address', { defaultValue: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh' }),
    phone: t('public.footer.phone', { defaultValue: '0909 123 456' }),
    email: t('public.footer.email', { defaultValue: 'support@kendydigital.vn' }),
  }

  return (
    <footer className="public-footer" role="contentinfo">
      <div className="container">
        {/* Main Footer Grid */}
        <div className="public-footer__main">
          {/* Brand Column */}
          <div className="public-footer__brand">
            <Link to="/" className="public-footer__logo" aria-label={brand.name}>
              <img src={logo} alt={`Logo ${brand.name}`} />
              <span>
                <strong>{brand.name}</strong>
                <small>{brand.tagline}</small>
              </span>
            </Link>
            <p className="public-footer__description">
              {t('public.footer.description', { defaultValue: 'Kendy Digital - Nền tảng mua bán tài khoản, nâng cấp gói và dịch vụ quảng cáo Facebook uy tín, minh bạch, hỗ trợ 24/7.' })}
            </p>
            <div className="public-footer__social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="public-footer__social-link"
                  aria-label={social.label}
                  style={{ '--social-color': social.color }}
                >
                  <social.icon size={20} strokeWidth={2.5} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <nav className="public-footer__nav" aria-label="Liên kết chân trang">
            {(footerGroups.length > 0 ? footerGroups : defaultFooterGroups).map((group, index) => (
              <div key={index} className="public-footer__column">
                <h4 className="public-footer__column-title">{group.title}</h4>
                <ul className="public-footer__links">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to={link.href} className="public-footer__link">
                        {link.label}
                        <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Contact Column */}
          <div className="public-footer__contact">
            <h4 className="public-footer__column-title">{t('public.footer.lienHe', { defaultValue: 'Liên hệ' })}</h4>
            <address className="public-footer__address">
              <div className="public-footer__contact-item">
                <MapPin size={18} strokeWidth={2} aria-hidden="true" />
                <span>{contactInfo.address}</span>
              </div>
              <div className="public-footer__contact-item">
                <Phone size={18} strokeWidth={2} aria-hidden="true" />
                <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}>{contactInfo.phone}</a>
              </div>
              <div className="public-footer__contact-item">
                <Mail size={18} strokeWidth={2} aria-hidden="true" />
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="public-footer__bottom">
          <div className="public-footer__copyright">
            <p>&copy; {currentYear} {brand.name}. {t('public.footer.allRights', { defaultValue: 'All rights reserved.' })}</p>
          </div>
          <div className="public-footer__badges">
            <span className="public-footer__badge">
              <Shield size={14} strokeWidth={2} aria-hidden="true" />
              {t('public.footer.secure', { defaultValue: 'Thanh toán an toàn' })}
            </span>
            <span className="public-footer__badge">
              <Zap size={14} strokeWidth={2} aria-hidden="true" />
              {t('public.footer.fast', { defaultValue: 'Kích hoạt nhanh' })}
            </span>
            <span className="public-footer__badge">
              <Headphones size={14} strokeWidth={2} aria-hidden="true" />
              {t('public.footer.support247', { defaultValue: 'Hỗ trợ 24/7' })}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter