import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, MessageSquare, Verified } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './TestimonialsSection.css'

function TestimonialsSection({ items = [], autoPlay = true, interval = 5000 }) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState(null)

  const defaultItems = [
    {
      author: 'Minh Anh',
      role: 'Content Creator',
      avatar: 'MA',
      rating: 5,
      content: t('public.testimonials.item1', { defaultValue: 'Mua CapCut Pro 12 tháng, nạp ví xong 5 phút là xong. Đơn hàng có mã theo dõi rõ ràng, không phải lo chờ tin nhắn thủ công như chỗ khác.' }),
      service: 'CapCut Pro 12 tháng',
      verified: true,
    },
    {
      author: 'Hùng Nguyễn',
      role: 'Digital Marketer',
      avatar: 'HN',
      rating: 5,
      content: t('public.testimonials.item2', { defaultValue: 'Chạy quảng cáo Facebook qua Kendy gần 1 năm. BM luôn ổn định, khi có vấn đề tạo ticket gắn đơn được hỗ trợ rất nhanh. Uy tín thực sự.' }),
      service: 'Facebook Ads - BM Agency',
      verified: true,
    },
    {
      author: 'Lan Chi',
      role: 'Small Business Owner',
      avatar: 'LC',
      rating: 5,
      content: t('public.testimonials.item3', { defaultValue: 'Nâng cấp Fanpage từ cá nhân sang doanh nghiệp. Quy trình minh bạch, có hợp đồng, bảo hành rõ ràng. Ví tiền nạp vào dễ dàng quản lý chi tiêu quảng cáo.' }),
      service: 'Nâng cấp Fanpage',
      verified: true,
    },
    {
      author: 'Tuấn Kiệt',
      role: 'Freelancer',
      avatar: 'TK',
      rating: 4,
      content: t('public.testimonials.item4', { defaultValue: 'Mua tài khoản Facebook Ads cá nhân giá tốt. Giao dịch qua ví Kendy rất tiện, nạp xong tự động cộng tiền. Hỗ trợ 24/7 qua ticket, team phản hồi nhiệt tình.' }),
      service: 'Tài khoản FB Ads cá nhân',
      verified: true,
    },
  ]

  const displayItems = items.length > 0 ? items : defaultItems
  const totalItems = displayItems.length

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || totalItems <= 1) return

    const timer = setInterval(() => {
      if (!isAnimating) {
        goToNext()
      }
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, totalItems, interval, isAnimating])

  const goToSlide = useCallback((index) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 400)
  }, [isAnimating])

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % totalItems)
  }, [currentIndex, totalItems, goToSlide])

  const goToPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + totalItems) % totalItems)
  }, [currentIndex, totalItems, goToSlide])

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToNext() : goToPrev()
    }
    setTouchStart(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrev()
    if (e.key === 'ArrowRight') goToNext()
  }

  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-title" onKeyDown={handleKeyDown}>
      <div className="container">
        <header className="testimonials__header">
          <span className="eyebrow">{t('public.testimonials.eyebrow', { defaultValue: 'Khách hàng nói về Kendy Digital' })}</span>
          <h2 id="testimonials-title" className="testimonials__title text-heading-1">
            {t('public.testimonials.title', { defaultValue: 'Được tin dùng bởi 50.000+ khách hàng' })}
          </h2>
          <p className="testimonials__description text-body-lg">
            {t('public.testimonials.description', { defaultValue: 'Những phản hồi thực tế từ người dùng dịch vụ CapCut, Facebook, quảng cáo và nâng cấp tài khoản.' })}
          </p>
        </header>

        <div className="testimonials__carousel" role="region" aria-label="Carousel đánh giá khách hàng">
          <div className="testimonials__track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {displayItems.map((item, index) => (
              <article key={index} className="testimonials__card">
                <div className="testimonials__rating">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={18}
                      strokeWidth={2}
                      fill={i < item.rating ? 'currentColor' : 'none'}
                      className={i < item.rating ? 'filled' : ''}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <blockquote className="testimonials__content">
                  <p className="testimonials__text">"{item.content}"</p>
                </blockquote>

                <footer className="testimonials__footer">
                  <div className="testimonials__avatar" aria-hidden="true">
                    {item.avatar}
                  </div>
                  <div className="testimonials__author">
                    <div className="testimonials__author-name">
                      {item.author}
                      {item.verified && (
                        <Verified size={16} strokeWidth={2.5} className="testimonials__verified" aria-label="Khách hàng đã xác thực" />
                      )}
                    </div>
                    <div className="testimonials__author-role">{item.role}</div>
                  </div>
                  <div className="testimonials__service">
                    <MessageSquare size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{item.service}</span>
                  </div>
                </footer>
              </article>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            className="testimonials__nav testimonials__nav--prev"
            onClick={goToPrev}
            aria-label={t('public.testimonials.prev', { defaultValue: 'Đánh giá trước' })}
            disabled={isAnimating}
          >
            <ChevronLeft size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="testimonials__nav testimonials__nav--next"
            onClick={goToNext}
            aria-label={t('public.testimonials.next', { defaultValue: 'Đánh giá sau' })}
            disabled={isAnimating}
          >
            <ChevronRight size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="testimonials__dots" role="tablist" aria-label="Chọn đánh giá">
          {displayItems.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={t('public.testimonials.dotLabel', { defaultValue: 'Đánh giá {index}', index: index + 1 })}
              className={`testimonials__dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Stats Summary */}
        <div className="testimonials__stats">
          <div className="testimonials__stat">
            <span className="testimonials__stat-value">4.9</span>
            <span className="testimonials__stat-label">{t('public.testimonials.stats.rating', { defaultValue: 'Đánh giá trung bình' })}</span>
          </div>
          <div className="testimonials__stat">
            <span className="testimonials__stat-value">50,000+</span>
            <span className="testimonials__stat-label">{t('public.testimonials.stats.customers', { defaultValue: 'Khách hàng tin dùng' })}</span>
          </div>
          <div className="testimonials__stat">
            <span className="testimonials__stat-value">99%</span>
            <span className="testimonials__stat-label">{t('public.testimonials.stats.satisfaction', { defaultValue: 'Hài lòng' })}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection