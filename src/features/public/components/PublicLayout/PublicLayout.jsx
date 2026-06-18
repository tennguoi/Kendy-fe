import PublicHeader from '../PublicHeader/PublicHeader'
import PublicFooter from '../PublicFooter/PublicFooter'
import PromoBanner from '../PromoBanner/PromoBanner'
import { navItems } from '../../data/publicSiteContent'
import { footerGroups } from '../../data/policies.public'
import heroImg from '../../../../assets/hero.png'
import { usePublicSiteSettings } from '../../hooks/usePublicSiteSettings'

function PublicLayout({ children, onLoginClick }) {
  const { settings } = usePublicSiteSettings()
  const logo = settings.brand.logoUrl || heroImg

  return (
    <div className="public-home">
      <PublicHeader brand={settings.brand} logo={logo} navItems={navItems} onLoginClick={onLoginClick} />
      <PromoBanner config={settings.banner} />
      <main>{children}</main>
      <PublicFooter brand={settings.brand} footerGroups={footerGroups} logo={logo} />
    </div>
  )
}

export default PublicLayout
