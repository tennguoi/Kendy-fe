import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  ShoppingCart,
  AlertTriangle,
  Info,
  PackageCheck,
  HelpCircle,
  XCircle,
} from 'lucide-react'
import { publicApi } from '../../../../api/public.api'
import {
  featuredServices as staticFeatured,
  serviceTableRows as staticRows,
} from '../../data/services.public'
import './ProductDetail.css'

function ProductDetail({ onLoginClick }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    setService(null)

    publicApi.getServices()
      .then((services) => {
        const list = Array.isArray(services) ? services : []
        const found = list.find(
          (s) => s.slug === slug || String(s.id) === slug || s.name === decodeURIComponent(slug)
        )
        if (found) {
          setService(found)
        } else {
          setError('Không tìm thấy dịch vụ này.')
        }
        setLoading(false)
      })
      .catch(() => {
        const decoded = decodeURIComponent(slug)
        const found = staticFeatured.find((s) => s.name === decoded)
          || staticRows.find((s) => s.name === decoded)
        if (found) {
          setService(found)
        } else {
          setError('Không tìm thấy dịch vụ.')
        }
        setLoading(false)
      })
  }, [slug])

  const detailSections = useMemo(() => {
    if (!service) return []

    const sections = []

    if (service.description) {
      sections.push({
        id: 'description',
        icon: FileText,
        title: 'Chi tiết sản phẩm',
        content: service.description,
        type: 'text',
      })
    }

    if (service.shortDescription) {
      sections.push({
        id: 'short-desc',
        icon: Info,
        title: 'Mô tả ngắn',
        content: service.shortDescription,
        type: 'text',
      })
    }

    if (service.requirements) {
      sections.push({
        id: 'requirements',
        icon: CheckCircle2,
        title: 'Yêu cầu',
        content: service.requirements,
        type: 'list',
      })
    }

    if (service.benefits) {
      sections.push({
        id: 'benefits',
        icon: PackageCheck,
        title: 'Lợi ích',
        content: service.benefits,
        type: 'list',
      })
    }

    if (service.processingTime) {
      sections.push({
        id: 'processing',
        icon: Clock,
        title: 'Thời gian xử lý',
        content: service.processingTime,
        type: 'text',
      })
    }

    if (service.warrantyPolicy || service.warrantyInfo) {
      sections.push({
        id: 'warranty',
        icon: ShieldCheck,
        title: 'Chính sách bảo hành',
        content: service.warrantyPolicy || service.warrantyInfo,
        type: 'text',
      })
    }

    if (service.refundPolicy) {
      sections.push({
        id: 'refund',
        icon: ShoppingCart,
        title: 'Chính sách hoàn tiền',
        content: service.refundPolicy,
        type: 'text',
      })
    }

    if (service.nonWarrantyCases) {
      sections.push({
        id: 'non-warranty',
        icon: XCircle,
        title: 'Trường hợp không bảo hành',
        content: service.nonWarrantyCases,
        type: 'list',
      })
    }

    if (service.usageRules) {
      sections.push({
        id: 'usage-rules',
        icon: AlertTriangle,
        title: 'Điều kiện sử dụng',
        content: service.usageRules,
        type: 'list',
      })
    }

    if (service.usageNotes) {
      sections.push({
        id: 'usage-notes',
        icon: HelpCircle,
        title: 'Lưu ý khi sử dụng',
        content: service.usageNotes,
        type: 'text',
      })
    }

    return sections
  }, [service])

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-loading">
          <div className="product-detail-spinner" />
          <p>Đang tải thông tin dịch vụ...</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-error">
          <AlertTriangle size={48} strokeWidth={1.5} />
          <h3>{error || 'Không tìm thấy dịch vụ'}</h3>
          <button type="button" className="product-detail-back-btn" onClick={() => navigate('/catalog')}>
            <ArrowLeft size={18} strokeWidth={2} />
            Quay lại danh mục
          </button>
        </div>
      </div>
    )
  }

  const price = service.priceText || `Từ ${Number(service.price).toLocaleString('vi-VN')}đ`
  const categoryName = service.categoryName || service.type || 'Dịch vụ'
  const stockStatus = service.stockStatus === 'OUT_OF_STOCK' ? 'Hết hàng' : service.stockStatus === 'CONSULTING_ONLY' ? 'Tư vấn' : 'Còn hàng'

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <button type="button" className="product-detail-back-btn" onClick={() => navigate('/catalog')}>
          <ArrowLeft size={18} strokeWidth={2} />
          Quay lại danh mục
        </button>

        <div className="product-detail-header">
          <div className="product-detail-info">
            <span className="product-detail-category">{categoryName}</span>
            <h1>{service.name}</h1>
            <div className="product-detail-price-row">
              <span className="product-detail-price">{price}</span>
              <span className="product-detail-stock">{stockStatus}</span>
            </div>
          </div>
        </div>

        <div className="product-detail-sections">
          {detailSections.map((section) => {
            const Icon = section.icon
            return (
              <section key={section.id} className="product-detail-section" id={`section-${section.id}`}>
                <div className="product-detail-section-head">
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                  <h2>{section.title}</h2>
                </div>
                <div className="product-detail-section-body">
                  {section.type === 'list' ? (
                    <ul className="product-detail-list">
                      {parseListContent(section.content).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="product-detail-text">{section.content}</div>
                  )}
                </div>
              </section>
            )
          })}
        </div>

        <div className="product-detail-actions">
          <button
            type="button"
            className="product-detail-buy-btn"
            onClick={onLoginClick}
          >
            <ShoppingCart size={20} strokeWidth={2} aria-hidden="true" />
            Đăng nhập để mua
          </button>
        </div>
      </div>
    </div>
  )
}

function parseListContent(content) {
  if (typeof content === 'string') {
    return content
      .split('\n')
      .map((line) => line.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)
  }
  if (Array.isArray(content)) return content
  return [String(content)]
}

export default ProductDetail
