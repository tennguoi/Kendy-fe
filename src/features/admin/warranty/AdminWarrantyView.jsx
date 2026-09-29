import { RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import AdminDrawer from '../AdminDrawer'
import Pagination from '../../../components/Pagination/Pagination'
import Loading from '../../../components/Loading/Loading'
import BaseInput from '../../../components/ui/BaseInput'
import BaseSelect from '../../../components/ui/BaseSelect'
import BaseTextarea from '../../../components/ui/BaseTextarea'
import { formatAdminDate } from '../adminFormat'
import { isRequired, composeValidators } from '../../../utils/validation'

const WARRANTY_STATUS_COLORS = {
  OPEN: '#ffc107',
  REVIEWING: '#17a2b8',
  APPROVED_REPLACE: '#28a745',
  APPROVED_REFUND: '#007bff',
  REJECTED: '#dc3545',
  RESOLVED: '#6c757d',
}

const EMPTY_FORM = { status: 'OPEN', replacementCredentialId: '', adminNote: '' }

function WarrantyStatusBadge({ labels, status }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
      fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
      background: WARRANTY_STATUS_COLORS[status] || '#6c757d', color: '#fff',
    }}>
      {labels[status] || status}
    </span>
  )
}

function AdminWarrantyView({ onSetError, onSetNotice, token }) {
  const { t } = useTranslation()

  const WARRANTY_STATUS_LABELS = {
    OPEN: t('admin.warranty.status.OPEN'),
    REVIEWING: t('admin.warranty.status.REVIEWING'),
    APPROVED_REPLACE: t('admin.warranty.status.APPROVED_REPLACE'),
    APPROVED_REFUND: t('admin.warranty.status.APPROVED_REFUND'),
    REJECTED: t('admin.warranty.status.REJECTED'),
    RESOLVED: t('admin.warranty.status.RESOLVED'),
  }

  const [allRequests, setAllRequests] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  // Validation for review form
  const validateStatus = composeValidators(isRequired)
  const validateAdminNoteWhenRequired = (value) => {
    // Only required for REJECTED and APPROVED_REFUND statuses
    if (reviewForm.status === 'REJECTED' || reviewForm.status === 'APPROVED_REFUND') {
      if (!value || !value.trim()) {
        return { isValid: false, error: t('admin.warranty.review.requiredNote') }
      }
    }
    return { isValid: true }
  }

  const loadRequests = useCallback(async (page) => {
    if (!token) return
    const targetPage = typeof page === 'number' ? page : currentPage
    setLoading(true)
    setViewError('')
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const data = await adminApi.getWarranties(token, { ...params, page: targetPage })
      const { items, totalPages: pages } = normalizePaged(data, 50)
      setAllRequests(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
    } catch (err) {
      setViewError(err.message || t('admin.warranty.loadError'))
    } finally {
      setLoading(false)
    }
  }, [currentPage, setViewError, statusFilter, token])

  useEffect(() => { setCurrentPage(0) }, [statusFilter])

  useEffect(() => { loadRequests() }, [loadRequests])

  const filteredRequests = statusFilter
    ? allRequests.filter((r) => r.status === statusFilter)
    : allRequests

  const selectRequest = (request) => {
    setSelectedRequest(request)
    setReviewForm(EMPTY_FORM)
    setDrawerOpen(true)
  }

  const handleReview = async (event) => {
    event.preventDefault()

    // Validate form
    const statusValidation = validateStatus(reviewForm.status)
    const adminNoteValidation = validateAdminNoteWhenRequired(reviewForm.adminNote)

    if (!statusValidation.isValid) {
      setViewError(statusValidation.error || t('admin.warranty.review.requiredStatus'))
      return
    }

    if (!adminNoteValidation.isValid) {
      setViewError(adminNoteValidation.error)
      return
    }

    if (!selectedRequest) return
    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        status: reviewForm.status,
        adminNote: reviewForm.adminNote.trim() || null,
        replacementCredentialId: reviewForm.replacementCredentialId
          ? Number(reviewForm.replacementCredentialId)
          : null,
      }
      const saved = await adminApi.reviewWarranty(selectedRequest.id, payload, token)
      setAllRequests((items) =>
        items.map((item) => (item.id === saved.id ? saved : item))
      )
      setSelectedRequest(saved)
      onSetNotice(t('admin.warranty.updateSuccess'))
    } catch (err) {
      setViewError(err.message || t('admin.warranty.updateError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div className="admin-toolbar-info">
          <div>
            <h2>{t('admin.warranty.title')}</h2>
          </div>
          {allRequests.length > 0 && (
            <div className="admin-quick-stats">
              <span className="admin-quick-stat">
                <strong>{allRequests.filter((r) => r.status === 'OPEN' || r.status === 'REVIEWING').length}</strong> {t('admin.warranty.processing')}
              </span>
            </div>
          )}
        </div>
        <button type="button" className={`admin-icon-button ${loading ? 'loading' : ''}`} onClick={loadRequests} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>{t('admin.warranty.reload')}</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <Search size={16} style={{ color: 'var(--kd-muted)' }} />
        <BaseSelect
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          options={[
            { value: '', label: t('admin.warranty.filter.allStatus') },
            ...Object.entries(WARRANTY_STATUS_LABELS).map(([value, label]) => ({
              value: value,
              label: label
            }))
          ]}
          validators={[]} // Status filter is optional
          placeholder={t('admin.warranty.filter.allStatus')}
          style={{
            minWidth: '150px'
          }}
        />
        <span style={{ fontSize: '13px', color: 'var(--kd-muted)' }}>
          {filteredRequests.length} {t('admin.warranty.filter.requests')}
        </span>
      </div>

      {!error && loading && <Loading fullScreen={false} message={t('admin.warranty.loading')} subMessage="" />}

      <div className="admin-mini-list">
        {filteredRequests.map((request) => (
          <article
            key={request.id}
            onClick={() => selectRequest(request)}
            style={{
              cursor: 'pointer',
              borderLeft: `4px solid ${WARRANTY_STATUS_COLORS[request.status] || '#6c757d'}`,
              background: selectedRequest?.id === request.id ? 'var(--kd-hover-bg, #f0f4f8)' : undefined,
            }}
          >
            <strong>{request.orderCode}</strong>
            <span>
              <WarrantyStatusBadge labels={WARRANTY_STATUS_LABELS} status={request.status} />
              {' · '}{request.serviceName}
              {' · '}{formatAdminDate(request.createdAt)}
            </span>
            <small style={{ color: 'var(--kd-muted)' }}>
              {request.reason?.substring(0, 120)}{request.reason?.length > 120 ? '...' : ''}
            </small>
          </article>
        ))}
        {filteredRequests.length === 0 && !loading && (
          <p className="admin-empty-state">{t('admin.warranty.detail.empty')}</p>
        )}
      </div>

      <Pagination
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPageChange={(page) => loadRequests(page - 1)}
      />

      <AdminDrawer
        isOpen={drawerOpen && Boolean(selectedRequest)}
        onClose={() => setDrawerOpen(false)}
        title={t('admin.warranty.drawerTitle', { code: selectedRequest?.orderCode || '' })}
        width="580px"
      >
        {selectedRequest && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <dl className="admin-detail-list">
              <div><dt>{t('admin.warranty.detail.orderCode')}</dt><dd>{selectedRequest.orderCode}</dd></div>
              <div><dt>{t('admin.warranty.detail.service')}</dt><dd>{selectedRequest.serviceName}</dd></div>
              <div><dt>{t('admin.warranty.detail.userId')}</dt><dd>#{selectedRequest.userId}</dd></div>
              <div><dt>{t('admin.warranty.detail.status')}</dt><dd><WarrantyStatusBadge labels={WARRANTY_STATUS_LABELS} status={selectedRequest.status} /></dd></div>
              <div><dt>{t('admin.warranty.detail.createdAt')}</dt><dd>{formatAdminDate(selectedRequest.createdAt)}</dd></div>
              {selectedRequest.resolvedAt && (
                <div><dt>{t('admin.warranty.detail.resolvedAt')}</dt><dd>{formatAdminDate(selectedRequest.resolvedAt)}</dd></div>
              )}
            </dl>

            <div className="admin-code-block">
              <strong>{t('admin.warranty.detail.reason')}</strong>
              <pre>{selectedRequest.reason || t('admin.warranty.detail.noReason')}</pre>
            </div>
            {selectedRequest.evidenceText && (
              <div className="admin-code-block">
                <strong>{t('admin.warranty.detail.evidence')}</strong>
                <pre>{selectedRequest.evidenceText}</pre>
              </div>
            )}
            {selectedRequest.adminNote && (
              <div className="admin-code-block">
                <strong>{t('admin.warranty.detail.adminNote')}</strong>
                <pre>{selectedRequest.adminNote}</pre>
              </div>
            )}
            {selectedRequest.originalCredentialId && (
              <div className="admin-code-block">
                <strong>{t('admin.warranty.detail.originalCredential')}</strong>
                <pre>ID: {selectedRequest.originalCredentialId}</pre>
              </div>
            )}
            {selectedRequest.replacementCredentialId && (
              <div className="admin-code-block">
                <strong>{t('admin.warranty.detail.replacementCredential')}</strong>
                <pre>ID: {selectedRequest.replacementCredentialId}</pre>
              </div>
            )}
            {selectedRequest.refundWalletTransactionId && (
              <div className="admin-code-block">
                <strong>{t('admin.warranty.detail.refundTransaction')}</strong>
                <pre>Transaction ID: {selectedRequest.refundWalletTransactionId}</pre>
              </div>
            )}

            {selectedRequest.status !== 'REJECTED' && selectedRequest.status !== 'APPROVED_REPLACE'
              && selectedRequest.status !== 'APPROVED_REFUND' && selectedRequest.status !== 'RESOLVED' && (
                <form onSubmit={handleReview} className="admin-form compact" style={{ borderTop: '1px solid var(--kd-border)', paddingTop: '16px' }}>
                  <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
                    <h3>{t('admin.warranty.review.title')}</h3>
                  </div>
                  <BaseSelect
                    label={t('admin.warranty.review.actionLabel')}
                    value={reviewForm.status}
                    onChange={(value) => setReviewForm((f) => ({ ...f, status: value }))}
                    options={[
                      { value: '', label: t('admin.warranty.review.selectAction') },
                      { value: 'REVIEWING', label: t('admin.warranty.review.actionReviewing') },
                      { value: 'APPROVED_REPLACE', label: t('admin.warranty.review.actionReplace') },
                      { value: 'APPROVED_REFUND', label: t('admin.warranty.review.actionRefund') },
                      { value: 'REJECTED', label: t('admin.warranty.review.actionReject') }
                    ]}
                    validators={[validateStatus]}
                    errorMessage={t('admin.warranty.review.requiredStatus')}
                    required
                  />
                  {reviewForm.status === 'APPROVED_REPLACE' && (
                    <BaseInput
                      label={t('admin.warranty.review.credentialIdLabel')}
                      value={reviewForm.replacementCredentialId}
                      onChange={(value) => setReviewForm((f) => ({ ...f, replacementCredentialId: value }))}
                      placeholder={t('admin.warranty.review.credentialIdPlaceholder')}
                      inputMode="numeric"
                      validators={[]} // Credential ID is optional
                    />
                  )}
                  <BaseTextarea
                    label={t('admin.warranty.detail.adminNote')}
                    value={reviewForm.adminNote}
                    onChange={(value) => setReviewForm((f) => ({ ...f, adminNote: value }))}
                    rows="3"
                    placeholder={t('admin.warranty.review.adminNotePlaceholder')}
                    validators={[validateAdminNoteWhenRequired]}
                    errorMessage={reviewForm.status === 'REJECTED' || reviewForm.status === 'APPROVED_REFUND'
                      ? t('admin.warranty.review.requiredNote')
                      : ''}
                  />
                  <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                    {submitting ? t('admin.warranty.review.submitting') : t('admin.warranty.review.submit')}
                  </button>
                </form>
              )}
          </div>
        )}
      </AdminDrawer>
    </section>
  )
}

export default AdminWarrantyView