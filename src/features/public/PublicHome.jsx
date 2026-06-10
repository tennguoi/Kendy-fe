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
import ServiceTableSection from './components/ServiceTableSection/ServiceTableSection'
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
  serviceTableRows as staticTableRows,
} from './data/services.public'
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
      microcopy: '',
      icon: categoryIcons[slug] || ShieldCheck,
      priceFrom: 'Theo gói',
      processingTime: 'Theo dịch vụ',
      warranty: 'Theo điều kiện',
      requirements: [],
      cta: 'Xem chi tiết',
    }
  })
}

function buildFeaturedServices(apiServices) {
  const services = Array.isArray(apiServices) ? apiServices : []
  const featured = services.filter((s) => s.featured).slice(0, 4)
  if (featured.length === 0) {
    return services.slice(0, 4)
  }
  return featured
}

function mapApiServiceToFeaturedRow(service) {
  //const slug = pickCategorySlug(service.categoryName || service.type)
  return {
    name: service.name,
    description: service.shortDescription || service.description || '',
    category: service.categoryName || service.type || 'Dịch vụ',
    price: service.priceText || `Từ ${Number(service.price).toLocaleString('vi-VN')}đ`,
    processingTime: service.processingTime || 'Theo quy trình',
    warranty: service.warrantyInfo || 'Theo điều kiện',
    badge: service.featured ? 'Nổi bật' : 'Mới',
    status: service.stockStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Còn hàng',
    mode: 'Mua ngay',
    cta: 'Mua ngay',
    conditions: ['Đăng nhập để mua', 'Hỗ trợ sau mua'],
  }
}

function mapApiServiceToTableRow(service) {
  const slug = pickCategorySlug(service.categoryName || service.type)
  return {
    name: service.name,
    category: slug,
    categoryLabel: service.categoryName || service.type || 'Dịch vụ',
    price: service.priceText || `Từ ${Number(service.price).toLocaleString('vi-VN')}đ`,
    processingTime: service.processingTime || 'Theo quy trình',
    warranty: service.warrantyInfo || 'Theo điều kiện',
    status: service.stockStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Còn hàng',
    cta: 'Mua ngay',
    icon: categoryIcons[slug] || ShieldCheck,
  }
}

function buildFilters(apiCategories) {
  const cats = Array.isArray(apiCategories) ? apiCategories : []
  if (cats.length === 0) return [{ id: 'all', label: 'Tất cả' }]
  return [
    { id: 'all', label: 'Tất cả' },
    ...cats.map((cat) => ({
      id: pickCategorySlug(cat.name),
      label: cat.name,
    })),
  ]
}

function PublicHome({ notice, onLoginClick }) {
  const [apiServices, setApiServices] = useState([])
  const [apiCategories, setApiCategories] = useState([])

  useEffect(() => {
    Promise.allSettled([
      publicApi.getServices({ limit: 50 }),
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

  const mergedFilters = useMemo(() => {
    const filters = buildFilters(apiCategories)
    if (filters.length > 1) return filters
    return [{ id: 'all', label: 'Tất cả' }, { id: 'capcut', label: 'CapCut' }, { id: 'facebook', label: 'Facebook' }, { id: 'upgrade', label: 'Nâng cấp' }, { id: 'ads', label: 'Quảng cáo' }]
  }, [apiCategories])

  const mergedTableRows = useMemo(() => {
    if (!hasApiData) return staticTableRows
    return apiServices.map(mapApiServiceToTableRow)
  }, [apiServices, hasApiData])

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
        <ServiceCategories categories={mergedCategories} />
        <FeaturedServices services={mergedFeaturedServices} onPurchaseClick={onLoginClick} />
        <ServiceTableSection
          filters={mergedFilters}
          rows={mergedTableRows}
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
