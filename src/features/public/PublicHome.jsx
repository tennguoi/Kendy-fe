import heroImg from '../../assets/hero.png'
import AutoDepositSection from './components/AutoDepositSection'
import FaqSection from './components/FaqSection'
import FeaturedServices from './components/FeaturedServices'
import FinalCta from './components/FinalCta'
import HeroSection from './components/HeroSection'
import PublicFooter from './components/PublicFooter'
import PublicHeader from './components/PublicHeader'
import ServiceCategories from './components/ServiceCategories'
import TrustStats from './components/TrustStats'
import WhyChooseSection from './components/WhyChooseSection'
import WorkflowSection from './components/WorkflowSection'
import {
  depositFlow,
  faqItems,
  featuredServices,
  footerGroups,
  navItems,
  platformSignals,
  policyHighlights,
  serviceCategories,
  trustStats,
  whyChooseUs,
  workflowSteps,
} from './data/publicSiteContent'
import './PublicHome.css'

function PublicHome({ notice, onLoginClick }) {
  return (
    <div className="public-home">
      <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />

      <main>
        <HeroSection
          logo={heroImg}
          notice={notice}
          onLoginClick={onLoginClick}
          platformSignals={platformSignals}
        />
        <TrustStats stats={trustStats} />
        <ServiceCategories categories={serviceCategories} />
        <FeaturedServices services={featuredServices} onPurchaseClick={onLoginClick} />
        <WorkflowSection steps={workflowSteps} />
        <AutoDepositSection flow={depositFlow} />
        <WhyChooseSection items={whyChooseUs} policies={policyHighlights} />
        <FaqSection items={faqItems} />
        <FinalCta onLoginClick={onLoginClick} />
      </main>

      <PublicFooter footerGroups={footerGroups} logo={heroImg} />
    </div>
  )
}

export default PublicHome
