import { Save } from 'lucide-react'
import { useState } from 'react'
import { ctaTypes, stockStatuses } from '../../services/services.constants'

function PricingEditor({
  form,
  onSubmit,
  onUpdateForm,
  selectedItem,
  submitting,
}) {
  const [activeTab, setActiveTab] = useState('basic') // 'basic' | 'content'

  if (!selectedItem) {
    return (
      <form className="admin-form pricing-editor" onSubmit={(e) => e.preventDefault()}>
        <div className="admin-panel-head">
          <h3>Chọn gói dịch vụ</h3>
        </div>
        <p className="admin-empty-state">Chọn một gói dịch vụ từ danh sách bên trái để chỉnh sửa bảng giá.</p>
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
          <span>Lưu</span>
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
          Điều khoản & Lưu ý
        </button>
      </div>

      <div className="service-editor-sections">
        {activeTab === 'basic' && (
          <section className="service-editor-section" style={{ border: 'none', background: 'transparent', padding: 0, display: 'grid', gap: '12px' }}>
            <div className="admin-form-grid single">
              <label>
                <span>Giá số</span>
                <input value={form.price} onChange={(event) => onUpdateForm('price', event.target.value)} inputMode="decimal" />
              </label>
              <label>
                <span>Giá hiển thị text</span>
                <input value={form.priceText} onChange={(event) => onUpdateForm('priceText', event.target.value)} placeholder="Từ 390.000đ" />
              </label>
              <label>
                <span>Badge nổi bật ở bảng giá</span>
                <input value={form.pricingBadge} onChange={(event) => onUpdateForm('pricingBadge', event.target.value)} placeholder="Bán chạy, Giá tốt..." />
              </label>
              <label>
                <span>Trạng thái kho</span>
                <select value={form.stockStatus} onChange={(event) => onUpdateForm('stockStatus', event.target.value)}>
                  {stockStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
                </select>
              </label>
              <label>
                <span>CTA mua hàng</span>
                <select value={form.ctaType} onChange={(event) => onUpdateForm('ctaType', event.target.value)}>
                  {ctaTypes.map((type) => <option value={type} key={type}>{type}</option>)}
                </select>
              </label>
              <label>
                <span>Thời gian xử lý</span>
                <input value={form.processingTime} onChange={(event) => onUpdateForm('processingTime', event.target.value)} placeholder="Trong 24h" />
              </label>
              <label>
                <span>Chính sách bảo hành</span>
                <textarea value={form.warrantyPolicy} onChange={(event) => onUpdateForm('warrantyPolicy', event.target.value)} rows="3" placeholder="Bảo hành 1 đổi 1..." />
              </label>
            </div>

            <div className="admin-check-row" style={{ marginTop: '8px' }}>
              <label style={{ cursor: 'pointer' }}>
                <input checked={form.featured} onChange={(event) => onUpdateForm('featured', event.target.checked)} type="checkbox" />
                <span>Gói nổi bật</span>
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input checked={form.publicVisible} onChange={(event) => onUpdateForm('publicVisible', event.target.checked)} type="checkbox" />
                <span>Hiển thị bảng giá</span>
              </label>
            </div>
          </section>
        )}

        {activeTab === 'content' && (
          <section className="service-editor-section" style={{ border: 'none', background: 'transparent', padding: 0, display: 'grid', gap: '12px' }}>
            <div className="admin-form-grid single">
              <label>
                <span>Điều kiện chuẩn bị / Cần có</span>
                <textarea value={form.requirements} onChange={(event) => onUpdateForm('requirements', event.target.value)} rows="4" placeholder="Chuẩn bị link trang cá nhân, bật chế độ công khai..." />
              </label>
              <label>
                <span>Lưu ý khi sử dụng dịch vụ</span>
                <textarea value={form.usageNotes} onChange={(event) => onUpdateForm('usageNotes', event.target.value)} rows="4" placeholder="Không đổi tên trong quá trình chạy..." />
              </label>
            </div>
          </section>
        )}
      </div>
    </form>
  )
}

export default PricingEditor
