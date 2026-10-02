import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../../api/admin.api'
import { publicApi } from '../../../../api/public.api'
import BaseInput from '../../../../components/ui/BaseInput'
import { defaultSiteSettings, SITE_SETTING_SLUGS } from '../../../public/data/siteSettings'
import { resolveAdminError } from '../../adminErrorResolver'

function BrandTab({ onSetError, onSetNotice, token }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(() => ({ ...defaultSiteSettings.brand }))
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  const loadBrand = useCallback(async () => {
    setLoading(true)
    try {
      const items = await publicApi.getAllSiteSections()
      const brandItem = Array.isArray(items)
        ? items.find((item) => item.slug === SITE_SETTING_SLUGS.brand)
        : null
      if (brandItem) {
        setRecord(brandItem)
        try {
          const parsed = JSON.parse(brandItem.content)
          if (parsed && typeof parsed === 'object') {
            setDraft((curr) => ({ ...curr, ...parsed }))
          }
        } catch {
          // ignore json parse error
        }
      }
    } catch (err) {
      onSetError?.(resolveAdminError(err, t('admin.settings.brand.loadError', { defaultValue: 'Không thể tải cấu hình thương hiệu.' })))
    } finally {
      setLoading(false)
    }
  }, [onSetError])

  useEffect(() => {
    loadBrand()
  }, [loadBrand])

  const updateField = (patch) => {
    setDraft((curr) => ({ ...curr, ...patch }))
  }

  const uploadLogo = async (file) => {
    if (!file) return
    setUploadingLogo(true)
    onSetError?.('')
    try {
      const uploaded = await adminApi.uploadServiceImage(file, token)
      setDraft((curr) => ({ ...curr, logoUrl: uploaded.url }))
      onSetNotice?.(t('admin.settings.brand.logoUploaded', { defaultValue: 'Đã tải logo lên. Nhấn “Lưu thay đổi” để áp dụng.' }))
    } catch (err) {
      onSetError?.(resolveAdminError(err, t('admin.settings.brand.logoUploadError', { defaultValue: 'Không thể tải logo lên.' })))
    } finally {
      setUploadingLogo(false)
    }
  }

  const uploadFavicon = async (file) => {
    if (!file) return
    setUploadingFavicon(true)
    onSetError?.('')
    try {
      const uploaded = await adminApi.uploadServiceImage(file, token)
      setDraft((curr) => ({ ...curr, faviconUrl: uploaded.url }))
      onSetNotice?.(t('admin.settings.brand.faviconUploaded', { defaultValue: 'Đã tải favicon lên. Nhấn “Lưu thay đổi” để áp dụng.' }))
    } catch (err) {
      onSetError?.(resolveAdminError(err, t('admin.settings.brand.faviconUploadError', { defaultValue: 'Không thể tải favicon lên.' })))
    } finally {
      setUploadingFavicon(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    onSetError?.('')
    try {
      const slug = SITE_SETTING_SLUGS.brand
      const payload = {
        type: 'SITE_SECTION',
        slug,
        title: 'Thương hiệu và liên hệ',
        summary: null,
        content: JSON.stringify(draft),
        imageUrl: null,
        ctaUrl: null,
        seoTitle: null,
        seoDescription: null,
        published: true,
        sortOrder: 0,
        version: record?.version,
      }

      const saved = record?.id
        ? await adminApi.updateContent(record.id, payload, token)
        : await adminApi.createContent(payload, token)

      setRecord(saved)
      window.dispatchEvent(new CustomEvent('kd-site-settings-updated'))
      onSetNotice?.(t('admin.settings.brand.saveSuccess', { defaultValue: 'Đã lưu cấu hình Logo & Thương hiệu thành công.' }))
    } catch (err) {
      onSetError?.(resolveAdminError(err, t('admin.settings.brand.saveError', { defaultValue: 'Không thể lưu cấu hình.' })))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="admin-empty-state">Đang tải cấu hình thương hiệu...</div>
  }

  return (
    <div className="settings-tab-content">
      <form className="admin-form compact" onSubmit={handleSave}>
        <div className="admin-form-grid two-columns">
          <label>
            <span>{t('admin.content.brand.brandName', { defaultValue: 'Tên thương hiệu' })}</span>
            <BaseInput
              value={draft.name || ''}
              onChange={(val) => updateField({ name: typeof val === 'object' && val?.target ? val.target.value : val })}
              placeholder="Kendy Digital"
              required
            />
          </label>
          <label>
            <span>{t('admin.content.brand.tagline', { defaultValue: 'Tagline' })}</span>
            <BaseInput
              value={draft.tagline || ''}
              onChange={(val) => updateField({ tagline: typeof val === 'object' && val?.target ? val.target.value : val })}
              placeholder="Tài khoản, nâng cấp & quảng cáo"
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
                  value={draft.logoUrl || ''}
                  onChange={(val) => {
                    const url = typeof val === 'object' && val?.target ? val.target.value : val
                    updateField({ logoUrl: url, faviconUrl: url })
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
                {draft.logoUrl && (
                  <button
                    type="button"
                    className="admin-icon-button slim danger"
                    onClick={() => updateField({ logoUrl: '', faviconUrl: '' })}
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
                  {draft.logoUrl ? (
                    <img src={draft.logoUrl} alt="Logo preview" />
                  ) : (
                    <span className="preview-empty">Chưa có</span>
                  )}
                </div>
              </div>
              <div className="admin-brand-preview-box">
                <span className="preview-label">Trên Tab trình duyệt</span>
                <div className="browser-tab-mockup">
                  <img
                    src={draft.logoUrl || draft.faviconUrl || '/favicon.svg'}
                    alt="Tab Icon"
                    className="browser-tab-icon"
                  />
                  <span className="browser-tab-title">{draft.name || 'Kendy Digital'}</span>
                  <span className="browser-tab-close" aria-hidden="true">✕</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BrandTab
