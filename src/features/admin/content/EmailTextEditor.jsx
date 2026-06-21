import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  EMAIL_TEMPLATE_DEFINITIONS,
  renderEmailPreview,
} from './emailTemplates'

function EmailTextEditor({
  activeSlug,
  brand,
  drafts,
  onActiveSlugChange,
  onChange,
}) {
  const { t } = useTranslation()
  const definition = EMAIL_TEMPLATE_DEFINITIONS.find((item) => item.slug === activeSlug)
  const draft = drafts[activeSlug]

  return (
    <div className="admin-form compact email-text-settings">
      <div className="email-template-tabs" aria-label={t('admin.content.email.tabsLabel')}>
        {EMAIL_TEMPLATE_DEFINITIONS.map((item) => (
          <button
            key={item.slug}
            type="button"
            className={item.slug === activeSlug ? 'active' : ''}
            onClick={() => onActiveSlugChange(item.slug)}
          >
            <Mail size={16} aria-hidden="true" />
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="admin-form-grid two-columns">
        <label>
          <span>{t('admin.content.email.subjectLabel')}</span>
          <input
            value={draft.subject}
            onChange={(event) => onChange({ subject: event.target.value })}
            required
          />
        </label>
        <label>
          <span>{t('admin.content.email.headingLabel')}</span>
          <input
            value={draft.heading}
            onChange={(event) => onChange({ heading: event.target.value })}
            required
          />
        </label>
      </div>

      <label>
        <span>{t('admin.content.email.introLabel')}</span>
        <textarea
          value={draft.intro}
          onChange={(event) => onChange({ intro: event.target.value })}
          rows={4}
          required
        />
      </label>

      {definition.type === 'link' ? (
        <label>
          <span>{t('admin.content.email.actionLabel')}</span>
          <input
            value={draft.actionLabel}
            onChange={(event) => onChange({ actionLabel: event.target.value })}
            required
          />
        </label>
      ) : (
        <label>
          <span>{t('admin.content.email.codeLabel')}</span>
          <input
            value={draft.codeLabel}
            onChange={(event) => onChange({ codeLabel: event.target.value })}
            required
          />
        </label>
      )}

      <label>
        <span>{t('admin.content.email.detailLabel')}</span>
        <input
          value={draft.detail}
          onChange={(event) => onChange({ detail: event.target.value })}
        />
        <small>{t('admin.content.email.detailHint')}</small>
      </label>

      <label>
        <span>{t('admin.content.email.securityNoteLabel')}</span>
        <textarea
          value={draft.securityNote}
          onChange={(event) => onChange({ securityNote: event.target.value })}
          rows={3}
        />
      </label>

      <label>
        <span>{t('admin.content.email.footerLabel')}</span>
        <textarea
          value={draft.footer}
          onChange={(event) => onChange({ footer: event.target.value })}
          rows={2}
        />
      </label>

      <div className="email-variable-note">
        <strong>{t('admin.content.email.allowedVariables')}</strong>
        <code>{'{{name}}'}</code>
        <code>{'{{email}}'}</code>
        {definition.type === 'link' && <code>{'{{link}}'}</code>}
        {definition.type === 'code' && <code>{'{{code}}'}</code>}
        <code>{'{{expiresAt}}'}</code>
      </div>

      <div className="content-preview-block">
        <span>{t('admin.content.email.previewLabel')}</span>
        <iframe
          className="email-fixed-preview"
          title={t('admin.content.email.previewTitle', { label: definition.label })}
          srcDoc={renderEmailPreview(definition, draft, brand)}
          sandbox=""
        />
      </div>
    </div>
  )
}

export default EmailTextEditor
