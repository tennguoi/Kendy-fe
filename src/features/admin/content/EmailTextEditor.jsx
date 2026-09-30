import { Code2, Mail, PenLine, Send } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  EMAIL_TEMPLATE_DEFINITIONS,
  renderEmailPreview,
  renderTransactionalEmail,
} from './emailTemplates'
import { adminContentApi } from '../../../api/admin/content.api'
import RichEditor from '../../../components/RichEditor/RichEditor'
import BaseInput from '../../../components/ui/BaseInput'
import { isRequired, composeValidators } from '../../../utils/validation'
import { resolveAdminError } from '../adminErrorResolver'


function EmailTextEditor({
  activeSlug,
  brand,
  drafts,
  onActiveSlugChange,
  onChange,
  token,
  onSetError,
  onSetNotice,
}) {
  const { t } = useTranslation()
  const definition = EMAIL_TEMPLATE_DEFINITIONS.find((item) => item.slug === activeSlug)
  const draft = drafts[activeSlug]
  const [rawMode, setRawMode] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const rawContent = draft.rawHtml || renderTransactionalEmail(definition, draft, brand)

  // Validation for email fields
  const validateRequired = composeValidators(isRequired)
  const validateEmail = composeValidators(isRequired) // Simple email validation - could be enhanced

  const handleSendTest = async () => {
    if (!testEmail.trim()) return

    // Validate email
    const emailValidation = validateEmail(testEmail.trim())
    if (!emailValidation.isValid) {
      onSetError(emailValidation.error || t('admin.content.email.invalidTestEmail'))
      return
    }

    setSending(true)
    try {
      await adminContentApi.sendTestEmail({
        slug: activeSlug,
        sendTo: testEmail.trim(),
      }, token)
      onSetNotice(t('admin.content.email.testSent', { email: testEmail.trim() }) || 'Email test đã gửi!')
      setTestEmail('')
    } catch (error) {
      onSetError(resolveAdminError(error, t('admin.content.email.testSendError', { defaultValue: 'Không thể gửi email test' })))
    } finally {
      setSending(false)
    }
  }

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
        <>
          <BaseTextarea
            label={t('admin.content.email.rawHtmlLabel')}
            value={rawContent}
            onChange={(value) => onChange({ rawHtml: value })}
            className="email-raw-textarea"
            rows={24}
            spellCheck={false}
          />
          <small>{t('admin.content.email.rawHtmlHint')}</small>
        </>
      ) : (
        <>
          <div className="admin-form-grid two-columns">
            <BaseInput
              label={t('admin.content.email.subjectLabel')}
              value={draft.subject}
              onChange={(value) => onChange({ subject: value, rawHtml: undefined })}
              validators={[validateRequired]}
              errorMessage={t('admin.content.email.subjectRequired', { defaultValue: 'Vui lòng nhập tiêu đề email' })}
              required
            />
            <BaseInput
              label={t('admin.content.email.headingLabel')}
              value={draft.heading}
              onChange={(value) => onChange({ heading: value, rawHtml: undefined })}
              validators={[validateRequired]}
              errorMessage={t('admin.content.email.headingRequired', { defaultValue: 'Vui lòng nhập tiêu đề Heading' })}
              required
            />
          </div>

          <div className="admin-form-group">
            <span>{t('admin.content.email.introLabel')}</span>
            <RichEditor value={draft.intro} onChange={(value) => onChange({ intro: value, rawHtml: undefined })} minHeight={150} />
          </div>

          {definition.type === 'code' && (
            <BaseInput
              label={t('admin.content.email.codeLabel')}
              value={draft.codeLabel}
              onChange={(value) => onChange({ codeLabel: value, rawHtml: undefined })}
              validators={[validateRequired]}
              errorMessage={t('admin.content.email.codeLabelRequired', { defaultValue: 'Vui lòng nhập nhãn mã' })}
              required
            />
          )}
          {(definition.type === 'link' || definition.slug === 'password_reset') && (
            <BaseInput
              label={t('admin.content.email.actionLabel')}
              value={draft.actionLabel}
              onChange={(value) => onChange({ actionLabel: value, rawHtml: undefined })}
              validators={[validateRequired]}
              errorMessage={t('admin.content.email.actionLabelRequired', { defaultValue: 'Vui lòng nhập nhãn hành động' })}
              required
            />
          )}

          <BaseInput
            label={t('admin.content.email.detailLabel')}
            value={draft.detail}
            onChange={(value) => onChange({ detail: value, rawHtml: undefined })}
          />
          <small>{t('admin.content.email.detailHint')}</small>

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

      <div className="email-test-section">
        <strong>{t('admin.content.email.testLabel') || 'Gửi email test'}</strong>
        <div className="email-test-row">
          <BaseInput
            type="email"
            value={testEmail}
            onChange={(value) => setTestEmail(value)}
            placeholder={t('admin.content.email.testPlaceholder') || 'Nhập email nhận test...'}
            validators={[validateRequired, validateEmail]}
            errorMessage={t('admin.content.email.testEmailRequired', { defaultValue: 'Vui lòng nhập email test' })}
            disabled={sending}
          />
          <button
            type="button"
            className="admin-icon-button"
            onClick={handleSendTest}
            disabled={sending || !testEmail.trim()}
          >
            <Send size={15} aria-hidden="true" />
            <span>{sending ? (t('admin.content.email.sending') || 'Đang gửi...') : (t('admin.content.email.sendTest') || 'Gửi test')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailTextEditor
