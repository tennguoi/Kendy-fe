import { useMemo, useState, useEffect } from 'react'
import { Clapperboard, Megaphone, PackageCheck, ShieldCheck, Users } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import { publicApi } from '../../api/public.api'
import AutoDepositSection from './components/AutoDepositSection/AutoDepositSection'
import ConsultSection from './components/ConsultSection/ConsultSection'
import FeaturedServices from './components/FeaturedServices/FeaturedServices'
import FaqSection from './components/FaqSection/FaqSection'
import FinalCta from './components/FinalCta/FinalCta'
import HeroSection from './components/HeroSection/HeroSection'
import PublicFooter from './components/PublicFooter/PublicFooter'
import PublicHeader from './components/PublicHeader/PublicHeader'
import ServiceCategories from './components/ServiceCategories/ServiceCategories'
import TestimonialsSection from './components/TestimonialsSection/TestimonialsSection'
import TrustStrip from './components/TrustStrip/TrustStrip'
import WhyChooseSection from './components/WhyChooseSection/WhyChooseSection'
import WorkflowSection from './components/WorkflowSection/WorkflowSection'
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
  featuredServices as staticFeaturedServices,
  serviceCategories as staticCategories,
} from './data/services.public'
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal'
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
  const cats = Array.isArray(apiCategories) ? apiCategories : []
  return cats.map((cat) => {
    const slug = pickCategorySlug(cat.name)
    return {
      id: slug,
      title: cat.name,
      description: cat.description || '',
      microcopy: cat.microcopy || '',
      icon: categoryIcons[slug] || ShieldCheck,
      priceFrom: cat.priceFrom || 'Theo gói',
      processingTime: cat.processingTime || 'Theo dịch vụ',
      warranty: cat.warranty || 'Theo điều kiện',
      requirements: cat.requirements ? cat.requirements.split('\n').map(r => r.trim()).filter(Boolean) : [],
      cta: cat.cta || 'Xem chi tiết',
    }
  })
}

function buildFeaturedServices(apiServices) {
  const services = Array.isArray(apiServices) ? apiServices : []
  return services.slice(0, 4)
}

function mapApiServiceToFeaturedRow(service) {
  //const slug = pickCategorySlug(service.categoryName || service.type)
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

  useEffect(() => {
    Promise.allSettled([
      publicApi.getServices({ limit: 4, sort: 'popular' }),
      publicApi.getCategories(),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') {
        const data = results[0].value
        setApiServices(Array.isArray(data) ? data : [])
      }
      if (results[1].status === 'fulfilled') {
        const data = results[1].value
        setApiCategories(Array.isArray(data) ? data : [])
      }
    })
  }, [])

  const hasApiData = apiServices.length > 0

  const mergedCategories = useMemo(() => {
    const apiCats = buildServiceCategories(apiCategories)
    if (apiCats.length > 0) return apiCats
    return staticCategories
  }, [apiCategories])

  const mergedFeaturedServices = useMemo(() => {
    if (!hasApiData) return staticFeaturedServices
    const featured = buildFeaturedServices(apiServices)
    return featured.map(mapApiServiceToFeaturedRow)
  }, [apiServices, hasApiData])

  const handleConsultSubmit = (event) => {
    event.preventDefault()
    onLoginClick()
  }

  return (
    <div className="public-home">
      <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />

      <main>
        <ScrollReveal delay={100}>
          <HeroSection
            logo={heroImg}
            notice={notice}
            onLoginClick={onLoginClick}
            serviceSignals={serviceSignals}
          />
        </ScrollReveal>
        <ScrollReveal delay={200}><TrustStrip items={trustStats} /></ScrollReveal>
        <ScrollReveal delay={100}><ServiceCategories categories={mergedCategories} /></ScrollReveal>
        <ScrollReveal delay={100}><FeaturedServices services={mergedFeaturedServices} onPurchaseClick={onLoginClick} /></ScrollReveal>
        <ScrollReveal delay={100}><WorkflowSection steps={workflowSteps} /></ScrollReveal>
        <ScrollReveal delay={100}><AutoDepositSection flow={depositFlow} /></ScrollReveal>
        <ScrollReveal delay={100}><WhyChooseSection items={whyChooseUs} policies={policyHighlights} /></ScrollReveal>
        <ScrollReveal delay={100}><TestimonialsSection items={proofItems} /></ScrollReveal>
        <ScrollReveal delay={100}><FaqSection groups={faqGroups} /></ScrollReveal>
        <ScrollReveal delay={100}><ConsultSection onSubmit={handleConsultSubmit} /></ScrollReveal>
        <ScrollReveal delay={100}><FinalCta onLoginClick={onLoginClick} /></ScrollReveal>
      </main>

      <PublicFooter footerGroups={footerGroups} logo={heroImg} />
    </div>
  )
}

export default PublicHome
