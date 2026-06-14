import { Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
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
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('basic') // 'basic' | 'pricing' | 'content' | 'seo' | 'orders'

  return (
    <form className="admin-form service-editor admin-service-editor product-editor" onSubmit={onSubmitService}>
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
          <h3 style={{ whiteSpace: 'nowrap', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{selectedServiceId ? 'Chi tiết sản phẩm' : 'Tạo sản phẩm mới'}</h3>
          <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '280px', whiteSpace: 'nowrap' }}>
            {serviceForm.name || 'Điền thông tin dịch vụ để mở bán'}
          </span>
        </div>
        <div className="service-editor-actions" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button type="button" className="admin-danger-button slim" disabled={!selectedServiceId || submitting} onClick={onDeleteService}>
            <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
            <span>Xóa</span>
          </button>
          <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '32px', minHeight: '32px', padding: '0 12px' }}>
            <Save size={17} strokeWidth={2} aria-hidden="true" />
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

      {/* Internal Form Section Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={activeTab === 'basic' ? 'active' : ''}
          onClick={() => setActiveTab('basic')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Cơ bản
        </button>
        <button
          type="button"
          className={activeTab === 'pricing' ? 'active' : ''}
          onClick={() => setActiveTab('pricing')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Giá & Cam kết
        </button>
        <button
          type="button"
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Nội dung
        </button>
        <button
          type="button"
          className={activeTab === 'seo' ? 'active' : ''}
          onClick={() => setActiveTab('seo')}
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          SEO & Schema
        </button>
        {selectedServiceId && (
          <button
            type="button"
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
            style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
          >
            Đơn hàng ({serviceOrders.length})
          </button>
        )}
      </div>

      <div className="service-editor-sections">
        {activeTab === 'basic' && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>Cơ bản</h4>
              <span>Thông tin định danh và trạng thái</span>
            </div>
            <div className="admin-form-grid service-form-grid">
              <label className="wide">
                <span>Tên dịch vụ</span>
                <input value={serviceForm.name} onChange={(event) => onUpdateServiceForm('name', event.target.value)} required />
              </label>
              <label className="wide">
                <span>Slug</span>
                <input value={serviceForm.slug} onChange={(event) => onUpdateServiceForm('slug', event.target.value)} required />
              </label>
              <label>
                <span>Nhóm danh mục</span>
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
                <span>CTA hiển thị</span>
                <select value={serviceForm.ctaType} onChange={(event) => onUpdateServiceForm('ctaType', event.target.value)}>
                  {ctaTypes.map((type) => <option value={type} key={type}>{type}</option>)}
                </select>
              </label>
              <label>
                <span>Thứ tự sắp xếp</span>
                <input value={serviceForm.sortOrder} onChange={(event) => onUpdateServiceForm('sortOrder', event.target.value)} inputMode="numeric" />
              </label>
            </div>
            <div className="admin-check-row">
              <label style={{ cursor: 'pointer' }}>
                <input checked={serviceForm.featured} onChange={(event) => onUpdateServiceForm('featured', event.target.checked)} type="checkbox" />
                <span>Nổi bật</span>
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input checked={serviceForm.publicVisible} onChange={(event) => onUpdateServiceForm('publicVisible', event.target.checked)} type="checkbox" />
                <span>Hiển thị công khai</span>
              </label>
            </div>
          </section>
        )}

        {activeTab === 'pricing' && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>Giá và cam kết</h4>
              <span>Giá bán, giá vốn, badge và thời gian xử lý</span>
            </div>
            <div className="admin-form-grid service-form-grid">
              <label>
                <span>Giá bán</span>
                <input
                  value={serviceForm.price}
                  onChange={(event) => onUpdateServiceForm('price', event.target.value)}
                  inputMode="text"
                  placeholder="390k, 1tr..."
                  required
                />
              </label>
              <label>
                <span>Giá hiển thị text</span>
                <input value={serviceForm.priceText} onChange={(event) => onUpdateServiceForm('priceText', event.target.value)} placeholder="Từ 390.000đ" />
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
                <input value={serviceForm.processingTime} onChange={(event) => onUpdateServiceForm('processingTime', event.target.value)} placeholder="Trong 24h" />
              </label>
              <label>
                <span>Chính sách bảo hành</span>
                <input value={serviceForm.warrantyPolicy} onChange={(event) => onUpdateServiceForm('warrantyPolicy', event.target.value)} placeholder="Bảo hành 7 ngày" />
              </label>
            </div>
          </section>
        )}

        {activeTab === 'content' && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>Nội dung hiển thị</h4>
              <span>Mô tả ngắn, chi tiết và lưu ý sử dụng</span>
            </div>
            <div className="admin-form-grid service-form-grid">
              <label className="wide">
                <span>Mô tả ngắn</span>
                <textarea value={serviceForm.shortDescription} onChange={(event) => onUpdateServiceForm('shortDescription', event.target.value)} rows="3" />
              </label>
              <label className="wide">
                <span>Mô tả chi tiết</span>
                <textarea value={serviceForm.description} onChange={(event) => onUpdateServiceForm('description', event.target.value)} rows="6" />
              </label>
              <label className="wide">
                <span>Yêu cầu đầu vào (chuẩn bị gì)</span>
                <textarea value={serviceForm.requirements} onChange={(event) => onUpdateServiceForm('requirements', event.target.value)} rows="3" />
              </label>
              <label className="wide">
                <span>Lợi ích dịch vụ</span>
                <textarea value={serviceForm.benefits} onChange={(event) => onUpdateServiceForm('benefits', event.target.value)} rows="3" />
              </label>
              <label className="wide">
                <span>Lưu ý khi sử dụng</span>
                <textarea value={serviceForm.usageNotes} onChange={(event) => onUpdateServiceForm('usageNotes', event.target.value)} rows="3" />
              </label>
            </div>
          </section>
        )}

        {activeTab === 'seo' && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>Schema và SEO</h4>
              <span>Cấu hình form đầu vào và thông tin tìm kiếm</span>
            </div>
            <div className="admin-form-grid service-form-grid">
              <label className="wide">
                <span>Meta Title (SEO)</span>
                <input value={serviceForm.metaTitle} onChange={(event) => onUpdateServiceForm('metaTitle', event.target.value)} />
              </label>
              <label className="wide">
                <span>Meta Description (SEO)</span>
                <input value={serviceForm.metaDescription} onChange={(event) => onUpdateServiceForm('metaDescription', event.target.value)} />
              </label>
              <label className="wide">
                <span>Icon URL</span>
                <input value={serviceForm.iconUrl} onChange={(event) => onUpdateServiceForm('iconUrl', event.target.value)} />
              </label>
              <div className="wide admin-check-row">
                <label style={{ cursor: 'pointer' }}>
                  <input checked={serviceForm.inputSchemaEnabled} onChange={(event) => onUpdateServiceForm('inputSchemaEnabled', event.target.checked)} type="checkbox" />
                  <span>Bật form đầu vào khi mua hàng</span>
                </label>
              </div>
              <label className="wide">
                <span>Input schema (Cấu hình Form mua hàng - JSON)</span>
                <textarea
                  disabled={!serviceForm.inputSchemaEnabled}
                  value={serviceForm.inputSchema}
                  onChange={(event) => onUpdateServiceForm('inputSchema', event.target.value)}
                  rows="6"
                  placeholder={serviceForm.inputSchemaEnabled ? '{"type":"object","required":["facebookUrl"],"properties":{...}}' : 'Đang tắt form đầu vào. Backend sẽ không validate inputData.'}
                  style={{ fontFamily: 'monospace' }}
                />
              </label>
              <div className="wide admin-action-row" style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="admin-icon-button"
                  style={{ height: '32px', minHeight: '32px', fontSize: '13px' }}
                  onClick={() => {
                    onUpdateServiceForm('inputSchemaEnabled', true)
                    onUpdateServiceForm('inputSchema', facebookSchema)
                  }}
                >
                  Bật mẫu Facebook
                </button>
                <button
                  type="button"
                  className="admin-icon-button"
                  style={{ height: '32px', minHeight: '32px', fontSize: '13px' }}
                  onClick={() => {
                    onUpdateServiceForm('inputSchemaEnabled', false)
                    onUpdateServiceForm('inputSchema', '')
                  }}
                >
                  Tắt schema
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'orders' && selectedServiceId && (
          <div className="admin-panel-subsection" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
            <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
              <h3>Đơn gần đây & liên kết</h3>
              <span>{serviceOrders.length} đơn hàng</span>
            </div>
            <div className="admin-mini-list">
              {selectedServiceCategories.map((category) => (
                <article key={category.id} style={{ borderLeft: '4px solid var(--kd-blue)' }}>
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
      </div>
    </form>
  )
}

export default ServiceEditor
