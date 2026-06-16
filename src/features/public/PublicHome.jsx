import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clapperboard, Megaphone, PackageCheck, ShieldCheck, Users, Eye, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import { publicApi } from '../../api/public.api'
import AutoDepositSection from './components/AutoDepositSection/AutoDepositSection'
import ConsultSection from './components/ConsultSection/ConsultSection'
import FaqSection from './components/FaqSection/FaqSection'
import FinalCta from './components/FinalCta/FinalCta'
import HeroSection from './components/HeroSection/HeroSection'
import PublicFooter from './components/PublicFooter/PublicFooter'
import PublicHeader from './components/PublicHeader/PublicHeader'
import TestimonialsSection from './components/TestimonialsSection/TestimonialsSection'
import TrustStrip from './components/TrustStrip/TrustStrip'
import WhyChooseSection from './components/WhyChooseSection/WhyChooseSection'
import WorkflowSection from './components/WorkflowSection/WorkflowSection'
import './components/ServiceCatalog/ServiceCatalog.css'
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

function PublicHome({ notice, onLoginClick }) {
  const navigate = useNavigate()
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

  const featuredServices = useMemo(() => {
    const source = apiServices.length > 0 ? apiServices : staticFeaturedServices
    let list = source.filter((s) => s.featured || s.badge === 'Nổi bật')
    if (list.length === 0) {
      list = source.slice(0, 4)
    }

    return list.map((s) => {
      let categorySlug = 'default'
      const nameLower = (s.categoryName || s.type || s.category || '').toLowerCase()
      if (nameLower.includes('capcut')) categorySlug = 'capcut'
      else if (nameLower.includes('facebook')) categorySlug = 'facebook'
      else if (nameLower.includes('nâng cấp') || nameLower.includes('upgrade')) categorySlug = 'upgrade'
      else if (nameLower.includes('quảng cáo') || nameLower.includes('ads') || nameLower.includes('advertising')) categorySlug = 'ads'

      let formattedPrice = s.price
      if (typeof s.price === 'number') {
        formattedPrice = `${Number(s.price).toLocaleString('vi-VN')}đ`
      } else if (s.price && !s.price.includes('đ') && !isNaN(Number(s.price))) {
        formattedPrice = `${Number(s.price).toLocaleString('vi-VN')}đ`
      } else if (!s.price) {
        formattedPrice = s.priceText || 'Báo giá'
      }

      const computedSlug = s.slug || (s.name || '').toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      return {
        ...s,
        category: s.category || categorySlug,
        categoryLabel: s.categoryLabel || s.categoryName || s.type || s.category || 'Dịch vụ',
        price: formattedPrice,
        slug: computedSlug,
        status: s.status || (s.stockStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : 'Còn hàng'),
        badge: s.badge || (s.featured ? 'Nổi bật' : ''),
      }
    })
  }, [apiServices])

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
        
        {/* Featured Products Section */}
        <ScrollReveal delay={100}>
          <section className="featured-products-home" id="services">
            <div className="home-section-header">
              <span className="eyebrow">Sản phẩm bán chạy</span>
              <h2 className="home-section-title">Sản Phẩm Nổi Bật</h2>
              <p className="home-section-desc">
                Các gói tài khoản và dịch vụ tối ưu được nhiều khách hàng lựa chọn sử dụng nhất
              </p>
            </div>

            <div className="featured-grid-home">
              {featuredServices.map((service, index) => {
                const isOutOfStock = service.status === 'Hết hàng' || service.stockStatus === 'OUT_OF_STOCK'
                const isFeatured = service.featured || service.badge === 'Nổi bật'

                return (
                  <div className={`service-card ${isFeatured ? 'featured' : ''}`} key={service.id || index}>
                    {isFeatured && (
                      <div className="service-card-badge">
                        <Sparkles size={12} /> {service.badge || 'Nổi bật'}
                      </div>
                    )}
                    
                    <div className="service-card-content">
                      <span className="service-card-category">{service.categoryLabel}</span>
                      <h4 className="service-card-title">{service.name}</h4>
                      
                      <div className="service-card-footer">
                        <div className="service-card-price-container">
                          <span className="price-label">Giá trọn gói</span>
                          <span className="price-val">{service.price}</span>
                        </div>
                        
                        <div className="service-card-actions">
                          <button
                            type="button"
                            className="btn-action btn-detail"
                            onClick={() => navigate(`/service/${service.slug}`)}
                            title="Xem chi tiết dịch vụ"
                          >
                            <Eye size={16} />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-buy"
                            disabled={isOutOfStock}
                            onClick={() => onLoginClick(service)}
                          >
                            <ShoppingCart size={16} />
                            <span>{isOutOfStock ? 'Hết hàng' : 'Mua ngay'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="view-all-container">
              <a href="/services" className="public-btn primary">
                <span>Xem tất cả dịch vụ</span>
                <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
          </section>
        </ScrollReveal>

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
