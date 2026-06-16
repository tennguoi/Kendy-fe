import PublicHeader from '../PublicHeader/PublicHeader'
import PublicFooter from '../PublicFooter/PublicFooter'
import { navItems } from '../../data/publicSiteContent'
import { footerGroups } from '../../data/policies.public'
import heroImg from '../../../../assets/hero.png'

function PublicLayout({ children, onLoginClick }) {
  return (
    <div className="public-home">
      <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />
      <main>{children}</main>
      <PublicFooter footerGroups={footerGroups} logo={heroImg} />
    </div>
  )
}

export default PublicLayout
