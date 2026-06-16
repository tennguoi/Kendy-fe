import { useMemo, useState, useEffect } from 'react'
import heroImg from '../../assets/hero.png'
import { publicApi } from '../../api/public.api'
import PublicHeader from './components/PublicHeader/PublicHeader'
import PublicFooter from './components/PublicFooter/PublicFooter'
import ServiceCatalog from './components/ServiceCatalog/ServiceCatalog'
import { navItems } from './data/publicSiteContent'
import { footerGroups } from './data/policies.public'
import {
  serviceCategories as staticCategories,
  serviceTableRows as staticTableRows,
} from './data/services.public'
import './PublicHome.css'

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
    }
  })
}

function PublicCatalog({ notice, onLoginClick }) {
  const [apiServices, setApiServices] = useState([])
  const [apiCategories, setApiCategories] = useState([])

  useEffect(() => {
    window.scrollTo(0, 0)
    
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

  const mergedCategories = useMemo(() => {
    const apiCats = buildServiceCategories(apiCategories)
    if (apiCats.length > 0) return apiCats
    return staticCategories
  }, [apiCategories])

  return (
    <div className="public-home">
      <PublicHeader logo={heroImg} navItems={navItems} onLoginClick={onLoginClick} />

      <main style={{ minHeight: 'calc(100svh - 200px)', paddingTop: '100px', paddingBottom: '60px' }}>
        <ServiceCatalog
          categories={mergedCategories}
          services={apiServices.length > 0 ? apiServices : staticTableRows}
          onPurchaseClick={onLoginClick}
        />
      </main>

      <PublicFooter footerGroups={footerGroups} logo={heroImg} />
    </div>
  )
}

export default PublicCatalog
