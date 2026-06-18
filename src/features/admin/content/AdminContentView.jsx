import {
  Clock3,
  HelpCircle,
  Image,
  Link2,
  Mail,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import PromoBanner from '../../public/components/PromoBanner/PromoBanner'
import EmailTextEditor from './EmailTextEditor'
import {
  buildEmailTemplateDrafts,
  EMAIL_TEMPLATE_DEFINITIONS,
  renderTransactionalEmail,
} from './emailTemplates'
import {
  buildSiteSettings,
  defaultSiteSettings,
  normalizeHexColor,
  SITE_SETTING_SLUGS,
} from '../../public/data/siteSettings'

const sections = [
  {
    id: 'banner',
    label: 'Banner & countdown',
    description: 'Thông báo chương trình sale và tự ẩn khi hết hạn.',
    icon: Clock3,
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Quản lý danh sách câu hỏi và câu trả lời.',
    icon: HelpCircle,
  },
  {
    id: 'brand',
    label: 'Thương hiệu & liên hệ',
    description: 'Tên, logo, footer, thông tin liên hệ và social.',
    icon: Image,
  },
  {
    id: 'theme',
    label: 'Màu giao diện',
    description: 'Đổi màu chủ đạo theo mùa hoặc sự kiện.',
    icon: Palette,
  },
  {
    id: 'email',
    label: 'Email giao dịch',
    description: 'Chỉ sửa nội dung chữ, form email luôn được khóa cố định.',
    icon: Mail,
  },
]

const sectionMeta = {
  banner: { slug: SITE_SETTING_SLUGS.banner, title: 'Banner khuyến mãi' },
  faq: { slug: SITE_SETTING_SLUGS.faq, title: 'Câu hỏi thường gặp' },
  brand: { slug: SITE_SETTING_SLUGS.brand, title: 'Thương hiệu và liên hệ' },
  theme: { slug: SITE_SETTING_SLUGS.theme, title: 'Màu giao diện' },
  email: { title: 'Email giao dịch' },
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createRowId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function AdminContentView({ onSetError, onSetNotice, token }) {
  const [activeSection, setActiveSection] = useState('banner')
  const [activeEmailSlug, setActiveEmailSlug] = useState(EMAIL_TEMPLATE_DEFINITIONS[0].slug)
  const [drafts, setDrafts] = useState(() => clone(defaultSiteSettings))
  const [emailDrafts, setEmailDrafts] = useState(() => buildEmailTemplateDrafts([]))
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadContent = useCallback(async () => {
    if (!token) return
    setLoading(true)
    onSetError('')
    try {
      const [siteResult, emailResult] = await Promise.all([
        adminApi.listContent({ type: 'SITE_SECTION' }, token),
        adminApi.listContent({ type: 'EMAIL_TEMPLATE' }, token),
      ])
      const siteItems = Array.isArray(siteResult) ? siteResult : []
      const emailItems = Array.isArray(emailResult) ? emailResult : []
      setDrafts(buildSiteSettings(siteItems))
      setEmailDrafts(buildEmailTemplateDrafts(emailItems))
      setRecords(
        Object.fromEntries(
          [...siteItems, ...emailItems]
            .filter((item) => (
              Object.values(SITE_SETTING_SLUGS).includes(item.slug)
              || EMAIL_TEMPLATE_DEFINITIONS.some((definition) => definition.slug === item.slug)
            ))
            .map((item) => [item.slug, item]),
        ),
      )
    } catch (error) {
      onSetError(error.message || 'Không tải được cấu hình website.')
    } finally {
      setLoading(false)
    }
  }, [onSetError, token])

  useEffect(() => {
    const timer = window.setTimeout(loadContent, 0)
    return () => window.clearTimeout(timer)
  }, [loadContent])

  const updateDraft = (patch) => {
    setDrafts((current) => ({
      ...current,
      [activeSection]: { ...current[activeSection], ...patch },
    }))
  }

  const updateEmailDraft = (patch) => {
    setEmailDrafts((current) => ({
      ...current,
      [activeEmailSlug]: { ...current[activeEmailSlug], ...patch },
    }))
  }

  const saveSection = async (event) => {
    event.preventDefault()
    const meta = sectionMeta[activeSection]
    const currentDraft = activeSection === 'email'
      ? emailDrafts[activeEmailSlug]
      : drafts[activeSection]

    if (activeSection === 'faq') {
      const hasInvalidItem = currentDraft.items.some(
        (item) => !item.question.trim() || !item.answer.trim(),
      )
      if (hasInvalidItem) {
        onSetError('Mỗi mục FAQ phải có đầy đủ câu hỏi và câu trả lời.')
        return
      }
    }

    setSubmitting(true)
    onSetError('')
    try {
      const emailDefinition = activeSection === 'email'
        ? EMAIL_TEMPLATE_DEFINITIONS.find((item) => item.slug === activeEmailSlug)
        : null
      const slug = emailDefinition?.slug || meta.slug
      const payload = activeSection === 'email'
        ? {
            type: 'EMAIL_TEMPLATE',
            slug,
            title: currentDraft.subject,
            summary: JSON.stringify(currentDraft),
            content: renderTransactionalEmail(emailDefinition, currentDraft, drafts.brand),
            imageUrl: null,
            ctaUrl: null,
            seoTitle: null,
            seoDescription: null,
            published: true,
            sortOrder: 0,
          }
        : {
            type: 'SITE_SECTION',
            slug,
            title: meta.title,
            summary: null,
            content: JSON.stringify(currentDraft),
            imageUrl: null,
            ctaUrl: null,
            seoTitle: null,
            seoDescription: null,
            published: true,
            sortOrder: 0,
          }
      const existing = records[slug]
      const saved = existing
        ? await adminApi.updateContent(existing.id, payload, token)
        : await adminApi.createContent(payload, token)
      setRecords((current) => ({ ...current, [slug]: saved }))
      onSetNotice(
        activeSection === 'email'
          ? `Đã lưu mẫu ${emailDefinition.label.toLowerCase()}.`
          : `Đã lưu ${meta.title.toLowerCase()}.`,
      )
    } catch (error) {
      onSetError(error.message || `Không lưu được ${meta.title.toLowerCase()}.`)
    } finally {
      setSubmitting(false)
    }
  }

  const updateFaqItem = (id, patch) => {
    updateDraft({
      items: drafts.faq.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const removeFaqItem = (id) => {
    updateDraft({ items: drafts.faq.items.filter((item) => item.id !== id) })
  }

  const addFaqItem = () => {
    updateDraft({
      items: [
        ...drafts.faq.items,
        { id: createRowId('faq'), question: '', answer: '' },
      ],
    })
  }

  const updateSocial = (id, patch) => {
    updateDraft({
      socials: drafts.brand.socials.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const removeSocial = (id) => {
    updateDraft({ socials: drafts.brand.socials.filter((item) => item.id !== id) })
  }

  const addSocial = () => {
    updateDraft({
      socials: [
        ...drafts.brand.socials,
        { id: createRowId('social'), label: '', url: '' },
      ],
    })
  }

  const activeRecordSlug = activeSection === 'email'
    ? activeEmailSlug
    : sectionMeta[activeSection].slug

  return (
    <section className="admin-view content-settings-view">
      <div className="admin-toolbar">
        <div>
          <h2>Nội dung website</h2>
          <p>Chỉ quản lý những nội dung vận hành cần thay đổi thường xuyên.</p>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadContent} disabled={loading}>
          <RefreshCw size={18} aria-hidden="true" />
          <span>{loading ? 'Đang tải...' : 'Tải lại'}</span>
        </button>
      </div>

      <div className="content-settings-layout">
        <nav className="content-settings-nav" aria-label="Nhóm nội dung website">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                type="button"
                className={activeSection === section.id ? 'active' : ''}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={19} aria-hidden="true" />
                <span>
                  <strong>{section.label}</strong>
                  <small>{section.description}</small>
                </span>
              </button>
            )
          })}
        </nav>

        <form className="admin-panel content-settings-editor" onSubmit={saveSection}>
          <div className="admin-panel-head">
            <div>
              <h3>{sectionMeta[activeSection].title}</h3>
              <span>
                {records[activeRecordSlug] ? 'Đã lưu trong hệ thống' : 'Chưa có dữ liệu, sẽ tạo mới'}
              </span>
            </div>
          </div>

          {activeSection === 'banner' && (
            <div className="admin-form compact">
              <label className="admin-check-row">
                <input
                  type="checkbox"
                  checked={drafts.banner.enabled}
                  onChange={(event) => updateDraft({ enabled: event.target.checked })}
                />
                <span>Hiển thị banner khuyến mãi</span>
              </label>
              <div className="admin-form-grid two-columns">
                <label>
                  <span>Nhãn nhỏ</span>
                  <input
                    value={drafts.banner.eyebrow}
                    onChange={(event) => updateDraft({ eyebrow: event.target.value })}
                  />
                </label>
                <label>
                  <span>Tiêu đề chương trình</span>
                  <input
                    value={drafts.banner.title}
                    onChange={(event) => updateDraft({ title: event.target.value })}
                    required
                  />
                </label>
              </div>
              <label>
                <span>Mô tả</span>
                <textarea
                  value={drafts.banner.description}
                  onChange={(event) => updateDraft({ description: event.target.value })}
                  rows={3}
                />
              </label>
              <div className="admin-form-grid two-columns">
                <label>
                  <span>Chữ trên nút</span>
                  <input
                    value={drafts.banner.ctaLabel}
                    onChange={(event) => updateDraft({ ctaLabel: event.target.value })}
                  />
                </label>
                <label>
                  <span>Đường dẫn nút</span>
                  <input
                    value={drafts.banner.ctaUrl}
                    onChange={(event) => updateDraft({ ctaUrl: event.target.value })}
                    placeholder="/catalog"
                  />
                </label>
              </div>
              <div className="admin-form-grid two-columns">
                <label>
                  <span>Màu nền</span>
                  <div className="content-color-input">
                    <input
                      type="color"
                      value={drafts.banner.backgroundColor}
                      onChange={(event) => updateDraft({ backgroundColor: event.target.value })}
                    />
                    <input
                      value={drafts.banner.backgroundColor}
                      onChange={(event) => updateDraft({
                        backgroundColor: normalizeHexColor(
                          event.target.value,
                          drafts.banner.backgroundColor,
                        ),
                      })}
                    />
                  </div>
                </label>
                <label>
                  <span>Màu chữ</span>
                  <div className="content-color-input">
                    <input
                      type="color"
                      value={drafts.banner.textColor}
                      onChange={(event) => updateDraft({ textColor: event.target.value })}
                    />
                    <input
                      value={drafts.banner.textColor}
                      onChange={(event) => updateDraft({
                        textColor: normalizeHexColor(event.target.value, drafts.banner.textColor),
                      })}
                    />
                  </div>
                </label>
              </div>
              <label className="admin-check-row">
                <input
                  type="checkbox"
                  checked={drafts.banner.countdownEnabled}
                  onChange={(event) => updateDraft({ countdownEnabled: event.target.checked })}
                />
                <span>Bật đếm ngược và tự ẩn khi hết hạn</span>
              </label>
              {drafts.banner.countdownEnabled && (
                <label>
                  <span>Thời điểm kết thúc</span>
                  <input
                    type="datetime-local"
                    value={toLocalDateTime(drafts.banner.endsAt)}
                    onChange={(event) => updateDraft({
                      endsAt: event.target.value ? new Date(event.target.value).toISOString() : '',
                    })}
                    required
                  />
                </label>
              )}
              <div className="content-preview-block">
                <span>Xem trước</span>
                <PromoBanner config={{ ...drafts.banner, enabled: true }} />
              </div>
            </div>
          )}

          {activeSection === 'faq' && (
            <div className="admin-form compact">
              <div className="admin-form-grid two-columns">
                <label>
                  <span>Nhãn nhỏ</span>
                  <input
                    value={drafts.faq.eyebrow}
                    onChange={(event) => updateDraft({ eyebrow: event.target.value })}
                  />
                </label>
                <label>
                  <span>Tiêu đề khu vực FAQ</span>
                  <input
                    value={drafts.faq.title}
                    onChange={(event) => updateDraft({ title: event.target.value })}
                    required
                  />
                </label>
              </div>

              <div className="content-repeat-list">
                {drafts.faq.items.map((item, index) => (
                  <article key={item.id} className="content-repeat-item">
                    <div className="content-repeat-head">
                      <strong>Câu hỏi {index + 1}</strong>
                      <button
                        type="button"
                        className="admin-danger-button slim"
                        onClick={() => removeFaqItem(item.id)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        <span>Xóa</span>
                      </button>
                    </div>
                    <label>
                      <span>Câu hỏi</span>
                      <input
                        value={item.question}
                        onChange={(event) => updateFaqItem(item.id, { question: event.target.value })}
                        required
                      />
                    </label>
                    <label>
                      <span>Câu trả lời</span>
                      <textarea
                        value={item.answer}
                        onChange={(event) => updateFaqItem(item.id, { answer: event.target.value })}
                        rows={3}
                        required
                      />
                    </label>
                  </article>
                ))}
              </div>
              <button type="button" className="admin-icon-button" onClick={addFaqItem}>
                <Plus size={16} aria-hidden="true" />
                <span>Thêm câu hỏi</span>
              </button>
            </div>
          )}

          {activeSection === 'brand' && (
            <div className="admin-form compact">
              <div className="admin-form-grid two-columns">
                <label>
                  <span>Tên thương hiệu</span>
                  <input
                    value={drafts.brand.name}
                    onChange={(event) => updateDraft({ name: event.target.value })}
                    required
                  />
                </label>
                <label>
                  <span>Tagline</span>
                  <input
                    value={drafts.brand.tagline}
                    onChange={(event) => updateDraft({ tagline: event.target.value })}
                  />
                </label>
              </div>
              <label>
                <span>Logo URL</span>
                <div className="content-logo-field">
                  <input
                    value={drafts.brand.logoUrl}
                    onChange={(event) => updateDraft({ logoUrl: event.target.value })}
                    placeholder="https://.../logo.png"
                  />
                  {drafts.brand.logoUrl && <img src={drafts.brand.logoUrl} alt="Xem trước logo" />}
                </div>
              </label>
              <label>
                <span>Mô tả footer</span>
                <textarea
                  value={drafts.brand.description}
                  onChange={(event) => updateDraft({ description: event.target.value })}
                  rows={3}
                />
              </label>
              <div className="admin-form-grid two-columns">
                <label>
                  <span>Email liên hệ</span>
                  <input
                    type="email"
                    value={drafts.brand.email}
                    onChange={(event) => updateDraft({ email: event.target.value })}
                  />
                </label>
                <label>
                  <span>Số điện thoại / Zalo</span>
                  <input
                    value={drafts.brand.phone}
                    onChange={(event) => updateDraft({ phone: event.target.value })}
                  />
                </label>
              </div>
              <label>
                <span>Địa chỉ</span>
                <input
                  value={drafts.brand.address}
                  onChange={(event) => updateDraft({ address: event.target.value })}
                />
              </label>
              <label>
                <span>Tên hiển thị ở copyright</span>
                <input
                  value={drafts.brand.copyright}
                  onChange={(event) => updateDraft({ copyright: event.target.value })}
                />
              </label>

              <div className="content-repeat-list">
                <div className="content-repeat-title">
                  <strong>Social links</strong>
                  <button type="button" className="admin-icon-button slim" onClick={addSocial}>
                    <Plus size={14} aria-hidden="true" />
                    <span>Thêm link</span>
                  </button>
                </div>
                {drafts.brand.socials.map((item) => (
                  <article key={item.id} className="content-social-row">
                    <label>
                      <span>Tên kênh</span>
                      <input
                        value={item.label}
                        onChange={(event) => updateSocial(item.id, { label: event.target.value })}
                        placeholder="Facebook"
                      />
                    </label>
                    <label>
                      <span>Đường dẫn</span>
                      <input
                        value={item.url}
                        onChange={(event) => updateSocial(item.id, { url: event.target.value })}
                        placeholder="https://..."
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-danger-button slim"
                      onClick={() => removeSocial(item.id)}
                      aria-label={`Xóa ${item.label || 'social link'}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'theme' && (
            <div className="admin-form compact">
              {[
                ['primaryColor', 'Màu chủ đạo'],
                ['primaryHoverColor', 'Màu khi hover'],
                ['accentColor', 'Màu điểm nhấn'],
              ].map(([key, label]) => (
                <label key={key}>
                  <span>{label}</span>
                  <div className="content-color-input">
                    <input
                      type="color"
                      value={drafts.theme[key]}
                      onChange={(event) => updateDraft({ [key]: event.target.value })}
                    />
                    <input
                      value={drafts.theme[key]}
                      onChange={(event) => updateDraft({
                        [key]: normalizeHexColor(event.target.value, drafts.theme[key]),
                      })}
                    />
                  </div>
                </label>
              ))}
              <div
                className="content-theme-preview"
                style={{
                  '--preview-primary': drafts.theme.primaryColor,
                  '--preview-hover': drafts.theme.primaryHoverColor,
                  '--preview-accent': drafts.theme.accentColor,
                }}
              >
                <span>Xem trước bảng màu</span>
                <div>
                  <button type="button">Nút chính</button>
                  <i />
                  <Link2 size={20} aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'email' && (
            <EmailTextEditor
              activeSlug={activeEmailSlug}
              brand={drafts.brand}
              drafts={emailDrafts}
              onActiveSlugChange={setActiveEmailSlug}
              onChange={updateEmailDraft}
            />
          )}

          <div className="content-settings-save">
            <button type="submit" disabled={submitting || loading}>
              <Save size={17} aria-hidden="true" />
              <span>{submitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default AdminContentView
