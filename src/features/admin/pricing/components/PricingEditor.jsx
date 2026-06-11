import { Save } from 'lucide-react'
import { ctaTypes, stockStatuses } from '../../services/services.constants'

function PricingEditor({
  form,
  onSubmit,
  onUpdateForm,
  selectedItem,
  submitting,
}) {
  return (
    <form className="admin-form pricing-editor" onSubmit={onSubmit}>
      <div className="admin-panel-head">
        <h3>{selectedItem ? selectedItem.name : 'Chọn gói dịch vụ'}</h3>
        <button type="submit" disabled={!selectedItem || submitting}>
          <Save size={17} strokeWidth={2} aria-hidden="true" />
          <span>Lưu bảng giá</span>
        </button>
      </div>

      <div className="admin-form-grid single">
        <label>
          <span>Giá số</span>
          <input value={form.price} onChange={(event) => onUpdateForm('price', event.target.value)} inputMode="decimal" />
        </label>
        <label>
          <span>Giá hiển thị</span>
          <input value={form.priceText} onChange={(event) => onUpdateForm('priceText', event.target.value)} placeholder="Từ 390.000đ" />
        </label>
        <label>
          <span>Badge</span>
          <input value={form.pricingBadge} onChange={(event) => onUpdateForm('pricingBadge', event.target.value)} />
        </label>
        <label>
          <span>Tình trạng</span>
          <select value={form.stockStatus} onChange={(event) => onUpdateForm('stockStatus', event.target.value)}>
            {stockStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>CTA</span>
          <select value={form.ctaType} onChange={(event) => onUpdateForm('ctaType', event.target.value)}>
            {ctaTypes.map((type) => <option value={type} key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          <span>Thời gian xử lý</span>
          <input value={form.processingTime} onChange={(event) => onUpdateForm('processingTime', event.target.value)} />
        </label>
        <label>
          <span>Bảo hành</span>
          <textarea value={form.warrantyPolicy} onChange={(event) => onUpdateForm('warrantyPolicy', event.target.value)} rows="3" />
        </label>
        <label>
          <span>Điều kiện sử dụng</span>
          <textarea value={form.requirements} onChange={(event) => onUpdateForm('requirements', event.target.value)} rows="4" />
        </label>
        <label>
          <span>Lưu ý public</span>
          <textarea value={form.usageNotes} onChange={(event) => onUpdateForm('usageNotes', event.target.value)} rows="4" />
        </label>
      </div>

      <div className="admin-check-row">
        <label>
          <input checked={form.featured} onChange={(event) => onUpdateForm('featured', event.target.checked)} type="checkbox" />
          <span>Gói nổi bật</span>
        </label>
        <label>
          <input checked={form.publicVisible} onChange={(event) => onUpdateForm('publicVisible', event.target.checked)} type="checkbox" />
          <span>Hiển thị public</span>
        </label>
      </div>
    </form>
  )
}

export default PricingEditor
