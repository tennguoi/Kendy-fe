import { Plus, Trash2, X } from 'lucide-react'

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
          <h3 style={{ whiteSpace: 'nowrap', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{selectedCategoryId ? 'Chi tiết danh mục' : 'Tạo danh mục mới'}</h3>
          <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '280px', whiteSpace: 'nowrap' }}>
            {categoryForm.name || 'Điền thông tin nhóm dịch vụ để lưu'}
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
            <span>Xóa</span>
          </button>
          <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '32px', minHeight: '32px', padding: '0 12px' }}>
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            <span>Lưu</span>
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
              title="Đóng"
            >
              <X size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="service-editor-sections">
        <section className="service-editor-section">
          <div className="service-section-title">
            <h4>Cơ bản</h4>
            <span>Tên, slug và thứ tự sắp xếp danh mục</span>
          </div>
          <div className="admin-form-grid service-form-grid">
            <label className="wide">
              <span>Tên nhóm</span>
              <input
                value={categoryForm.name}
                onChange={(event) => onCategoryFormChange('name', event.target.value)}
                required
              />
            </label>
            <label className="wide">
              <span>Slug</span>
              <input
                value={categoryForm.slug}
                onChange={(event) => onCategoryFormChange('slug', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Danh mục cha</span>
              <select
                value={categoryForm.parentId}
                onChange={(event) => onCategoryFormChange('parentId', event.target.value)}
              >
                <option value="">Không có</option>
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
              <span>Thứ tự</span>
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
            <h4>Mô tả</h4>
            <span>Mô tả chi tiết về nhóm dịch vụ này</span>
          </div>
          <div className="admin-form-grid service-form-grid">
            <label className="wide">
              <span>Nội dung mô tả</span>
              <textarea
                value={categoryForm.description}
                onChange={(event) => onCategoryFormChange('description', event.target.value)}
                rows="4"
              />
            </label>
          </div>
        </section>

        <section className="service-editor-section">
          <div className="service-section-title">
            <h4>Thông tin phụ (Dành cho trang chủ)</h4>
            <span>Chi tiết về giá, thời gian, bảo hành và CTA</span>
          </div>
          <div className="admin-form-grid service-form-grid">
            <label className="wide">
              <span>Mô tả ngắn bổ sung (Microcopy)</span>
              <input
                value={categoryForm.microcopy || ''}
                onChange={(event) => onCategoryFormChange('microcopy', event.target.value)}
                placeholder="Ví dụ: Phù hợp editor, TikToker và shop cần chỉnh video nhanh..."
              />
            </label>
            <label>
              <span>Giá từ</span>
              <input
                value={categoryForm.priceFrom || ''}
                onChange={(event) => onCategoryFormChange('priceFrom', event.target.value)}
                placeholder="Ví dụ: Từ 89.000đ"
              />
            </label>
            <label>
              <span>Thời gian xử lý</span>
              <input
                value={categoryForm.processingTime || ''}
                onChange={(event) => onCategoryFormChange('processingTime', event.target.value)}
                placeholder="Ví dụ: 5-30 phút"
              />
            </label>
            <label>
              <span>Bảo hành</span>
              <input
                value={categoryForm.warranty || ''}
                onChange={(event) => onCategoryFormChange('warranty', event.target.value)}
                placeholder="Ví dụ: Hỗ trợ 7 ngày"
              />
            </label>
            <label>
              <span>Nhãn nút bấm (CTA)</span>
              <input
                value={categoryForm.cta || ''}
                onChange={(event) => onCategoryFormChange('cta', event.target.value)}
                placeholder="Ví dụ: Xem gói"
              />
            </label>
            <label className="wide">
              <span>Yêu cầu cần chuẩn bị (Mỗi yêu cầu một dòng)</span>
              <textarea
                value={categoryForm.requirements || ''}
                onChange={(event) => onCategoryFormChange('requirements', event.target.value)}
                placeholder="Ví dụ:&#10;Email nhận gói&#10;Thiết bị đăng nhập ổn định"
                rows="3"
              />
            </label>
          </div>
        </section>
      </div>
    </form>
  )
}

export default CategoryEditor
