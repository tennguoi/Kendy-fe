import { Code2, Mail, PenLine } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  EMAIL_TEMPLATE_DEFINITIONS,
  renderEmailPreview,
  renderTransactionalEmail,
} from './emailTemplates'
import RichEditor from '../../../components/RichEditor/RichEditor'

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
  const [rawMode, setRawMode] = useState(false)
  const rawContent = draft.rawHtml || renderTransactionalEmail(definition, draft, brand)

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

      <div className="email-mode-toggle">
        <button
          type="button"
          className={!rawMode ? 'active' : ''}
          onClick={() => setRawMode(false)}
        >
          <PenLine size={15} aria-hidden="true" />
          {t('admin.content.email.formMode')}
        </button>
        <button
          type="button"
          className={rawMode ? 'active' : ''}
          onClick={() => {
            setRawMode(true)
            if (!draft.rawHtml) {
              onChange({ rawHtml: renderTransactionalEmail(definition, draft, brand) })
            }
          }}
        >
          <Code2 size={15} aria-hidden="true" />
          {t('admin.content.email.rawMode')}
        </button>
      </div>

      {rawMode ? (
        <label>
          <span>{t('admin.content.email.rawHtmlLabel')}</span>
          <textarea
            className="email-raw-textarea"
            value={rawContent}
            onChange={(event) => onChange({ rawHtml: event.target.value })}
            rows={24}
            spellCheck={false}
          />
          <small>{t('admin.content.email.rawHtmlHint')}</small>
        </label>
      ) : (
        <>
          <div className="admin-form-grid two-columns">
            <label>
              <span>{t('admin.content.email.subjectLabel')}</span>
              <input
                value={draft.subject}
                onChange={(event) => onChange({ subject: event.target.value, rawHtml: undefined })}
                required
              />
            </label>
            <label>
              <span>{t('admin.content.email.headingLabel')}</span>
              <input
                value={draft.heading}
                onChange={(event) => onChange({ heading: event.target.value, rawHtml: undefined })}
                required
              />
            </label>
          </div>

          <div className="admin-form-group">
            <span>{t('admin.content.email.introLabel')}</span>
            <RichEditor value={draft.intro} onChange={(value) => onChange({ intro: value, rawHtml: undefined })} minHeight={150} />
          </div>

          {definition.type === 'code' && (
            <label>
              <span>{t('admin.content.email.codeLabel')}</span>
              <input
                value={draft.codeLabel}
                onChange={(event) => onChange({ codeLabel: event.target.value, rawHtml: undefined })}
                required
              />
            </label>
          )}
          {(definition.type === 'link' || definition.slug === 'password_reset') && (
            <label>
              <span>{t('admin.content.email.actionLabel')}</span>
              <input
                value={draft.actionLabel}
                onChange={(event) => onChange({ actionLabel: event.target.value, rawHtml: undefined })}
                required
              />
            </label>
          )}

          <label>
            <span>{t('admin.content.email.detailLabel')}</span>
            <input
              value={draft.detail}
              onChange={(event) => onChange({ detail: event.target.value, rawHtml: undefined })}
            />
            <small>{t('admin.content.email.detailHint')}</small>
          </label>

          <div className="admin-form-group">
            <span>{t('admin.content.email.securityNoteLabel')}</span>
            <RichEditor value={draft.securityNote} onChange={(value) => onChange({ securityNote: value, rawHtml: undefined })} minHeight={120} />
          </div>

          <div className="admin-form-group">
            <span>{t('admin.content.email.footerLabel')}</span>
            <RichEditor value={draft.footer} onChange={(value) => onChange({ footer: value, rawHtml: undefined })} minHeight={100} />
          </div>
        </>
      )}

      <div className="email-variable-note">
        <strong>{t('admin.content.email.allowedVariables')}</strong>
        <code>{'{{name}}'}</code>
        <code>{'{{email}}'}</code>
        {(definition.type === 'link' || definition.slug === 'password_reset') && <code>{'{{link}}'}</code>}
        {(definition.type === 'code' || definition.slug === 'password_reset') && <code>{'{{code}}'}</code>}
        <code>{'{{brand}}'}</code>
        <code>{'{{expiresAt}}'}</code>
      </div>

      <div className="content-preview-block">
        <span>{t('admin.content.email.previewLabel')}</span>
        <iframe
          className="email-fixed-preview"
          title={t('admin.content.email.previewTitle', { label: definition.label })}
          srcDoc={rawMode ? rawContent : renderEmailPreview(definition, draft, brand)}
          sandbox=""
        />
      </div>
    </div>
  )
}

export default EmailTextEditor
