import heroImg from '../../assets/hero.png'
import AutoDepositSection from './components/AutoDepositSection'
import ConsultSection from './components/ConsultSection'
import FeaturedServices from './components/FeaturedServices'
import FaqSection from './components/FaqSection'
import FinalCta from './components/FinalCta'
import HeroSection from './components/HeroSection'
import PublicFooter from './components/PublicFooter'
import PublicHeader from './components/PublicHeader'
import ServiceCategories from './components/ServiceCategories'
import ServiceTableSection from './components/ServiceTableSection'
import TestimonialsSection from './components/TestimonialsSection'
import TrustStrip from './components/TrustStrip'
import WhyChooseSection from './components/WhyChooseSection'
import WorkflowSection from './components/WorkflowSection'
import { faqGroups } from './data/faqs.public'
import { footerGroups, policyHighlights } from './data/policies.public'
import {
  depositFlow,
  navItems,
  proofItems,
  serviceSignals,
  trustStats,
  whyChooseUs,
  workflowSteps,
} from './data/publicSiteContent'
import {
  featuredServices,
  serviceCategories,
  serviceFilters,
  serviceTableRows,
} from './data/services.public'
import './PublicHome.css'

function PublicHome({ notice, onLoginClick }) {
  const handleConsultSubmit = (event) => {
    event.preventDefault()
    onLoginClick()
  }

  return (
    <div className="public-home">
      <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />

      <main>
        <HeroSection
          logo={heroImg}
          notice={notice}
          onLoginClick={onLoginClick}
          serviceSignals={serviceSignals}
        />
        <TrustStrip items={trustStats} />
        <ServiceCategories categories={serviceCategories} />
        <FeaturedServices services={featuredServices} onPurchaseClick={onLoginClick} />
        <ServiceTableSection
          filters={serviceFilters}
          rows={serviceTableRows}
          onActionClick={onLoginClick}
        />
        <WorkflowSection steps={workflowSteps} />
        <AutoDepositSection flow={depositFlow} />
        <WhyChooseSection items={whyChooseUs} policies={policyHighlights} />
        <TestimonialsSection items={proofItems} />
        <FaqSection groups={faqGroups} />
        <ConsultSection onSubmit={handleConsultSubmit} />
        <FinalCta onLoginClick={onLoginClick} />
      </main>

      <PublicFooter footerGroups={footerGroups} logo={heroImg} />
    </div>
  )
}

export default PublicHome
