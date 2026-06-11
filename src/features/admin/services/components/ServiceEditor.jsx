import { Save, Trash2 } from 'lucide-react'
import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { ctaTypes, facebookSchema, serviceStatuses, serviceTypes, stockStatuses } from '../services.constants'

function ServiceEditor({
  categories = [],
  onDeleteService,
  onSubmitService,
  onUpdateServiceForm,
  selectedServiceCategories = [],
  selectedServiceId,
  serviceForm,
  serviceOrders = [],
  submitting,
}) {
  return (
    <form className="admin-form service-editor" onSubmit={onSubmitService}>
      <div className="admin-panel-head">
        <h3>{selectedServiceId ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</h3>
        <button type="button" className="admin-danger-button" disabled={!selectedServiceId || submitting} onClick={onDeleteService}>
          <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
          <span>Xóa dịch vụ</span>
        </button>
        <button type="submit" disabled={submitting}>
          <Save size={17} strokeWidth={2} aria-hidden="true" />
          <span>Lưu dịch vụ</span>
        </button>
      </div>

      <div className="admin-form-grid">
        <label>
          <span>Tên dịch vụ</span>
          <input value={serviceForm.name} onChange={(event) => onUpdateServiceForm('name', event.target.value)} required />
        </label>
        <label>
          <span>Slug</span>
          <input value={serviceForm.slug} onChange={(event) => onUpdateServiceForm('slug', event.target.value)} required />
        </label>
        <label>
          <span>Nhóm</span>
          <select value={serviceForm.categoryId} onChange={(event) => onUpdateServiceForm('categoryId', event.target.value)}>
            <option value="">Chưa phân nhóm</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Loại xử lý</span>
          <select value={serviceForm.type} onChange={(event) => onUpdateServiceForm('type', event.target.value)}>
            {serviceTypes.map((type) => <option value={type} key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          <span>Trạng thái</span>
          <select value={serviceForm.status} onChange={(event) => onUpdateServiceForm('status', event.target.value)}>
            {serviceStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>Tình trạng kho</span>
          <select value={serviceForm.stockStatus} onChange={(event) => onUpdateServiceForm('stockStatus', event.target.value)}>
            {stockStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>CTA</span>
          <select value={serviceForm.ctaType} onChange={(event) => onUpdateServiceForm('ctaType', event.target.value)}>
            {ctaTypes.map((type) => <option value={type} key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          <span>Thứ tự</span>
          <input value={serviceForm.sortOrder} onChange={(event) => onUpdateServiceForm('sortOrder', event.target.value)} inputMode="numeric" />
        </label>
        <label>
          <span>Giá số</span>
          <input
            value={serviceForm.price}
            onChange={(event) => onUpdateServiceForm('price', event.target.value)}
            inputMode="text"
            placeholder="390k, 1tr..."
            required
          />
        </label>
        <label>
          <span>Giá hiển thị</span>
          <input value={serviceForm.priceText} onChange={(event) => onUpdateServiceForm('priceText', event.target.value)} placeholder="Từ 390.000đ / Báo giá theo brief" />
        </label>
        <label>
          <span>Giá vốn</span>
          <input
            value={serviceForm.costPrice}
            onChange={(event) => onUpdateServiceForm('costPrice', event.target.value)}
            inputMode="text"
            placeholder="250k, 500k..."
          />
        </label>
        <label>
          <span>Badge bảng giá</span>
          <input value={serviceForm.pricingBadge} onChange={(event) => onUpdateServiceForm('pricingBadge', event.target.value)} placeholder="Phổ biến, Bán chạy..." />
        </label>
        <label>
          <span>Thời gian xử lý</span>
          <input value={serviceForm.processingTime} onChange={(event) => onUpdateServiceForm('processingTime', event.target.value)} />
        </label>
        <label>
          <span>Bảo hành</span>
          <input value={serviceForm.warrantyPolicy} onChange={(event) => onUpdateServiceForm('warrantyPolicy', event.target.value)} />
        </label>
        <label className="wide">
          <span>Mô tả ngắn</span>
          <textarea value={serviceForm.shortDescription} onChange={(event) => onUpdateServiceForm('shortDescription', event.target.value)} rows="2" />
        </label>
        <label className="wide">
          <span>Mô tả chi tiết</span>
          <textarea value={serviceForm.description} onChange={(event) => onUpdateServiceForm('description', event.target.value)} rows="4" />
        </label>
        <label className="wide">
          <span>Điều kiện / cần chuẩn bị (JSON hoặc text)</span>
          <textarea value={serviceForm.requirements} onChange={(event) => onUpdateServiceForm('requirements', event.target.value)} rows="3" />
        </label>
        <label className="wide">
          <span>Lợi ích</span>
          <textarea value={serviceForm.benefits} onChange={(event) => onUpdateServiceForm('benefits', event.target.value)} rows="3" />
        </label>
        <label className="wide">
          <span>Lưu ý sử dụng</span>
          <textarea value={serviceForm.usageNotes} onChange={(event) => onUpdateServiceForm('usageNotes', event.target.value)} rows="3" />
        </label>
        <label className="wide">
          <span>Input schema</span>
          <textarea value={serviceForm.inputSchema} onChange={(event) => onUpdateServiceForm('inputSchema', event.target.value)} rows="6" placeholder='{"type":"object","required":["facebookUrl"],"properties":{...}}' />
        </label>
        <div className="wide admin-action-row">
          <button type="button" className="admin-icon-button" onClick={() => onUpdateServiceForm('inputSchema', facebookSchema)}>Mẫu Facebook</button>
          <button type="button" className="admin-icon-button" onClick={() => onUpdateServiceForm('inputSchema', '')}>Xóa schema</button>
        </div>
      </div>

      <div className="admin-check-row">
        <label>
          <input checked={serviceForm.featured} onChange={(event) => onUpdateServiceForm('featured', event.target.checked)} type="checkbox" />
          <span>Hiển thị nổi bật</span>
        </label>
        <label>
          <input checked={serviceForm.publicVisible} onChange={(event) => onUpdateServiceForm('publicVisible', event.target.checked)} type="checkbox" />
          <span>Hiển thị public</span>
        </label>
      </div>

      {selectedServiceId && (
        <div className="admin-panel-subsection">
          <div className="admin-panel-head compact-head">
            <h3>Đơn gần đây của dịch vụ</h3>
            <span>{serviceOrders.length} đơn</span>
          </div>
          <div className="admin-mini-list">
            {selectedServiceCategories.map((category) => (
              <article key={category.id}>
                <strong>{category.name}</strong>
                <span>/{category.slug} · sort {category.sortOrder}</span>
              </article>
            ))}
            {serviceOrders.map((order) => (
              <article key={order.id}>
                <strong>{order.orderCode}</strong>
                <span>User #{order.userId} · {formatAdminMoney(order.amount)} · {order.status} · {formatAdminDate(order.createdAt)}</span>
              </article>
            ))}
            {selectedServiceCategories.length === 0 && serviceOrders.length === 0 && <AdminEmptyState message="Chưa có danh mục hoặc đơn gần đây cho dịch vụ này." />}
          </div>
        </div>
      )}
    </form>
  )
}

export default ServiceEditor
