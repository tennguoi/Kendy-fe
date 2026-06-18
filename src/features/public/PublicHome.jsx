import { useEffect, useMemo, useState } from 'react'
import { Clapperboard, Megaphone, PackageCheck, ShieldCheck, Users } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import { publicApi } from '../../api/public.api'
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal'
import AutoDepositSection from './components/AutoDepositSection/AutoDepositSection'
import ConsultSection from './components/ConsultSection/ConsultSection'
import FaqSection from './components/FaqSection/FaqSection'
import FinalCta from './components/FinalCta/FinalCta'
import HeroSection from './components/HeroSection/HeroSection'
import PromoBanner from './components/PromoBanner/PromoBanner'
import PublicFooter from './components/PublicFooter/PublicFooter'
import PublicHeader from './components/PublicHeader/PublicHeader'
import ServiceCatalog from './components/ServiceCatalog/ServiceCatalog'
import TestimonialsSection from './components/TestimonialsSection/TestimonialsSection'
import TrustStrip from './components/TrustStrip/TrustStrip'
import WhyChooseSection from './components/WhyChooseSection/WhyChooseSection'
import WorkflowSection from './components/WorkflowSection/WorkflowSection'
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
  featuredServices as staticFeaturedServices,
  serviceCategories as staticCategories,
} from './data/services.public'
import { usePublicSiteSettings } from './hooks/usePublicSiteSettings'
import './components/ServiceCatalog/ServiceCatalog.css'
import './PublicHome.css'

const categoryIcons = {
  capcut: Clapperboard,
  facebook: Users,
  upgrade: PackageCheck,
  ads: Megaphone,
  advertising: Megaphone,
  default: ShieldCheck,
}

function pickCategorySlug(categoryName) {
  const name = (categoryName || '').toLowerCase()
  if (name.includes('capcut')) return 'capcut'
  if (name.includes('facebook')) return 'facebook'
  if (name.includes('nâng cấp') || name.includes('upgrade')) return 'upgrade'
  if (name.includes('quảng cáo') || name.includes('ads') || name.includes('advertising')) return 'ads'
  return 'default'
}

function buildServiceCategories(apiCategories) {
  return (Array.isArray(apiCategories) ? apiCategories : []).map((category) => {
    const slug = pickCategorySlug(category.name)
    return {
      id: slug,
      title: category.name,
      description: category.description || '',
      microcopy: category.microcopy || '',
      icon: categoryIcons[slug] || ShieldCheck,
      priceFrom: category.priceFrom || 'Theo gói',
      processingTime: category.processingTime || 'Theo dịch vụ',
      warranty: category.warranty || 'Theo điều kiện',
      requirements: category.requirements
        ? category.requirements.split('\n').map((item) => item.trim()).filter(Boolean)
        : [],
      cta: category.cta || 'Xem chi tiết',
    }
  })
}

function mapApiServiceToFeaturedRow(service) {
  return {
    name: service.name,
    description: service.shortDescription || service.description || '',
    category: service.categoryName || service.type || 'Dịch vụ',
    price: service.priceText || `Từ ${Number(service.price).toLocaleString('vi-VN')}đ`,
    processingTime: service.processingTime || 'Theo quy trình',
    warranty: service.warrantyPolicy || 'Theo điều kiện',
    badge: service.featured ? 'Nổi bật' : 'Mới',
    status: service.stockStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Còn hàng',
    mode: 'Mua ngay',
    cta: 'Mua ngay',
    conditions: ['Đăng nhập để mua', 'Hỗ trợ sau mua'],
  }
}

function PublicHome({ notice, onLoginClick }) {
  const [apiServices, setApiServices] = useState([])
  const [apiCategories, setApiCategories] = useState([])
  const { settings } = usePublicSiteSettings()
  const logo = settings.brand.logoUrl || heroImg

  useEffect(() => {
    Promise.allSettled([
      publicApi.getServices({ limit: 4, sort: 'popular' }),
      publicApi.getCategories(),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') {
        setApiServices(Array.isArray(results[0].value) ? results[0].value : [])
      }
      if (results[1].status === 'fulfilled') {
        setApiCategories(Array.isArray(results[1].value) ? results[1].value : [])
      }
    })
  }, [])

  const mergedCategories = useMemo(() => {
    const categories = buildServiceCategories(apiCategories)
    return categories.length > 0 ? categories : staticCategories
  }, [apiCategories])

  const mergedFeaturedServices = useMemo(
    () => apiServices.length > 0
      ? apiServices.slice(0, 4).map(mapApiServiceToFeaturedRow)
      : staticFeaturedServices,
    [apiServices],
  )

  const handleConsultSubmit = (event) => {
    event.preventDefault()
    onLoginClick()
  }

  return (
    <div className="public-home">
      <PublicHeader
        brand={settings.brand}
        logo={logo}
        navItems={navItems}
        onLoginClick={onLoginClick}
      />
      <PromoBanner config={settings.banner} />

      <main>
        <ScrollReveal delay={100}>
          <HeroSection
            logo={logo}
            notice={notice}
            onLoginClick={onLoginClick}
            serviceSignals={serviceSignals}
          />
        </ScrollReveal>
        <ScrollReveal delay={200}><TrustStrip items={trustStats} /></ScrollReveal>
        <ScrollReveal delay={100}>
          <ServiceCatalog
            categories={mergedCategories}
            services={mergedFeaturedServices}
            onPurchaseClick={onLoginClick}
          />
        </ScrollReveal>
        <ScrollReveal delay={100}><WorkflowSection steps={workflowSteps} /></ScrollReveal>
        <ScrollReveal delay={100}><AutoDepositSection flow={depositFlow} /></ScrollReveal>
        <ScrollReveal delay={100}>
          <WhyChooseSection items={whyChooseUs} policies={policyHighlights} />
        </ScrollReveal>
        <ScrollReveal delay={100}><TestimonialsSection items={proofItems} /></ScrollReveal>
        <ScrollReveal delay={100}>
          <FaqSection
            eyebrow={settings.faq.eyebrow}
            items={settings.faq.items}
            title={settings.faq.title}
          />
        </ScrollReveal>
        <ScrollReveal delay={100}><ConsultSection onSubmit={handleConsultSubmit} /></ScrollReveal>
        <ScrollReveal delay={100}><FinalCta onLoginClick={onLoginClick} /></ScrollReveal>
      </main>

      <PublicFooter brand={settings.brand} footerGroups={footerGroups} logo={logo} />
    </div>
  )
}

export default PublicHome
