import { useTranslation } from 'react-i18next'
import './PublicFooter.css'

function PublicFooter({
  brand = {
    name: 'Kendy Digital',
    tagline: 'Tài khoản, nâng cấp & quảng cáo',
    description: '',
    email: '',
    phone: '',
    address: '',
    copyright: 'Kendy Digital',
    socials: [],
  },
  logo,
  footerGroups,
}) {
  const { t } = useTranslation()

  const contacts = [
    brand.email && { label: brand.email, url: `mailto:${brand.email}` },
    brand.phone && { label: brand.phone, url: `tel:${brand.phone.replace(/\s+/g, '')}` },
    brand.address && { label: brand.address, url: null },
  ].filter(Boolean)
  const socials = (brand.socials || []).filter((item) => item.label && item.url)

  return (
    <footer className="public-footer">
      <div className="footer-brand">
        <img src={logo} alt={`Logo ${brand.name}`} />
        <div>
          <strong>{brand.name}</strong>
          <p>{brand.description}</p>
        </div>
      </div>

      <div className="footer-links">
        {footerGroups.map((group) => (
          <div key={group.title}>
            <strong>{group.titleKey ? t(group.titleKey, { defaultValue: group.title }) : group.title}</strong>
            {group.links.map((link, idx) => {
              const label = typeof link === 'object' && link.labelKey
                ? t(link.labelKey, { defaultValue: link.label })
                : (typeof link === 'object' ? link.label : link)
              return (
                <a href="#top" key={idx}>
                  {label}
                </a>
              )
            })}
          </div>
        ))}
        {(contacts.length > 0 || socials.length > 0) && (
          <div>
            <strong>{t('support.title', { defaultValue: 'Liên hệ' })}</strong>
            {contacts.map((item) =>
              item.url ? (
                <a href={item.url} key={item.label}>{item.label}</a>
              ) : (
                <span key={item.label}>{item.label}</span>
              ),
            )}
            {socials.map((item) => (
              <a href={item.url} key={item.id} rel="noreferrer" target="_blank">
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="footer-bottom">
        <span>{brand.tagline}</span>
        <span>{brand.copyright || brand.name} © {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}

export default PublicFooter
