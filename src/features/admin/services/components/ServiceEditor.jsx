import { Download, Eye, FileUp, KeyRound, Pencil, RefreshCw, Save, ShieldOff, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { getCtaTypeLabel, getCredentialStatusLabel, getServiceStatusLabel, getServiceTypeLabel, getStockStatusLabel, getOrderStatusLabel, ctaTypes, serviceStatuses, serviceTypes, stockStatuses } from '../services.constants'

function ServiceEditor({
  categories = [],
  credentialFilters = { status: '', query: '', createdFrom: '', createdTo: '', deliveredFrom: '', deliveredTo: '', expiresBefore: '' },
  credentialForm,
  editingCredentialId,
  onApplyCredentialFilters,
  onBulkImportCredentials,
  onCreateCredential,
  onDeleteService,
  onDisableCredential,
  onRevealCredential,
  onResetCredentialFilters,
  onStartEditCredential,
  onSubmitService,
  onUpdateCredentialForm,
  onUpdateCredentialFilter,
  onUpdateServiceForm,
  selectedServiceCategories = [],
  selectedServiceId,
  revealedCredentials = {},
  serviceCredentials = [],
  serviceForm,
  serviceOrders = [],
  submitting,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('basic')
  const [bulkCsv, setBulkCsv] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)

  const availableCredentials = serviceCredentials.filter((credential) => credential.status === 'AVAILABLE').length
  const deliveredCredentials = serviceCredentials.filter((credential) => credential.status === 'DELIVERED').length
  const isAccountStock = serviceForm.type === 'ACCOUNT_STOCK'

  const handleTabChange = (tab) => {
    if (tab === 'credentials' && (!selectedServiceId || !isAccountStock)) return
    setActiveTab(tab)
  }

  const handleBulkImport = async () => {
    if (!bulkCsv.trim()) return
    setBulkSubmitting(true)
    setBulkResult(null)
    try {
      await onBulkImportCredentials(bulkCsv.trim())
      setBulkResult({ type: 'success', message: 'Import kho tài khoản thành công.' })
      setBulkCsv('')
    } catch (err) {
      setBulkResult({ type: 'error', message: err.message || 'Import thất bại.' })
    } finally {
      setBulkSubmitting(false)
    }
  }

  const filteredCredentials = serviceCredentials.filter((cred) => {
    if (credentialFilters.status && cred.status !== credentialFilters.status) return false
    if (credentialFilters.query) {
      const q = credentialFilters.query.toLowerCase()
      const matchesLogin = cred.loginIdentifier?.toLowerCase().includes(q)
      const matchesNote = cred.usageNote?.toLowerCase().includes(q)
      const matchesInternal = cred.internalNote?.toLowerCase().includes(q)
      if (!matchesLogin && !matchesNote && !matchesInternal) return false
    }
    return true
  })

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
          <h3 style={{ whiteSpace: 'nowrap', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {selectedServiceId
              ? (isAccountStock ? 'Sản phẩm giao tài khoản' : 'Chi tiết dịch vụ')
              : (isAccountStock ? 'Tạo sản phẩm giao tài khoản' : 'Tạo dịch vụ mới')}
          </h3>
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

      <div className={`service-editor-mode ${isAccountStock ? 'account-stock' : 'manual-service'}`}>
        <div>
          <KeyRound size={20} aria-hidden="true" />
          <span>
            <strong>{isAccountStock ? 'Giao tài khoản tự động' : 'Dịch vụ xử lý thông thường'}</strong>
            <small>
              {isAccountStock
                ? 'Tài khoản trong kho sẽ được backend giữ chỗ và gắn vào đúng đơn hàng sau thanh toán.'
                : 'Không sử dụng kho tài khoản. Admin xử lý và trả kết quả qua đơn hàng.'}
            </small>
          </span>
        </div>
        <select
          value={serviceForm.type}
          onChange={(event) => {
            const nextType = event.target.value
            if (activeTab === 'credentials' && nextType !== 'ACCOUNT_STOCK') {
              setActiveTab('basic')
            }
            onUpdateServiceForm('type', nextType)
          }}
          aria-label="Chọn cách cung cấp dịch vụ"
        >
          {serviceTypes.map((type) => <option value={type} key={type}>{getServiceTypeLabel(type)}</option>)}
        </select>
      </div>

      <div className="admin-tabs" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px' }}>
        <button type="button" className={activeTab === 'basic' ? 'active' : ''} onClick={() => handleTabChange('basic')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Cơ bản</button>
        <button type="button" className={activeTab === 'pricing' ? 'active' : ''} onClick={() => handleTabChange('pricing')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Giá & Cam kết</button>
        <button type="button" className={activeTab === 'content' ? 'active' : ''} onClick={() => handleTabChange('content')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>Nội dung</button>
        <button type="button" className={activeTab === 'seo' ? 'active' : ''} onClick={() => handleTabChange('seo')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>SEO</button>
        {selectedServiceId && (
          <button type="button" className={activeTab === 'orders' ? 'active' : ''} onClick={() => handleTabChange('orders')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>
            Đơn hàng ({serviceOrders.length})
          </button>
        )}
        <button
          type="button"
          className={activeTab === 'credentials' ? 'active' : ''}
          disabled={!selectedServiceId || !isAccountStock}
          onClick={() => handleTabChange('credentials')}
          title={
            !isAccountStock
              ? 'Chọn loại Kho tài khoản để sử dụng chức năng này'
              : !selectedServiceId
                ? 'Lưu sản phẩm trước khi nhập tài khoản'
                : 'Quản lý tài khoản cấp cho khách'
          }
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          Tài khoản cấp khách {selectedServiceId && isAccountStock ? `(${availableCredentials}/${serviceCredentials.length})` : ''}
        </button>
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
                <span>Trạng thái</span>
                <select value={serviceForm.status} onChange={(event) => onUpdateServiceForm('status', event.target.value)}>
                  {serviceStatuses.map((status) => <option value={status} key={status}>{getServiceStatusLabel(status)}</option>)}
                </select>
              </label>
              <label>
                <span>Tình trạng kho</span>
                <select value={serviceForm.stockStatus} onChange={(event) => onUpdateServiceForm('stockStatus', event.target.value)}>
                  {stockStatuses.map((status) => <option value={status} key={status}>{getStockStatusLabel(status)}</option>)}
                </select>
              </label>
              <label>
                <span>CTA hiển thị</span>
                <select value={serviceForm.ctaType} onChange={(event) => onUpdateServiceForm('ctaType', event.target.value)}>
                  {ctaTypes.map((type) => <option value={type} key={type}>{getCtaTypeLabel(type)}</option>)}
                </select>
              </label>
              <label>
                <span>Thứ tự sắp xếp</span>
                <input value={serviceForm.sortOrder} onChange={(event) => onUpdateServiceForm('sortOrder', event.target.value)} inputMode="numeric" />
              </label>
              <label className="wide">
                <span>Ảnh minh họa (Icon/Image URL)</span>
                <input value={serviceForm.iconUrl} onChange={(event) => onUpdateServiceForm('iconUrl', event.target.value)} placeholder="Đường dẫn ảnh sản phẩm (ví dụ: https://example.com/image.png hoặc /assets/...)" />
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
            {isAccountStock && (
              <div className="service-account-stock-guide">
                <KeyRound size={20} aria-hidden="true" />
                <div>
                  <strong>Dịch vụ giao tài khoản tự động</strong>
                  <p>
                    Mỗi tài khoản nhập tại đây thuộc riêng dịch vụ này. Khi khách thanh toán,
                    backend sẽ giữ một tài khoản AVAILABLE rồi gắn trực tiếp vào đơn hàng.
                  </p>
                </div>
                {selectedServiceId ? (
                  <button type="button" className="admin-icon-button" onClick={() => setActiveTab('credentials')}>
                    Mở danh sách tài khoản
                  </button>
                ) : (
                  <span className="service-account-stock-pending">Lưu dịch vụ trước để nhập tài khoản</span>
                )}
              </div>
            )}
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
                <input value={serviceForm.price} onChange={(event) => onUpdateServiceForm('price', event.target.value)} inputMode="text" placeholder="390k, 1tr..." required />
              </label>
              <label>
                <span>Giá hiển thị text</span>
                <input value={serviceForm.priceText} onChange={(event) => onUpdateServiceForm('priceText', event.target.value)} placeholder="Từ 390.000đ" />
              </label>
              <label>
                <span>Giá vốn</span>
                <input value={serviceForm.costPrice} onChange={(event) => onUpdateServiceForm('costPrice', event.target.value)} inputMode="text" placeholder="250k, 500k..." />
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
              <h4>Thông tin SEO</h4>
              <span>Tiêu đề và mô tả hiển thị trên công cụ tìm kiếm</span>
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
                  <span>User #{order.userId} · {formatAdminMoney(order.amount)} · {getOrderStatusLabel(order.status)} · {formatAdminDate(order.createdAt)}</span>
                </article>
              ))}
              {selectedServiceCategories.length === 0 && serviceOrders.length === 0 && <AdminEmptyState message="Chưa có danh mục hoặc đơn gần đây cho dịch vụ này." />}
            </div>
          </div>
        )}

        {activeTab === 'credentials' && selectedServiceId && isAccountStock && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>Tài khoản cấp cho khách hàng</h4>
              <span>{availableCredentials} sẵn sàng cấp, {deliveredCredentials} đã liên kết đơn hàng</span>
            </div>
            <div className="service-credential-flow">
              <strong>Liên kết tự động:</strong>
              <span>Tài khoản AVAILABLE</span>
              <span>→ Checkout giữ chỗ</span>
              <span>→ Đơn hàng</span>
              <span>→ DELIVERED</span>
            </div>

            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <select
                value={credentialFilters.status}
                onChange={(event) => onUpdateCredentialFilter('status', event.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="AVAILABLE">Sẵn sàng</option>
                <option value="RESERVED">Đang giữ</option>
                <option value="DELIVERED">Đã giao</option>
                <option value="REPLACED">Đã đổi</option>
                <option value="REFUNDED">Đã hoàn</option>
                <option value="DISABLED">Đã khóa</option>
                <option value="EXPIRED">Hết hạn</option>
              </select>
              <input
                value={credentialFilters.query}
                onChange={(event) => onUpdateCredentialFilter('query', event.target.value)}
                placeholder="Tìm kiếm tài khoản..."
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', flex: 1, minWidth: '120px', background: 'var(--kd-card-bg)' }}
              />
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                Nhập từ
                <input
                  type="datetime-local"
                  value={credentialFilters.createdFrom}
                  onChange={(event) => onUpdateCredentialFilter('createdFrom', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                Nhập đến
                <input
                  type="datetime-local"
                  value={credentialFilters.createdTo}
                  onChange={(event) => onUpdateCredentialFilter('createdTo', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                Giao từ
                <input
                  type="datetime-local"
                  value={credentialFilters.deliveredFrom}
                  onChange={(event) => onUpdateCredentialFilter('deliveredFrom', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                Giao đến
                <input
                  type="datetime-local"
                  value={credentialFilters.deliveredTo}
                  onChange={(event) => onUpdateCredentialFilter('deliveredTo', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                Hết hạn trước
                <input
                  type="datetime-local"
                  value={credentialFilters.expiresBefore}
                  onChange={(event) => onUpdateCredentialFilter('expiresBefore', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={onApplyCredentialFilters} style={{ height: '30px', minHeight: '30px', fontSize: '12px' }}>
                <RefreshCw size={14} /> <span>Lọc</span>
              </button>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={onResetCredentialFilters} style={{ height: '30px', minHeight: '30px', fontSize: '12px' }}>
                <X size={14} /> <span>Xóa lọc</span>
              </button>
              <span style={{ fontSize: '12px', color: 'var(--kd-muted)', whiteSpace: 'nowrap' }}>{filteredCredentials.length} hiển thị</span>
            </div>

            {/* Create/Edit credential form */}
            <div className="admin-form-grid service-form-grid" style={{ borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px', marginBottom: '12px' }}>
              <label>
                <span>Tài khoản khách sẽ nhận *</span>
                <input value={credentialForm.loginIdentifier} onChange={(event) => onUpdateCredentialForm('loginIdentifier', event.target.value)} placeholder="Email, username hoặc số điện thoại đăng nhập" required />
              </label>
              <label>
                <span>Mật khẩu khách sẽ nhận *</span>
                <input value={credentialForm.passwordSecret} onChange={(event) => onUpdateCredentialForm('passwordSecret', event.target.value)} placeholder={editingCredentialId ? 'Để trống nếu không đổi mật khẩu' : 'Mật khẩu đăng nhập'} required={!editingCredentialId} />
              </label>
              <label>
                <span>Email / thông tin khôi phục</span>
                <input value={credentialForm.recoveryInfo} onChange={(event) => onUpdateCredentialForm('recoveryInfo', event.target.value)} placeholder="Thông tin khôi phục nếu có" />
              </label>
              <label>
                <span>Mã hoặc secret 2FA</span>
                <input value={credentialForm.twoFactorSecret} onChange={(event) => onUpdateCredentialForm('twoFactorSecret', event.target.value)} placeholder="Mã 2FA hoặc secret" />
              </label>
              <label>
                <span>Hạn tài khoản</span>
                <input type="datetime-local" value={credentialForm.expiresAt} onChange={(event) => onUpdateCredentialForm('expiresAt', event.target.value)} />
              </label>
              <label>
                <span>Bảo hành đến</span>
                <input type="datetime-local" value={credentialForm.warrantyUntil} onChange={(event) => onUpdateCredentialForm('warrantyUntil', event.target.value)} />
              </label>
              <label className="wide">
                <span>Hướng dẫn hiển thị cho khách</span>
                <textarea value={credentialForm.usageNote} onChange={(event) => onUpdateCredentialForm('usageNote', event.target.value)} rows="2" placeholder="Ví dụ: không đổi mật khẩu trong 24h đầu, đăng nhập đúng khu vực..." />
              </label>
              <label className="wide">
                <span>Ghi chú nội bộ — khách không nhìn thấy</span>
                <textarea value={credentialForm.internalNote} onChange={(event) => onUpdateCredentialForm('internalNote', event.target.value)} rows="2" placeholder="Nguồn hàng, chi phí, lưu ý bảo hành..." />
              </label>
            </div>
            <div className="admin-action-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="admin-primary-button" disabled={submitting} onClick={onCreateCredential} style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                <KeyRound size={16} />
                <span>{editingCredentialId ? 'Cập nhật tài khoản' : 'Thêm tài khoản sẵn sàng cấp'}</span>
              </button>
              {editingCredentialId && (
                <button type="button" className="admin-icon-button" onClick={() => onStartEditCredential(null)} style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                  <X size={16} /> <span>Huỷ sửa</span>
                </button>
              )}
            </div>

            {/* Bulk import */}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--kd-border)', paddingTop: '12px' }}>
              <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
                <h3>Thêm nhiều tài khoản bằng CSV</h3>
                <FileUp size={18} strokeWidth={2} aria-hidden="true" />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--kd-muted)', margin: '0 0 8px' }}>
                Mỗi dòng: login, password, recovery, twoFactor, hướng dẫn khách, ghi chú nội bộ.
              </p>
              <textarea
                value={bulkCsv}
                onChange={(event) => setBulkCsv(event.target.value)}
                rows="4"
                placeholder={'email1@test.com,pass123,,,Ghi chú giao hàng,Ghi chú nội bộ\nemail2@test.com,pass456,recovery@test.com,2FASecret,,'}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', fontFamily: 'monospace', background: 'var(--kd-card-bg)', boxSizing: 'border-box' }}
              />
              <div className="admin-action-row" style={{ marginTop: '8px' }}>
                <button type="button" className="admin-icon-button" disabled={submitting || bulkSubmitting || !bulkCsv.trim()} onClick={handleBulkImport} style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                  <Download size={16} />
                  <span>{bulkSubmitting ? 'Đang import...' : 'Import CSV'}</span>
                </button>
              </div>
              {bulkResult && (
                <p style={{ fontSize: '13px', color: bulkResult.type === 'success' ? '#28a745' : '#dc3545', margin: '8px 0 0' }}>
                  {bulkResult.message}
                </p>
              )}
            </div>

            {/* Credential list */}
            <div className="admin-mini-list" style={{ marginTop: '16px' }}>
              {filteredCredentials.map((credential) => {
                const revealed = revealedCredentials[credential.id]
                const visibleCredential = revealed || credential
                return (
                <article key={credential.id}>
                  <strong>{visibleCredential.loginIdentifier}</strong>
                  <span>
                    {getCredentialStatusLabel(credential.status)}
                    {credential.reservedCheckoutCode ? ` · Checkout ${credential.reservedCheckoutCode}` : ''}
                    {credential.reservedUntil ? ` · Giữ đến ${formatAdminDate(credential.reservedUntil)}` : ''}
                    {credential.assignedOrderCode ? ` · Đơn ${credential.assignedOrderCode}` : ''}
                    {credential.deliveredToEmail ? ` · ${credential.deliveredToEmail}` : ''}
                    {credential.deliveredAt ? ` · Giao ${formatAdminDate(credential.deliveredAt)}` : ''}
                  </span>
                  <span style={{ fontFamily: 'monospace' }}>Mật khẩu: {visibleCredential.passwordSecret || '-'}</span>
                  {(visibleCredential.recoveryInfo || visibleCredential.twoFactorSecret || visibleCredential.usageNote) && (
                    <small style={{ color: 'var(--kd-muted)' }}>
                      {visibleCredential.recoveryInfo ? `Recovery: ${visibleCredential.recoveryInfo}` : ''}
                      {visibleCredential.twoFactorSecret ? ` · 2FA: ${visibleCredential.twoFactorSecret}` : ''}
                      {visibleCredential.usageNote ? ` · Note: ${visibleCredential.usageNote}` : ''}
                    </small>
                  )}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {!revealed && (
                      <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onRevealCredential(credential)} style={{ height: '30px', minHeight: '30px', fontSize: '12px', width: 'fit-content' }}>
                        <Eye size={15} /> <span>Hiện</span>
                      </button>
                    )}
                    {credential.status === 'AVAILABLE' && (
                      <>
                        <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onStartEditCredential(credential)} style={{ height: '30px', minHeight: '30px', fontSize: '12px', width: 'fit-content' }}>
                          <Pencil size={15} /> <span>Sửa</span>
                        </button>
                        <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onDisableCredential(credential)} style={{ height: '30px', minHeight: '30px', fontSize: '12px', width: 'fit-content' }}>
                          <ShieldOff size={15} /> <span>Khóa</span>
                        </button>
                      </>
                    )}
                  </div>
                </article>
              )})}
              {filteredCredentials.length === 0 && <AdminEmptyState message={credentialFilters.status || credentialFilters.query ? 'Không tìm thấy tài khoản phù hợp.' : 'Chưa có tài khoản nào trong kho cho sản phẩm này.'} />}
            </div>
          </section>
        )}
      </div>
    </form>
  )
}

export default ServiceEditor
