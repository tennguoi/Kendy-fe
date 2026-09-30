import { Plus, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import RichEditor from '../../../../components/RichEditor/RichEditor'
import BaseInput from '../../../../components/ui/BaseInput'
import BaseSelect from '../../../../components/ui/BaseSelect'
import BaseTextarea from '../../../../components/ui/BaseTextarea'

function CategoryEditor({
  categories = [],
  categoryForm,
  onCategoryFormChange,
  onDeleteCategory,
  onSubmitCategory,
  selectedCategoryId,
  submitting,
  onClose,
}) {
  const { t } = useTranslation()
  return (
    <form className="admin-form service-editor admin-service-editor" onSubmit={onSubmitCategory}>
      <div
        className="admin-panel-head"
        style={{
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h3 style={{ whiteSpace: 'nowrap', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{selectedCategoryId ? t('admin.services.categoryEditor.editTitle') : t('admin.services.categoryEditor.createTitle')}</h3>
          <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '280px', whiteSpace: 'nowrap' }}>
            {categoryForm.name || t('admin.services.categoryEditor.namePlaceholder')}
          </span>
        </div>
        <div className="service-editor-actions" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            className="admin-danger-button slim"
            disabled={!selectedCategoryId || submitting}
            onClick={onDeleteCategory}
          >
            <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
            <span>{t('admin.common.delete')}</span>
          </button>
          <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '32px', minHeight: '32px', padding: '0 12px' }}>
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            <span>{t('admin.common.save')}</span>
          </button>
          {onClose && (
            <button
              type="button"
              className="admin-close-button"
              onClick={onClose}
              style={{
                height: '32px',
                minHeight: '32px',
                width: '32px',
                padding: 0,
                display: 'grid',
                placeItems: 'center',
                background: '#edf2f7',
                border: 0,
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--kd-muted)'
              }}
              title={t('admin.common.close')}
            >
              <X size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="service-editor-sections">
        <section className="service-editor-section">
          <div className="service-section-title">
            <h4>{t('admin.services.categoryEditor.section.basic')}</h4>
            <span>{t('admin.services.categoryEditor.section.basicDesc')}</span>
          </div>
          <div className="admin-form-grid service-form-grid">
            <label className="wide">
              <span>{t('admin.services.categoryEditor.field.name')}</span>
              <BaseInput
                value={categoryForm.name}
                onChange={(value) => onCategoryFormChange('name', value)}
                required
              />
            </label>
            <label className="wide">
              <span>{t('admin.services.categoryEditor.field.slug')}</span>
              <BaseInput
                value={categoryForm.slug}
                onChange={(value) => onCategoryFormChange('slug', value)}
                required
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.parent')}</span>
              <BaseSelect
                value={categoryForm.parentId}
                onChange={(value) => onCategoryFormChange('parentId', value)}
                options={[
                  { value: '', label: t('admin.services.noParent') },
                  ...categories
                    .filter((cat) => cat.id !== selectedCategoryId)
                    .map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    })),
                ]}
                placeholder={t('admin.services.noParent')}
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.sortOrder')}</span>
              <BaseInput
                value={categoryForm.sortOrder}
                onChange={(value) => onCategoryFormChange('sortOrder', value)}
                inputMode="numeric"
              />
            </label>
          </div>
        </section>

        <section className="service-editor-section">
          <div className="service-section-title">
            <h4>{t('admin.services.categoryEditor.section.description')}</h4>
            <span>{t('admin.services.categoryEditor.section.descriptionDesc')}</span>
          </div>
          <div className="admin-form-grid service-form-grid">
            <div className="admin-form-group wide">
              <span>{t('admin.services.categoryEditor.field.description')}</span>
              <RichEditor value={categoryForm.description} onChange={(value) => onCategoryFormChange('description', value)} minHeight={150} />
            </div>
          </div>
        </section>

        <section className="service-editor-section">
          <div className="service-section-title">
            <h4>{t('admin.services.categoryEditor.section.extra')}</h4>
            <span>{t('admin.services.categoryEditor.section.extraDesc')}</span>
          </div>
          <div className="admin-form-grid service-form-grid">
            <label className="wide">
              <span>{t('admin.services.categoryEditor.field.microcopy')}</span>
              <BaseInput
                value={categoryForm.microcopy || ''}
                onChange={(value) => onCategoryFormChange('microcopy', value)}
                placeholder="Ví dụ: Phù hợp editor, TikToker và shop cần chỉnh video nhanh..."
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.priceFrom')}</span>
              <BaseInput
                value={categoryForm.priceFrom || ''}
                onChange={(value) => onCategoryFormChange('priceFrom', value)}
                placeholder="Ví dụ: Từ 89.000đ"
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.processingTime')}</span>
              <BaseInput
                value={categoryForm.processingTime || ''}
                onChange={(value) => onCategoryFormChange('processingTime', value)}
                placeholder="Ví dụ: 5-30 phút"
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.warranty')}</span>
              <BaseInput
                value={categoryForm.warranty || ''}
                onChange={(value) => onCategoryFormChange('warranty', value)}
                placeholder="Ví dụ: Hỗ trợ 7 ngày"
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.cta')}</span>
              <BaseInput
                value={categoryForm.cta || ''}
                onChange={(value) => onCategoryFormChange('cta', value)}
                placeholder="Ví dụ: Xem gói"
              />
            </label>
            <div className="admin-form-group wide">
              <span>{t('admin.services.categoryEditor.field.requirements')}</span>
              <BaseTextarea
                value={categoryForm.requirements || ''}
                onChange={(value) => onCategoryFormChange('requirements', value)}
                rows="3"
                placeholder="Nhập yêu cầu hoặc lưu ý..."
              />
            </div>
          </div>
        </section>
      </div>
    </form>
  )
}

export default CategoryEditor
