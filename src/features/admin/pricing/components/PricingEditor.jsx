import { Save } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ctaTypes, stockStatuses } from '../../services/services.constants'
import RichEditor from '../../../../components/RichEditor/RichEditor'
import BaseInput from '../../../../components/ui/BaseInput'
import BaseSelect from '../../../../components/ui/BaseSelect'

function PricingEditor({
  form,
  onSubmit,
  onUpdateForm,
  selectedItem,
  submitting,
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('basic') // 'basic' | 'content'

  if (!selectedItem) {
    return (
      <form className="admin-form pricing-editor" onSubmit={(e) => e.preventDefault()}>
        <div className="admin-panel-head">
          <h3>{t('admin.pricing.form.selectService')}</h3>
        </div>
        <p className="admin-empty-state">{t('admin.pricing.form.empty')}</p>
      </form>
    )
  }

  return (
    <form className="admin-form pricing-editor" onSubmit={onSubmit}>
      <div className="admin-panel-head" style={{ marginBottom: '10px' }}>
        <div>
          <h3>{selectedItem.name}</h3>
          <span style={{ fontSize: '13px', color: 'var(--kd-muted)' }}>Mã gói: #{selectedItem.id}</span>
        </div>
        <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '32px', minHeight: '32px', padding: '0 12px' }}>
          <Save size={17} strokeWidth={2} aria-hidden="true" />
          <span>{t('admin.pricing.form.save')}</span>
        </button>
      </div>

      {/* Internal Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '16px', display: 'flex', gap: '6px', borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={activeTab === 'basic' ? 'active' : ''}
          onClick={() => setActiveTab('basic')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Giá & Cấu hình
        </button>
        <button
          type="button"
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          {t('admin.pricing.form.termsHeading')}
        </button>
      </div>

      <div className="service-editor-sections">
        {activeTab === 'basic' && (
          <section className="service-editor-section" style={{ border: 'none', background: 'transparent', padding: 0, display: 'grid', gap: '12px' }}>
            <div className="admin-form-grid single">
              <label>
                <span>Giá số</span>
                <BaseInput value={form.price} onChange={(value) => onUpdateForm('price', value)} inputMode="decimal" />
              </label>
              <label>
                <span>Giá hiển thị text</span>
                <BaseInput value={form.priceText} onChange={(value) => onUpdateForm('priceText', value)} placeholder={t('admin.pricing.form.pricePlaceholder')} />
              </label>
              <label>
                <span>Badge nổi bật ở bảng giá</span>
                <BaseInput value={form.pricingBadge} onChange={(value) => onUpdateForm('pricingBadge', value)} placeholder={t('admin.pricing.form.badgePlaceholder')} />
              </label>
              <label>
                <span>Trạng thái kho</span>
                <BaseSelect value={form.stockStatus} onChange={(value) => onUpdateForm('stockStatus', value)}>
                  {stockStatuses.map((status) => ({ value: status, label: status }))}
                </BaseSelect>
              </label>
              <label>
                <span>CTA mua hàng</span>
                <BaseSelect value={form.ctaType} onChange={(value) => onUpdateForm('ctaType', value)}>
                  {ctaTypes.map((type) => ({ value: type, label: type }))}
                </BaseSelect>
              </label>
              <label>
                <span>Thời gian xử lý</span>
                <BaseInput value={form.processingTime} onChange={(value) => onUpdateForm('processingTime', value)} placeholder={t('admin.pricing.form.processingPlaceholder')} />
              </label>
              <div className="admin-form-group">
                <span>Chính sách bảo hành</span>
                <RichEditor value={form.warrantyPolicy} onChange={(value) => onUpdateForm('warrantyPolicy', value)} minHeight={120} />
              </div>
            </div>

            <div className="admin-check-row" style={{ marginTop: '8px' }}>
              <label style={{ cursor: 'pointer' }}>
                <BaseInput type="checkbox" checked={form.featured} onChange={(value) => onUpdateForm('featured', value)} />
                <span>Gói nổi bật</span>
              </label>
              <label style={{ cursor: 'pointer' }}>
                <BaseInput type="checkbox" checked={form.publicVisible} onChange={(value) => onUpdateForm('publicVisible', value)} />
                <span>Hiển thị bảng giá</span>
              </label>
            </div>
          </section>
        )}

        {activeTab === 'content' && (
          <section className="service-editor-section" style={{ border: 'none', background: 'transparent', padding: 0, display: 'grid', gap: '12px' }}>
            <div className="admin-form-grid single">
              <div className="admin-form-group">
                <span>Điều kiện chuẩn bị / Cần có</span>
                <RichEditor value={form.requirements} onChange={(value) => onUpdateForm('requirements', value)} minHeight={150} />
              </div>
              <div className="admin-form-group">
                <span>{t('admin.pricing.form.usageNotesHeading')}</span>
                <RichEditor value={form.usageNotes} onChange={(value) => onUpdateForm('usageNotes', value)} minHeight={150} />
              </div>
            </div>
          </section>
        )}
      </div>
    </form>
  )
}

export default PricingEditor
