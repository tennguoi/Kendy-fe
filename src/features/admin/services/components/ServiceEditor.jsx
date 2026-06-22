import { Download, Eye, FileUp, ImageUp, KeyRound, Pencil, RefreshCw, Save, ShieldOff, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AdminEmptyState } from '../../AdminShared'
import { formatAdminDate, formatAdminMoney } from '../../adminFormat'
import { accessStrategies, accessStrategyLabels, getCtaTypeLabel, getCredentialStatusLabel, getServiceStatusLabel, getServiceTypeLabel, getStockStatusLabel, getOrderStatusLabel, ctaTypes, serviceStatuses, serviceTypes, stockStatuses } from '../services.constants'
import SearchField from '../../../../components/SearchField/SearchField'
import RichEditor from '../../../../components/RichEditor/RichEditor'

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
  onUploadServiceImage,
  selectedServiceCategories = [],
  selectedServiceId,
  revealedCredentials = {},
  serviceCredentials = [],
  serviceForm,
  serviceOrders = [],
  submitting,
  uploadingImage,
  onClose,
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('basic')
  const navigate = useNavigate()
  const [selectedCredentialId, setSelectedCredentialId] = useState('')
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
      setBulkResult({ type: 'success', message: t('admin.services.editor.importSuccess') })
      setBulkCsv('')
    } catch (err) {
      setBulkResult({ type: 'error', message: err.message || t('admin.services.editor.importFailed') })
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
              ? (isAccountStock ? t('admin.services.editor.title.editAccountStock') : t('admin.services.editor.title.editService'))
              : (isAccountStock ? t('admin.services.editor.title.createAccountStock') : t('admin.services.editor.title.createService'))}
          </h3>
          <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '280px', whiteSpace: 'nowrap' }}>
            {serviceForm.name || t('admin.services.editor.placeholder')}
          </span>
        </div>
        <div className="service-editor-actions" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button type="button" className="admin-danger-button slim" disabled={!selectedServiceId || submitting} onClick={onDeleteService}>
            <Trash2 size={17} strokeWidth={2} aria-hidden="true" />
            <span>{t('admin.common.delete')}</span>
          </button>
          <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '32px', minHeight: '32px', padding: '0 12px' }}>
            <Save size={17} strokeWidth={2} aria-hidden="true" />
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

      <div className={`service-editor-mode ${isAccountStock ? 'account-stock' : 'manual-service'}`}>
        <div>
          <KeyRound size={20} aria-hidden="true" />
          <span>
            <strong>{isAccountStock ? t('admin.services.editor.mode.autoDelivery') : t('admin.services.editor.mode.manual')}</strong>
            <small>
              {isAccountStock
                ? t('admin.services.editor.mode.autoDeliveryDesc')
                : t('admin.services.editor.mode.manualDesc')}
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
            onUpdateServiceForm('accessStrategy', nextType === 'ACCOUNT_STOCK' ? 'DEDICATED_ACCOUNT' : 'MANUAL')
          }}
          aria-label={t('admin.services.editor.selectMode')}
        >
          {serviceTypes.map((type) => <option value={type} key={type}>{getServiceTypeLabel(type)}</option>)}
        </select>
      </div>

      <div className="admin-tabs" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px' }}>
        <button type="button" className={activeTab === 'basic' ? 'active' : ''} onClick={() => handleTabChange('basic')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>{t('admin.services.editor.tab.basic')}</button>
        <button type="button" className={activeTab === 'pricing' ? 'active' : ''} onClick={() => handleTabChange('pricing')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>{t('admin.services.editor.tab.pricing')}</button>
        <button type="button" className={activeTab === 'content' ? 'active' : ''} onClick={() => handleTabChange('content')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>{t('admin.services.editor.tab.content')}</button>
        <button type="button" className={activeTab === 'seo' ? 'active' : ''} onClick={() => handleTabChange('seo')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>{t('admin.services.editor.tab.seo')}</button>
        {selectedServiceId && (
          <button type="button" className={activeTab === 'orders' ? 'active' : ''} onClick={() => handleTabChange('orders')} style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}>
            {t('admin.services.editor.tab.orders')} ({serviceOrders.length})
          </button>
        )}
        <button
          type="button"
          className={activeTab === 'credentials' ? 'active' : ''}
          disabled={!selectedServiceId || !isAccountStock}
          onClick={() => handleTabChange('credentials')}
          title={
            !isAccountStock
              ? t('admin.services.editor.selectAccountStockType')
              : !selectedServiceId
                ? t('admin.services.editor.saveServiceFirst')
                : t('admin.services.editor.manageCredentials')
          }
          style={{ height: '30px', minHeight: '30px', padding: '0 10px', fontSize: '12px' }}
        >
          {t('admin.services.editor.tab.credentials')} {selectedServiceId && isAccountStock ? `(${availableCredentials}/${serviceCredentials.length})` : ''}
        </button>
      </div>

      <div className="service-editor-sections">
        {activeTab === 'basic' && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>{t('admin.services.editor.section.basic')}</h4>
              <span>{t('admin.services.editor.section.basicDesc')}</span>
            </div>
            <div className="admin-form-grid service-form-grid">
              <label className="wide">
                <span>{t('admin.services.editor.field.serviceName')}</span>
                <input value={serviceForm.name} onChange={(event) => onUpdateServiceForm('name', event.target.value)} required />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.field.slug')}</span>
                <input value={serviceForm.slug} onChange={(event) => onUpdateServiceForm('slug', event.target.value)} required />
              </label>
              <label>
                <span>{t('admin.services.editor.field.category')}</span>
                <select value={serviceForm.categoryId} onChange={(event) => onUpdateServiceForm('categoryId', event.target.value)}>
                  <option value="">{t('admin.services.summary.ungrouped')}</option>
                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{t('admin.common.status')}</span>
                <select value={serviceForm.status} onChange={(event) => onUpdateServiceForm('status', event.target.value)}>
                  {serviceStatuses.map((status) => <option value={status} key={status}>{getServiceStatusLabel(status)}</option>)}
                </select>
              </label>
              <label>
                <span>{t('admin.services.editor.field.stockStatus')}</span>
                <select value={serviceForm.stockStatus} onChange={(event) => onUpdateServiceForm('stockStatus', event.target.value)}>
                  {stockStatuses.map((status) => <option value={status} key={status}>{getStockStatusLabel(status)}</option>)}
                </select>
              </label>
              <label>
                <span>{t('admin.services.editor.field.cta')}</span>
                <select value={serviceForm.ctaType} onChange={(event) => onUpdateServiceForm('ctaType', event.target.value)}>
                  {ctaTypes.map((type) => <option value={type} key={type}>{getCtaTypeLabel(type)}</option>)}
                </select>
              </label>
              <label>
                <span>Cách cấp quyền</span>
                <select
                  value={serviceForm.accessStrategy}
                  onChange={(event) => onUpdateServiceForm('accessStrategy', event.target.value)}
                  disabled={isAccountStock}
                >
                  {accessStrategies
                    .filter((strategy) => !isAccountStock || strategy === 'DEDICATED_ACCOUNT')
                    .map((strategy) => (
                      <option value={strategy} key={strategy}>{accessStrategyLabels[strategy]}</option>
                    ))}
                </select>
              </label>
              <label>
                <span>Thời hạn truy cập (ngày)</span>
                <input
                  type="number"
                  min="1"
                  value={serviceForm.accessDurationDays}
                  onChange={(event) => onUpdateServiceForm('accessDurationDays', event.target.value)}
                  placeholder="30"
                />
              </label>
              <label>
                <span>{t('admin.services.editor.field.sortOrder')}</span>
                <input value={serviceForm.sortOrder} onChange={(event) => onUpdateServiceForm('sortOrder', event.target.value)} inputMode="numeric" />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.field.iconUrl')}</span>
                <input value={serviceForm.iconUrl} onChange={(event) => onUpdateServiceForm('iconUrl', event.target.value)} placeholder="Đường dẫn ảnh sản phẩm (ví dụ: https://example.com/image.png hoặc /assets/...)" />
              </label>
              <div className="wide service-image-upload">
                <label className="service-image-upload-button">
                  <ImageUp size={18} aria-hidden="true" />
                  <span>{uploadingImage ? 'Đang tải ảnh...' : 'Tải ảnh lên Cloudinary'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    disabled={uploadingImage || submitting}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        onUploadServiceImage(file)
                      }
                      event.target.value = ''
                    }}
                  />
                </label>
                <small>Hỗ trợ JPG, PNG, GIF, WEBP; tối đa 10 MB.</small>
                {serviceForm.iconUrl && (
                  <img src={serviceForm.iconUrl} alt="Xem trước ảnh dịch vụ" className="service-image-preview" />
                )}
              </div>
            </div>
            <div className="admin-check-row">
              <label style={{ cursor: 'pointer' }}>
                <input checked={serviceForm.featured} onChange={(event) => onUpdateServiceForm('featured', event.target.checked)} type="checkbox" />
                <span>{t('admin.services.editor.field.featured')}</span>
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input checked={serviceForm.publicVisible} onChange={(event) => onUpdateServiceForm('publicVisible', event.target.checked)} type="checkbox" />
                <span>{t('admin.services.editor.field.publicVisible')}</span>
              </label>
            </div>
            {isAccountStock && (
              <div className="service-account-stock-guide">
                <KeyRound size={20} aria-hidden="true" />
                <div>
                  <strong>{t('admin.services.editor.accountStockGuide.title')}</strong>
                  <p>{t('admin.services.editor.accountStockGuide.desc')}</p>
                </div>
                {selectedServiceId ? (
                  <button type="button" className="admin-icon-button" onClick={() => setActiveTab('credentials')}>
                    {t('admin.services.editor.accountStockGuide.openList')}
                  </button>
                ) : (
                  <span className="service-account-stock-pending">{t('admin.services.editor.accountStockGuide.pending')}</span>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'pricing' && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>{t('admin.services.editor.section.pricing')}</h4>
              <span>{t('admin.services.editor.section.pricingDesc')}</span>
            </div>
            <div className="admin-form-grid service-form-grid">
              <label>
                <span>{t('admin.services.editor.field.price')}</span>
                <input value={serviceForm.price} onChange={(event) => onUpdateServiceForm('price', event.target.value)} inputMode="text" placeholder="390k, 1tr..." required />
              </label>
              <label>
                <span>{t('admin.services.editor.field.priceText')}</span>
                <input value={serviceForm.priceText} onChange={(event) => onUpdateServiceForm('priceText', event.target.value)} placeholder="Từ 390.000đ" />
              </label>
              <label>
                <span>{t('admin.services.editor.field.costPrice')}</span>
                <input value={serviceForm.costPrice} onChange={(event) => onUpdateServiceForm('costPrice', event.target.value)} inputMode="text" placeholder="250k, 500k..." />
              </label>
              <label>
                <span>{t('admin.services.editor.field.pricingBadge')}</span>
                <input value={serviceForm.pricingBadge} onChange={(event) => onUpdateServiceForm('pricingBadge', event.target.value)} placeholder="Phổ biến, Bán chạy..." />
              </label>
              <label>
                <span>{t('admin.services.editor.field.processingTime')}</span>
                <input value={serviceForm.processingTime} onChange={(event) => onUpdateServiceForm('processingTime', event.target.value)} placeholder="Trong 24h" />
              </label>
              <label>
                <span>{t('admin.services.editor.field.warrantyPolicy')}</span>
                <input value={serviceForm.warrantyPolicy} onChange={(event) => onUpdateServiceForm('warrantyPolicy', event.target.value)} placeholder="Bảo hành 7 ngày" />
              </label>
            </div>
          </section>
        )}

        {activeTab === 'content' && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>{t('admin.services.editor.section.content')}</h4>
              <span>{t('admin.services.editor.section.contentDesc')}</span>
            </div>
            <div className="admin-form-grid service-form-grid">
              <label className="wide">
                <span>{t('admin.services.editor.field.shortDescription')}</span>
                <RichEditor value={serviceForm.shortDescription} onChange={(value) => onUpdateServiceForm('shortDescription', value)} minHeight={120} />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.field.description')}</span>
                <RichEditor value={serviceForm.description} onChange={(value) => onUpdateServiceForm('description', value)} minHeight={250} />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.field.requirements')}</span>
                <RichEditor value={serviceForm.requirements} onChange={(value) => onUpdateServiceForm('requirements', value)} minHeight={120} />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.field.benefits')}</span>
                <RichEditor value={serviceForm.benefits} onChange={(value) => onUpdateServiceForm('benefits', value)} minHeight={120} />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.field.usageNotes')}</span>
                <RichEditor value={serviceForm.usageNotes} onChange={(value) => onUpdateServiceForm('usageNotes', value)} minHeight={120} />
              </label>
            </div>
          </section>
        )}

        {activeTab === 'seo' && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>{t('admin.services.editor.section.seo')}</h4>
              <span>{t('admin.services.editor.section.seoDesc')}</span>
            </div>
            <div className="admin-form-grid service-form-grid">
              <label className="wide">
                <span>{t('admin.services.editor.field.metaTitle')}</span>
                <input value={serviceForm.metaTitle} onChange={(event) => onUpdateServiceForm('metaTitle', event.target.value)} />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.field.metaDescription')}</span>
                <input value={serviceForm.metaDescription} onChange={(event) => onUpdateServiceForm('metaDescription', event.target.value)} />
              </label>
            </div>
          </section>
        )}

        {activeTab === 'orders' && selectedServiceId && (
          <div className="admin-panel-subsection" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
            <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
              <h3>{t('admin.services.editor.recentOrders')}</h3>
              <span>{t('admin.services.editor.orderCount', { count: serviceOrders.length })}</span>
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
              {selectedServiceCategories.length === 0 && serviceOrders.length === 0 && <AdminEmptyState message={t('admin.services.editor.noRecentData')} />}
            </div>
          </div>
        )}

        {activeTab === 'credentials' && selectedServiceId && isAccountStock && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>{t('admin.services.editor.serviceCredentials')}</h4>
              <span>{t('admin.services.editor.credentialSummary', { available: availableCredentials, delivered: deliveredCredentials })}</span>
            </div>
            <div className="service-credential-selector">
              <SearchField
                value={credentialFilters.query}
                onChange={(event) => onUpdateCredentialFilter('query', event.target.value)}
                placeholder={t('admin.services.editor.searchCredential')}
              />
              <select value={selectedCredentialId} onChange={(event) => setSelectedCredentialId(event.target.value)}>
                <option value="">{t('admin.services.editor.selectCredential')}</option>
                {filteredCredentials.map((credential) => (
                  <option key={credential.id} value={credential.id}>
                    {credential.loginIdentifier} — {getCredentialStatusLabel(credential.status)}
                  </option>
                ))}
              </select>
              <button type="button" className="admin-icon-button" onClick={() => navigate('/admin/account-inventory')}>
                <KeyRound size={16} /> {t('admin.services.editor.openInventory')}
              </button>
            </div>
            <p className="service-credential-selector-note">
              {t('admin.services.editor.inventoryNote')}
            </p>
          </section>
        )}

        {activeTab === '__legacy_credentials' && selectedServiceId && isAccountStock && (
          <section className="service-editor-section">
            <div className="service-section-title">
              <h4>{t('admin.services.editor.legacyCredentials.title')}</h4>
              <span>{t('admin.services.editor.legacyCredentials.subtitle', { available: availableCredentials, delivered: deliveredCredentials })}</span>
            </div>
            <div className="service-credential-flow">
              <strong>{t('admin.services.editor.legacyCredentials.flowLabel')}:</strong>
              <span>{t('admin.services.editor.legacyCredentials.flowAvailable')}</span>
              <span>{t('admin.services.editor.legacyCredentials.flowCheckout')}</span>
              <span>{t('admin.services.editor.legacyCredentials.flowOrder')}</span>
              <span>{t('admin.services.editor.legacyCredentials.flowDelivered')}</span>
            </div>

            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <select
                value={credentialFilters.status}
                onChange={(event) => onUpdateCredentialFilter('status', event.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
              >
                <option value="">{t('admin.common.allStatus')}</option>
                <option value="AVAILABLE">{t('status.AVAILABLE')}</option>
                <option value="RESERVED">{t('status.RESERVED')}</option>
                <option value="DELIVERED">{t('status.DELIVERED')}</option>
                <option value="REPLACED">{t('status.REPLACED')}</option>
                <option value="REFUNDED">{t('status.REFUNDED')}</option>
                <option value="DISABLED">{t('status.DISABLED')}</option>
                <option value="EXPIRED">{t('status.EXPIRED')}</option>
              </select>
              <SearchField
                size="compact"
                value={credentialFilters.query}
                onChange={(event) => onUpdateCredentialFilter('query', event.target.value)}
                placeholder={t('admin.services.editor.legacyCredentials.searchPlaceholder')}
                style={{ flex: 1, minWidth: '120px' }}
              />
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                {t('admin.services.editor.legacyCredentials.createdFrom')}
                <input
                  type="datetime-local"
                  value={credentialFilters.createdFrom}
                  onChange={(event) => onUpdateCredentialFilter('createdFrom', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                {t('admin.services.editor.legacyCredentials.createdTo')}
                <input
                  type="datetime-local"
                  value={credentialFilters.createdTo}
                  onChange={(event) => onUpdateCredentialFilter('createdTo', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                {t('admin.services.editor.legacyCredentials.deliveredFrom')}
                <input
                  type="datetime-local"
                  value={credentialFilters.deliveredFrom}
                  onChange={(event) => onUpdateCredentialFilter('deliveredFrom', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                {t('admin.services.editor.legacyCredentials.deliveredTo')}
                <input
                  type="datetime-local"
                  value={credentialFilters.deliveredTo}
                  onChange={(event) => onUpdateCredentialFilter('deliveredTo', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '3px', fontSize: '11px', color: 'var(--kd-muted)' }}>
                {t('admin.services.editor.legacyCredentials.expiresBefore')}
                <input
                  type="datetime-local"
                  value={credentialFilters.expiresBefore}
                  onChange={(event) => onUpdateCredentialFilter('expiresBefore', event.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--kd-border)', fontSize: '12px', background: 'var(--kd-card-bg)' }}
                />
              </label>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={onApplyCredentialFilters} style={{ height: '30px', minHeight: '30px', fontSize: '12px' }}>
                <RefreshCw size={14} /> <span>{t('admin.common.filter')}</span>
              </button>
              <button type="button" className="admin-icon-button" disabled={submitting} onClick={onResetCredentialFilters} style={{ height: '30px', minHeight: '30px', fontSize: '12px' }}>
                <X size={14} /> <span>{t('admin.common.clearFilter')}</span>
              </button>
              <span style={{ fontSize: '12px', color: 'var(--kd-muted)', whiteSpace: 'nowrap' }}>{t('admin.services.editor.legacyCredentials.showingCount', { count: filteredCredentials.length })}</span>
            </div>

            {/* Create/Edit credential form */}
            <div className="admin-form-grid service-form-grid" style={{ borderBottom: '1px solid var(--kd-border)', paddingBottom: '12px', marginBottom: '12px' }}>
              <label>
                <span>{t('admin.services.editor.legacyCredentials.loginLabel')}</span>
                <input value={credentialForm.loginIdentifier} onChange={(event) => onUpdateCredentialForm('loginIdentifier', event.target.value)} placeholder="Email, username hoặc số điện thoại đăng nhập" required />
              </label>
              <label>
                <span>{t('admin.services.editor.legacyCredentials.passwordLabel')}</span>
                <input value={credentialForm.passwordSecret} onChange={(event) => onUpdateCredentialForm('passwordSecret', event.target.value)} placeholder={editingCredentialId ? 'Để trống nếu không đổi mật khẩu' : 'Mật khẩu đăng nhập'} required={!editingCredentialId} />
              </label>
              <label>
                <span>{t('admin.services.editor.legacyCredentials.recoveryLabel')}</span>
                <input value={credentialForm.recoveryInfo} onChange={(event) => onUpdateCredentialForm('recoveryInfo', event.target.value)} placeholder="Thông tin khôi phục nếu có" />
              </label>
              <label>
                <span>{t('admin.services.editor.legacyCredentials.twoFALabel')}</span>
                <input value={credentialForm.twoFactorSecret} onChange={(event) => onUpdateCredentialForm('twoFactorSecret', event.target.value)} placeholder="Mã 2FA hoặc secret" />
              </label>
              <label>
                <span>{t('admin.services.editor.legacyCredentials.expiresLabel')}</span>
                <input type="datetime-local" value={credentialForm.expiresAt} onChange={(event) => onUpdateCredentialForm('expiresAt', event.target.value)} />
              </label>
              <label>
                <span>{t('admin.services.editor.legacyCredentials.warrantyLabel')}</span>
                <input type="datetime-local" value={credentialForm.warrantyUntil} onChange={(event) => onUpdateCredentialForm('warrantyUntil', event.target.value)} />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.legacyCredentials.usageNoteLabel')}</span>
                <textarea value={credentialForm.usageNote} onChange={(event) => onUpdateCredentialForm('usageNote', event.target.value)} rows="2" placeholder="Ví dụ: không đổi mật khẩu trong 24h đầu, đăng nhập đúng khu vực..." />
              </label>
              <label className="wide">
                <span>{t('admin.services.editor.legacyCredentials.internalNoteLabel')}</span>
                <textarea value={credentialForm.internalNote} onChange={(event) => onUpdateCredentialForm('internalNote', event.target.value)} rows="2" placeholder="Nguồn hàng, chi phí, lưu ý bảo hành..." />
              </label>
            </div>
            <div className="admin-action-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="admin-primary-button" disabled={submitting} onClick={onCreateCredential} style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                <KeyRound size={16} />
                <span>{editingCredentialId ? t('admin.services.editor.legacyCredentials.updateCredential') : t('admin.services.editor.legacyCredentials.addCredential')}</span>
              </button>
              {editingCredentialId && (
                <button type="button" className="admin-icon-button" onClick={() => onStartEditCredential(null)} style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                  <X size={16} /> <span>{t('admin.services.editor.legacyCredentials.cancelEdit')}</span>
                </button>
              )}
            </div>

            {/* Bulk import */}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--kd-border)', paddingTop: '12px' }}>
              <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
                <h3>{t('admin.services.editor.legacyCredentials.bulkImportTitle')}</h3>
                <FileUp size={18} strokeWidth={2} aria-hidden="true" />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--kd-muted)', margin: '0 0 8px' }}>
                {t('admin.services.editor.legacyCredentials.csvFormat')}
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
                  <span>{bulkSubmitting ? t('admin.services.editor.legacyCredentials.importing') : t('admin.services.editor.legacyCredentials.importBtn')}</span>
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
                        <Eye size={15} /> <span>{t('admin.services.editor.legacyCredentials.reveal')}</span>
                      </button>
                    )}
                    {credential.status === 'AVAILABLE' && (
                      <>
                        <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onStartEditCredential(credential)} style={{ height: '30px', minHeight: '30px', fontSize: '12px', width: 'fit-content' }}>
                          <Pencil size={15} /> <span>{t('admin.common.edit')}</span>
                        </button>
                        <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onDisableCredential(credential)} style={{ height: '30px', minHeight: '30px', fontSize: '12px', width: 'fit-content' }}>
                          <ShieldOff size={15} /> <span>{t('admin.services.editor.legacyCredentials.lock')}</span>
                        </button>
                      </>
                    )}
                  </div>
                </article>
              )})}
              {filteredCredentials.length === 0 && <AdminEmptyState message={credentialFilters.status || credentialFilters.query ? t('admin.services.editor.legacyCredentials.noFilteredCredential') : t('admin.services.editor.legacyCredentials.noCredential')} />}
            </div>
          </section>
        )}
      </div>
    </form>
  )
}

export default ServiceEditor
