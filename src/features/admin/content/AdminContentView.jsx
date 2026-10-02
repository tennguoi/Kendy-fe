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
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import PromoBanner from '../../public/components/PromoBanner/PromoBanner'
import EmailTextEditor from './EmailTextEditor'
import RichEditor from '../../../components/RichEditor/RichEditor'
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
import BaseInput from '../../../components/ui/BaseInput'
import { resolveAdminError } from '../adminErrorResolver'


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
  const { t } = useTranslation()
  const sections = [
    {
      id: 'banner',
      label: t('admin.content.sections.banner'),
      description: t('admin.content.sections.bannerDesc'),
      icon: Clock3,
    },
    {
      id: 'faq',
      label: t('admin.content.sections.faq'),
      description: t('admin.content.sections.faqDesc'),
      icon: HelpCircle,
    },
    {
      id: 'brand',
      label: t('admin.content.sections.brand'),
      description: t('admin.content.sections.brandDesc'),
      icon: Image,
    },
    {
      id: 'theme',
      label: t('admin.content.sections.theme'),
      description: t('admin.content.sections.themeDesc'),
      icon: Palette,
    },
    {
      id: 'email',
      label: t('admin.content.sections.email'),
      description: t('admin.content.sections.emailDesc'),
      icon: Mail,
    },
  ]
  const sectionMeta = {
    banner: { slug: SITE_SETTING_SLUGS.banner, title: t('admin.content.banner.title') },
    faq: { slug: SITE_SETTING_SLUGS.faq, title: t('admin.content.faq.title') },
    brand: { slug: SITE_SETTING_SLUGS.brand, title: t('admin.content.brand.title') },
    theme: { slug: SITE_SETTING_SLUGS.theme, title: t('admin.content.theme.title') },
    email: { title: t('admin.content.email.title') },
  }
  const [activeSection, setActiveSection] = useState('banner')
  const [activeEmailSlug, setActiveEmailSlug] = useState(EMAIL_TEMPLATE_DEFINITIONS[0].slug)
  const [drafts, setDrafts] = useState(() => clone(defaultSiteSettings))
  const [emailDrafts, setEmailDrafts] = useState(() => buildEmailTemplateDrafts([]))
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

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
      let emailItems = Array.isArray(emailResult) ? emailResult : []
      setDrafts(buildSiteSettings(siteItems))
      const drafts = buildEmailTemplateDrafts(emailItems)
      setEmailDrafts(drafts)

      const existingSlugs = new Set(emailItems.map((item) => item.slug))
      const missing = EMAIL_TEMPLATE_DEFINITIONS.filter((d) => !existingSlugs.has(d.slug))
      if (missing.length > 0) {
        const brand = siteItems.find((item) => item.slug === SITE_SETTING_SLUGS.brand)
        const brandConfig = brand ? { name: brand.title, logoUrl: brand.imageUrl } : {}
        for (const definition of missing) {
          const draft = drafts[definition.slug]
          const saved = await adminApi.createContent({
            type: 'EMAIL_TEMPLATE',
            slug: definition.slug,
            title: draft.subject,
            summary: JSON.stringify(draft),
            content: renderTransactionalEmail(definition, draft, brandConfig),
            imageUrl: null, ctaUrl: null,
            seoTitle: null, seoDescription: null,
            published: true, sortOrder: 0,
          }, token)
          emailItems = [...emailItems, saved]
        }
        setEmailDrafts(buildEmailTemplateDrafts(emailItems))
      }

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
      onSetError(resolveAdminError(error, t('admin.content.loadError')))
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

  const uploadLogo = async (file) => {
    if (!file) return
    setUploadingLogo(true)
    onSetError('')
    try {
      const uploaded = await adminApi.uploadServiceImage(file, token)
      setDrafts((current) => ({
        ...current,
        brand: { ...current.brand, logoUrl: uploaded.url },
      }))
      onSetNotice('Đã tải logo lên. Nhấn “Lưu thay đổi” để áp dụng toàn hệ thống.')
    } catch (error) {
      onSetError(resolveAdminError(error, 'Không thể tải logo lên.'))
    } finally {
      setUploadingLogo(false)
    }
  }

  const uploadFavicon = async (file) => {
    if (!file) return
    setUploadingFavicon(true)
    onSetError('')
    try {
      const uploaded = await adminApi.uploadServiceImage(file, token)
      setDrafts((current) => ({
        ...current,
        brand: { ...current.brand, faviconUrl: uploaded.url },
      }))
      onSetNotice('Đã tải favicon lên. Nhấn “Lưu thay đổi” để áp dụng toàn hệ thống.')
    } catch (error) {
      onSetError(resolveAdminError(error, 'Không thể tải favicon lên.'))
    } finally {
      setUploadingFavicon(false)
    }
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
        onSetError(t('admin.content.faqValidationError'))
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
            content: currentDraft.rawHtml || renderTransactionalEmail(emailDefinition, currentDraft, drafts.brand),
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
      if (existing) {
        payload.version = existing.version
      }
      const saved = existing
        ? await adminApi.updateContent(existing.id, payload, token)
        : await adminApi.createContent(payload, token)
      setRecords((current) => ({ ...current, [slug]: saved }))
      if (activeSection !== 'email') {
        window.dispatchEvent(new CustomEvent('kd-site-settings-updated'))
      }
      onSetNotice(
        activeSection === 'email'
          ? t('admin.content.saveSuccessEmail', { name: emailDefinition.label.toLowerCase() })
          : t('admin.content.saveSuccess', { name: meta.title.toLowerCase() }),
      )
    } catch (error) {
      onSetError(resolveAdminError(error, t('admin.content.saveError', { name: meta.title.toLowerCase() })))
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
          <h2>{t('admin.content.title')}</h2>
          <p>{t('admin.content.description')}</p>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadContent} disabled={loading}>
          <RefreshCw size={18} aria-hidden="true" />
          <span>{loading ? t('admin.content.loading') : t('admin.content.reload')}</span>
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
                {records[activeRecordSlug] ? t('admin.content.savedRecord') : t('admin.content.newRecord')}
              </span>
            </div>
          </div>

          {activeSection === 'banner' && (
            <div className="admin-form compact">
              <label className="admin-check-row">
                <BaseInput
                  type="checkbox"
                  checked={drafts.banner.enabled}
                  onChange={(value) => updateDraft({ enabled: value })}
                />
                <span>{t('admin.content.banner.showBanner')}</span>
              </label>
              <div className="admin-form-grid two-columns">
                <label>
                  <span>{t('admin.content.banner.eyebrow')}</span>
                  <BaseInput
                    value={drafts.banner.eyebrow}
                    onChange={(event) => updateDraft({ eyebrow: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t('admin.content.banner.titleField')}</span>
                  <BaseInput
                    value={drafts.banner.title}
                    onChange={(event) => updateDraft({ title: event.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="admin-form-group">
                <span>{t('admin.content.banner.description')}</span>
                <RichEditor value={drafts.banner.description} onChange={(value) => updateDraft({ description: value })} minHeight={120} />
              </div>
              <div className="admin-form-grid two-columns">
                <label>
                  <span>{t('admin.content.banner.ctaLabel')}</span>
                  <BaseInput
                    value={drafts.banner.ctaLabel}
                    onChange={(event) => updateDraft({ ctaLabel: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t('admin.content.banner.ctaUrl')}</span>
                  <BaseInput
                    value={drafts.banner.ctaUrl}
                    onChange={(event) => updateDraft({ ctaUrl: event.target.value })}
                    placeholder={t('admin.content.banner.ctaUrlPlaceholder')}
                  />
                </label>
              </div>
              <div className="admin-form-grid two-columns">
                <label>
                  <span>{t('admin.content.banner.bgColor')}</span>
                  <div className="content-color-input">
                    <BaseInput
                      type="color"
                      value={drafts.banner.backgroundColor}
                      onChange={(event) => updateDraft({ backgroundColor: event.target.value })}
                    />
                    <BaseInput
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
                  <span>{t('admin.content.banner.textColor')}</span>
                  <div className="content-color-input">
                    <BaseInput
                      type="color"
                      value={drafts.banner.textColor}
                      onChange={(event) => updateDraft({ textColor: event.target.value })}
                    />
                    <BaseInput
                      value={drafts.banner.textColor}
                      onChange={(event) => updateDraft({
                        textColor: normalizeHexColor(event.target.value, drafts.banner.textColor),
                      })}
                    />
                  </div>
                </label>
              </div>
              <label className="admin-check-row">
                <BaseInput
                  type="checkbox"
                  checked={drafts.banner.countdownEnabled}
                  onChange={(value) => updateDraft({ countdownEnabled: value })}
                />
                <span>{t('admin.content.banner.countdown')}</span>
              </label>
              {drafts.banner.countdownEnabled && (
                <label>
                  <span>{t('admin.content.banner.endTime')}</span>
                  <BaseInput
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
                <span>{t('admin.content.banner.preview')}</span>
                <PromoBanner config={{ ...drafts.banner, enabled: true }} />
              </div>
            </div>
          )}

          {activeSection === 'faq' && (
            <div className="admin-form compact">
              <div className="admin-form-grid two-columns">
                <label>
                  <span>{t('admin.content.faq.eyebrow')}</span>
                  <BaseInput
                    value={drafts.faq.eyebrow}
                    onChange={(event) => updateDraft({ eyebrow: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t('admin.content.faq.faqTitle')}</span>
                  <BaseInput
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
                      <strong>{t('admin.content.faq.questionItem', { number: index + 1 })}</strong>
                      <button
                        type="button"
                        className="admin-danger-button slim"
                        onClick={() => removeFaqItem(item.id)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        <span>{t('admin.content.faq.delete')}</span>
                      </button>
                    </div>
                    <label>
                      <span>{t('admin.content.faq.questionLabel')}</span>
                      <BaseInput
                        value={item.question}
                        onChange={(event) => updateFaqItem(item.id, { question: event.target.value })}
                        required
                      />
                    </label>
                    <div className="admin-form-group">
                      <span>{t('admin.content.faq.answerLabel')}</span>
                      <RichEditor value={item.answer} onChange={(value) => updateFaqItem(item.id, { answer: value })} minHeight={120} />
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" className="admin-icon-button" onClick={addFaqItem}>
                <Plus size={16} aria-hidden="true" />
                <span>{t('admin.content.faq.addQuestion')}</span>
              </button>
            </div>
          )}

          {activeSection === 'brand' && (
            <div className="admin-form compact">
              <div className="admin-form-grid two-columns">
                <label>
                  <span>{t('admin.content.brand.brandName')}</span>
                  <BaseInput
                    value={drafts.brand.name}
                    onChange={(val) => updateDraft({ name: typeof val === 'object' && val?.target ? val.target.value : val })}
                    required
                  />
                </label>
                <label>
                  <span>{t('admin.content.brand.tagline')}</span>
                  <BaseInput
                    value={drafts.brand.tagline}
                    onChange={(val) => updateDraft({ tagline: typeof val === 'object' && val?.target ? val.target.value : val })}
                  />
                </label>
              </div>

              {/* Khối Logo Website & Tab trình duyệt (Gộp chung làm 1) */}
              <div className="admin-brand-media-card unified-logo-card">
                <div className="admin-brand-media-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>{t('admin.content.brand.logoTitle', { defaultValue: 'Logo Website & Tab trình duyệt' })}</strong>
                      <span className="admin-badge-highlight">Dùng chung cho Website & Icon Tab</span>
                    </div>
                    <p>{t('admin.content.brand.logoUnifiedDesc', { defaultValue: 'Chỉ cần tải ảnh 1 lần: tự động áp dụng cho Logo trên thanh menu, Header và biểu tượng trên Tab trình duyệt.' })}</p>
                  </div>
                </div>
                <div className="admin-brand-media-body">
                  <div className="admin-brand-media-inputs">
                    <label>
                      <span>{t('admin.content.brand.logoUrl', { defaultValue: 'URL Logo' })}</span>
                      <BaseInput
                        value={drafts.brand.logoUrl || ''}
                        onChange={(val) => {
                          const url = typeof val === 'object' && val?.target ? val.target.value : val
                          updateDraft({ logoUrl: url, faviconUrl: url })
                        }}
                        placeholder="https://.../logo.png"
                      />
                    </label>
                    <div className="admin-brand-upload-row">
                      <label className="admin-file-picker-btn">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon"
                          disabled={uploadingLogo || submitting}
                          onChange={(e) => uploadLogo(e.target.files?.[0])}
                        />
                        <span>{uploadingLogo ? 'Đang tải logo...' : 'Tải logo từ máy tính'}</span>
                      </label>
                      {drafts.brand.logoUrl && (
                        <button
                          type="button"
                          className="admin-icon-button slim danger"
                          onClick={() => updateDraft({ logoUrl: '', faviconUrl: '' })}
                          title="Xóa logo"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="admin-brand-previews-row">
                    <div className="admin-brand-preview-box">
                      <span className="preview-label">Trên Website</span>
                      <div className="brand-preview-frame logo-frame">
                        {drafts.brand.logoUrl ? (
                          <img src={drafts.brand.logoUrl} alt={t('admin.content.brand.logoPreview')} />
                        ) : (
                          <span className="preview-empty">Chưa có</span>
                        )}
                      </div>
                    </div>
                    <div className="admin-brand-preview-box">
                      <span className="preview-label">Trên Tab trình duyệt</span>
                      <div className="browser-tab-mockup">
                        <img
                          src={drafts.brand.logoUrl || drafts.brand.faviconUrl || '/favicon.svg'}
                          alt="Tab Icon"
                          className="browser-tab-icon"
                        />
                        <span className="browser-tab-title">{drafts.brand.name || 'Kendy Digital'}</span>
                        <span className="browser-tab-close" aria-hidden="true">✕</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <span>{t('admin.content.brand.footerDesc')}</span>
                <RichEditor value={drafts.brand.description} onChange={(value) => updateDraft({ description: value })} minHeight={120} />
              </div>
              <div className="admin-form-grid two-columns">
                <label>
                  <span>{t('admin.content.brand.contactEmail')}</span>
                  <BaseInput
                    type="email"
                    value={drafts.brand.email}
                    onChange={(event) => updateDraft({ email: event.target.value })}
                  />
                </label>
                <label>
                  <span>{t('admin.content.brand.phone')}</span>
                  <BaseInput
                    value={drafts.brand.phone}
                    onChange={(event) => updateDraft({ phone: event.target.value })}
                  />
                </label>
              </div>
              <label>
                <span>{t('admin.content.brand.address')}</span>
                <BaseInput
                  value={drafts.brand.address}
                  onChange={(event) => updateDraft({ address: event.target.value })}
                />
              </label>
              <label>
                <span>{t('admin.content.brand.copyright')}</span>
                <BaseInput
                  value={drafts.brand.copyright}
                  onChange={(event) => updateDraft({ copyright: event.target.value })}
                />
              </label>

              <div className="content-repeat-list">
                <div className="content-repeat-title">
                  <strong>{t('admin.content.brand.socialLinks')}</strong>
                  <button type="button" className="admin-icon-button slim" onClick={addSocial}>
                    <Plus size={14} aria-hidden="true" />
                    <span>{t('admin.content.brand.addLink')}</span>
                  </button>
                </div>
                {drafts.brand.socials.map((item) => (
                  <article key={item.id} className="content-social-row">
                    <label>
                      <span>{t('admin.content.brand.channelName')}</span>
                      <BaseInput
                        value={item.label}
                        onChange={(event) => updateSocial(item.id, { label: event.target.value })}
                        placeholder={t('admin.content.brand.channelNamePlaceholder')}
                      />
                    </label>
                    <label>
                      <span>{t('admin.content.brand.url')}</span>
                      <BaseInput
                        value={item.url}
                        onChange={(event) => updateSocial(item.id, { url: event.target.value })}
                        placeholder={t('admin.content.brand.urlPlaceholder')}
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-danger-button slim"
                      onClick={() => removeSocial(item.id)}
                      aria-label={t('admin.content.brand.deleteAria', { label: item.label || 'social link' })}
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
                ['primaryColor', 'admin.content.theme.primary'],
                ['primaryHoverColor', 'admin.content.theme.hover'],
                ['accentColor', 'admin.content.theme.accent'],
              ].map(([key, tKey]) => (
                <label key={key}>
                  <span>{t(tKey)}</span>
                  <div className="content-color-input">
                    <BaseInput
                      type="color"
                      value={drafts.theme[key]}
                      onChange={(event) => updateDraft({ [key]: event.target.value })}
                    />
                    <BaseInput
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
                <span>{t('admin.content.theme.preview')}</span>
                <div>
                  <button type="button">{t('admin.content.theme.primaryBtn')}</button>
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
              token={token}
              onSetError={onSetError}
              onSetNotice={onSetNotice}
            />
          )}

          <div className="content-settings-save">
            <button type="submit" disabled={submitting || loading}>
              <Save size={17} aria-hidden="true" />
              <span>{submitting ? t('admin.content.saving') : t('admin.content.saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default AdminContentView
