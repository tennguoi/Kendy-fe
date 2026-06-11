import { Plus, Trash2 } from 'lucide-react'

function CategoryPanel({
  categories = [],
  categoryForm,
  onCategoryFormChange,
  onDeleteCategory,
  onSelectCategory,
  onStartCreateCategory,
  onSubmitCategory,
  selectedCategoryId,
  submitting,
}) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Danh mục</h3>
        <span>{categories.length} nhóm</span>
      </div>
      <div className="admin-category-list">
        {categories.map((category) => (
          <article className={selectedCategoryId === category.id ? 'selected' : ''} key={category.id} onClick={() => onSelectCategory(category)}>
            <strong>{category.name}</strong>
            <span>/{category.slug}</span>
          </article>
        ))}
      </div>

      <form className="admin-form compact" onSubmit={onSubmitCategory}>
        <div className="admin-panel-head compact-head">
          <h3>{selectedCategoryId ? 'Sửa nhóm' : 'Thêm nhóm'}</h3>
          <button type="button" onClick={onStartCreateCategory}>Mới</button>
        </div>
        <label>
          <span>Tên nhóm</span>
          <input value={categoryForm.name} onChange={(event) => onCategoryFormChange('name', event.target.value)} required />
        </label>
        <label>
          <span>Slug</span>
          <input value={categoryForm.slug} onChange={(event) => onCategoryFormChange('slug', event.target.value)} required />
        </label>
        <label>
          <span>Thứ tự</span>
          <input value={categoryForm.sortOrder} onChange={(event) => onCategoryFormChange('sortOrder', event.target.value)} inputMode="numeric" />
        </label>
        <label>
          <span>Mô tả</span>
          <textarea value={categoryForm.description} onChange={(event) => onCategoryFormChange('description', event.target.value)} rows="3" />
        </label>
        <button type="submit" className="admin-primary-button" disabled={submitting}>
          <Plus size={17} strokeWidth={2} aria-hidden="true" />
          <span>{selectedCategoryId ? 'Lưu nhóm' : 'Thêm nhóm'}</span>
        </button>
        <button type="button" className="admin-danger-button" disabled={!selectedCategoryId || submitting} onClick={onDeleteCategory}>
          <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
          <span>Xóa nhóm</span>
        </button>
      </form>
    </div>
  )
}

export default CategoryPanel
