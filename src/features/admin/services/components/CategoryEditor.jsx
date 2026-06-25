import { Plus, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import RichEditor from '../../../../components/RichEditor/RichEditor'

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
              <input
                value={categoryForm.name}
                onChange={(event) => onCategoryFormChange('name', event.target.value)}
                required
              />
            </label>
            <label className="wide">
              <span>{t('admin.services.categoryEditor.field.slug')}</span>
              <input
                value={categoryForm.slug}
                onChange={(event) => onCategoryFormChange('slug', event.target.value)}
                required
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.parent')}</span>
              <select
                value={categoryForm.parentId}
                onChange={(event) => onCategoryFormChange('parentId', event.target.value)}
              >
                <option value="">{t('admin.services.noParent')}</option>
                {categories
                  .filter((cat) => cat.id !== selectedCategoryId)
                  .map((cat) => (
                    <option value={cat.id} key={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.sortOrder')}</span>
              <input
                value={categoryForm.sortOrder}
                onChange={(event) => onCategoryFormChange('sortOrder', event.target.value)}
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
              <input
                value={categoryForm.microcopy || ''}
                onChange={(event) => onCategoryFormChange('microcopy', event.target.value)}
                placeholder="Ví dụ: Phù hợp editor, TikToker và shop cần chỉnh video nhanh..."
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.priceFrom')}</span>
              <input
                value={categoryForm.priceFrom || ''}
                onChange={(event) => onCategoryFormChange('priceFrom', event.target.value)}
                placeholder="Ví dụ: Từ 89.000đ"
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.processingTime')}</span>
              <input
                value={categoryForm.processingTime || ''}
                onChange={(event) => onCategoryFormChange('processingTime', event.target.value)}
                placeholder="Ví dụ: 5-30 phút"
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.warranty')}</span>
              <input
                value={categoryForm.warranty || ''}
                onChange={(event) => onCategoryFormChange('warranty', event.target.value)}
                placeholder="Ví dụ: Hỗ trợ 7 ngày"
              />
            </label>
            <label>
              <span>{t('admin.services.categoryEditor.field.cta')}</span>
              <input
                value={categoryForm.cta || ''}
                onChange={(event) => onCategoryFormChange('cta', event.target.value)}
                placeholder="Ví dụ: Xem gói"
              />
            </label>
            <div className="admin-form-group wide">
              <span>{t('admin.services.categoryEditor.field.requirements')}</span>
              <RichEditor value={categoryForm.requirements || ''} onChange={(value) => onCategoryFormChange('requirements', value)} minHeight={120} />
            </div>
          </div>
        </section>
      </div>
    </form>
  )
}

export default CategoryEditor
