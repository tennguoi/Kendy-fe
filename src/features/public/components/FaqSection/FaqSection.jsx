import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HelpCircle,
  ChevronDown,
  Search,
  MessageCircleQuestion,
  Headphones,
  Sparkles,
  Layers,
  CreditCard,
  Video,
  Megaphone,
  X,
} from 'lucide-react'
import BaseInput from '../../../../components/ui/BaseInput'
import { faqGroups } from '../../data/faqs.public'
import './FaqSection.css'

const CATEGORY_ICONS = {
  'public.faqs.group1.title': Layers,
  'public.faqs.group2.title': CreditCard,
  'public.faqs.group3.title': Video,
  'public.faqs.group4.title': Megaphone,
}

function FaqSection({ eyebrow, items, title }) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIds, setOpenIds] = useState(() => new Set(['faq-0-0', 'faq-1-0']))

  // Build fallback lookup map for localized keys
  const lookupMap = useMemo(() => {
    const map = {}
    faqGroups.forEach((group, gIdx) => {
      group.items.forEach((it, itIdx) => {
        const itemKey = `faq-${gIdx}-${itIdx}`
        map[it.question] = {
          id: itemKey,
          questionKey: it.questionKey,
          answerKey: it.answerKey,
          groupKey: group.titleKey,
          groupTitle: group.title,
        }
      })
    })
    return map
  }, [])

  // Prepare normalized items with localization
  const normalizedItems = useMemo(() => {
    const sourceItems = Array.isArray(items) && items.length > 0
      ? items
      : faqGroups.flatMap((group, gIdx) =>
          group.items.map((it, itIdx) => ({
            id: `faq-${gIdx}-${itIdx}`,
            groupKey: group.titleKey,
            groupTitle: group.title,
            questionKey: it.questionKey,
            question: it.question,
            answerKey: it.answerKey,
            answer: it.answer,
          })),
        )

    return sourceItems.map((item, idx) => {
      const fallback = lookupMap[item.question] || {}
      const id = item.id || fallback.id || `faq-${idx}`
      const groupKey = item.groupKey || fallback.groupKey || 'public.faqs.group1.title'
      const groupTitle = item.groupTitle || fallback.groupTitle || 'Chung'
      const questionKey = item.questionKey || fallback.questionKey
      const answerKey = item.answerKey || fallback.answerKey

      const localizedQuestion = questionKey
        ? t(questionKey, { defaultValue: item.question })
        : item.question

      const localizedAnswer = answerKey
        ? t(answerKey, { defaultValue: item.answer })
        : item.answer

      const localizedGroup = groupKey
        ? t(groupKey, { defaultValue: groupTitle })
        : groupTitle

      return {
        id,
        groupKey,
        groupTitle: localizedGroup,
        question: localizedQuestion,
        answer: localizedAnswer,
      }
    })
  }, [items, lookupMap, t])

  // Categories list
  const categories = useMemo(() => {
    return faqGroups.map((g) => ({
      key: g.titleKey,
      label: t(g.titleKey, { defaultValue: g.title }),
      Icon: CATEGORY_ICONS[g.titleKey] || Sparkles,
    }))
  }, [t])

  // Filter items based on activeCategory and searchQuery
  const filteredItems = useMemo(() => {
    return normalizedItems.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.groupKey === activeCategory
      const query = searchQuery.trim().toLowerCase()
      if (!matchCategory) return false
      if (!query) return true
      return (
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      )
    })
  }, [normalizedItems, activeCategory, searchQuery])

  const toggleAccordion = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const localizedEyebrow = t('public.faqs.eyebrow', { defaultValue: eyebrow || 'FAQ' })
  const localizedTitle = t('public.faqs.title', { defaultValue: title || 'Các câu hỏi thường gặp' })
  const localizedSubtitle = t('public.faqs.subtitle', {
    defaultValue: 'Giải đáp nhanh những thắc mắc phổ biến về tài khoản, nâng cấp, thanh toán và bảo hành.',
  })

  return (
    <section className="public-section faq-section" id="faq" aria-labelledby="faq-title">
      <div className="container">
        {/* Header */}
        <header className="faq-header">
          <div className="faq-badge">
            <MessageCircleQuestion size={16} strokeWidth={2.5} aria-hidden="true" />
            <span>{localizedEyebrow}</span>
          </div>
          <h2 id="faq-title" className="faq-title text-heading-1">
            {localizedTitle}
          </h2>
          <p className="faq-subtitle text-body-lg">
            {localizedSubtitle}
          </p>
        </header>

        {/* Toolbar: Search + Category Tabs */}
        <div className="faq-toolbar">
          {/* Search Box */}
          <div className="faq-search-wrapper">
            <Search size={18} className="faq-search-icon" aria-hidden="true" />
            <BaseInput
              label={t('public.faqs.searchPlaceholder', { defaultValue: 'Tìm câu hỏi (vd: CapCut, bảo hành, nạp tiền...)' })}
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('public.faqs.searchPlaceholder', { defaultValue: 'Tìm câu hỏi (vd: CapCut, bảo hành, nạp tiền...)' })}
              aria-label={t('public.faqs.searchPlaceholder', { defaultValue: 'Tìm kiếm câu hỏi' })}
              helperText={searchQuery && (
                <button
                  type="button"
                  className="faq-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={15} />
                </button>
              )}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="faq-tabs" role="tablist" aria-label="Nhóm câu hỏi FAQ">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              className={`faq-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <Sparkles size={15} aria-hidden="true" />
              <span>{t('public.faqs.allTab', { defaultValue: 'Tất cả câu hỏi' })}</span>
              <span className="faq-tab-count">{normalizedItems.length}</span>
            </button>
            {categories.map((cat) => {
              const Icon = cat.Icon
              const count = normalizedItems.filter((i) => i.groupKey === cat.key).length
              return (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.key}
                  className={`faq-tab ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{cat.label}</span>
                  <span className="faq-tab-count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-content">
          {filteredItems.length === 0 ? (
            <div className="faq-empty-state">
              <HelpCircle size={44} strokeWidth={1.5} className="faq-empty-icon" />
              <p className="faq-empty-text">
                {t('public.faqs.noResults', { defaultValue: 'Không tìm thấy câu hỏi phù hợp với từ khóa.' })}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  className="faq-empty-reset"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('all')
                  }}
                >
                  {t('public.faqs.allTab', { defaultValue: 'Xem tất cả câu hỏi' })}
                </button>
              )}
            </div>
          ) : (
            <div className="faq-accordion-grid">
              {filteredItems.map((item) => {
                const isOpen = openIds.has(item.id)
                return (
                  <article
                    key={item.id}
                    className={`faq-card ${isOpen ? 'is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleAccordion(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      <span className="faq-question-icon">
                        <HelpCircle size={18} strokeWidth={2} aria-hidden="true" />
                      </span>
                      <span className="faq-question-text">{item.question}</span>
                      <span className="faq-chevron-wrapper">
                        <ChevronDown size={18} strokeWidth={2.5} className="faq-chevron" aria-hidden="true" />
                      </span>
                    </button>
                    <div
                      id={`faq-answer-${item.id}`}
                      className="faq-answer-collapse"
                      hidden={!isOpen}
                    >
                      <div className="faq-answer-inner">
                        <p>{item.answer}</p>
                        <div className="faq-answer-footer">
                          <span className="faq-group-tag">{item.groupTitle}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Support CTA Box */}
        <div className="faq-cta-card">
          <div className="faq-cta-left">
            <div className="faq-cta-icon-box">
              <Headphones size={26} strokeWidth={2} />
            </div>
            <div>
              <h3 className="faq-cta-title">
                {t('public.faqs.stillHaveQuestions', { defaultValue: 'Bạn vẫn còn câu hỏi chưa được giải đáp?' })}
              </h3>
              <p className="faq-cta-desc">
                {t('public.footer.description', {
                  defaultValue: 'Đội ngũ hỗ trợ trực tuyến 24/7 của chúng tôi sẵn sàng giải đáp và hỗ trợ mọi đơn hàng.',
                })}
              </p>
            </div>
          </div>
          <a href="#contact" className="faq-cta-btn">
            <span>{t('public.faqs.contactSupport', { defaultValue: 'Liên hệ hỗ trợ 24/7' })}</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default FaqSection