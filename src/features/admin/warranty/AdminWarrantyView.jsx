import { RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import AdminDrawer from '../AdminDrawer'
import Loading from '../../../components/Loading/Loading'
import { formatAdminDate } from '../adminFormat'

const WARRANTY_STATUS_LABELS = {
  OPEN: 'Mở',
  REVIEWING: 'Đang xem xét',
  APPROVED_REPLACE: 'Đã duyệt đổi',
  APPROVED_REFUND: 'Đã duyệt hoàn tiền',
  REJECTED: 'Từ chối',
  RESOLVED: 'Đã xử lý',
}

const WARRANTY_STATUS_COLORS = {
  OPEN: '#ffc107',
  REVIEWING: '#17a2b8',
  APPROVED_REPLACE: '#28a745',
  APPROVED_REFUND: '#007bff',
  REJECTED: '#dc3545',
  RESOLVED: '#6c757d',
}

function WarrantyStatusBadge({ status }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
      fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
      background: WARRANTY_STATUS_COLORS[status] || '#6c757d', color: '#fff',
    }}>
      {WARRANTY_STATUS_LABELS[status] || status}
    </span>
  )
}

const EMPTY_FORM = { status: 'OPEN', replacementCredentialId: '', adminNote: '' }

function AdminWarrantyView({ onSetError, onSetNotice, token }) {
  const [allRequests, setAllRequests] = useState([])
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

  const loadRequests = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setViewError('')
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const data = await adminApi.getWarranties(token, params)
      setAllRequests(data)
    } catch (err) {
      setViewError(err.message || 'Không tải được danh sách bảo hành.')
    } finally {
      setLoading(false)
    }
  }, [setViewError, statusFilter, token])

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
    if (!selectedRequest || !reviewForm.status) return
    if ((reviewForm.status === 'REJECTED' || reviewForm.status === 'APPROVED_REFUND') && !reviewForm.adminNote.trim()) {
      setViewError('Nhập ghi chú admin khi từ chối hoặc hoàn tiền.')
      return
    }
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
      onSetNotice('Đã cập nhật yêu cầu bảo hành.')
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được yêu cầu bảo hành.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div className="admin-toolbar-info">
          <div>
            <h2>Quản lý bảo hành</h2>
          </div>
          {allRequests.length > 0 && (
            <div className="admin-quick-stats">
              <span className="admin-quick-stat">
                <strong>{allRequests.filter((r) => r.status === 'OPEN' || r.status === 'REVIEWING').length}</strong> đang xử lý
              </span>
            </div>
          )}
        </div>
        <button type="button" className={`admin-icon-button ${loading ? 'loading' : ''}`} onClick={loadRequests} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <Search size={16} style={{ color: 'var(--kd-muted)' }} />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{
            padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--kd-border)',
            fontSize: '13px', background: 'var(--kd-card-bg)',
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(WARRANTY_STATUS_LABELS).map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
        <span style={{ fontSize: '13px', color: 'var(--kd-muted)' }}>
          {filteredRequests.length} yêu cầu
        </span>
      </div>

      {!error && loading && <Loading fullScreen={false} message="Đang tải..." subMessage="" />}

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
              <WarrantyStatusBadge status={request.status} />
              {' · '}{request.serviceName}
              {' · '}{formatAdminDate(request.createdAt)}
            </span>
            <small style={{ color: 'var(--kd-muted)' }}>
              {request.reason?.substring(0, 120)}{request.reason?.length > 120 ? '...' : ''}
            </small>
          </article>
        ))}
        {filteredRequests.length === 0 && !loading && (
          <p className="admin-empty-state">Chưa có yêu cầu bảo hành nào.</p>
        )}
      </div>

      <AdminDrawer
        isOpen={drawerOpen && Boolean(selectedRequest)}
        onClose={() => setDrawerOpen(false)}
        title={`Bảo hành ${selectedRequest?.orderCode || ''}`}
        width="580px"
      >
        {selectedRequest && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <dl className="admin-detail-list">
              <div><dt>Đơn hàng</dt><dd>{selectedRequest.orderCode}</dd></div>
              <div><dt>Dịch vụ</dt><dd>{selectedRequest.serviceName}</dd></div>
              <div><dt>User ID</dt><dd>#{selectedRequest.userId}</dd></div>
              <div><dt>Trạng thái</dt><dd><WarrantyStatusBadge status={selectedRequest.status} /></dd></div>
              <div><dt>Ngày tạo</dt><dd>{formatAdminDate(selectedRequest.createdAt)}</dd></div>
              {selectedRequest.resolvedAt && (
                <div><dt>Xử lý lúc</dt><dd>{formatAdminDate(selectedRequest.resolvedAt)}</dd></div>
              )}
            </dl>

            <div className="admin-code-block">
              <strong>Lý do</strong>
              <pre>{selectedRequest.reason || 'Không có'}</pre>
            </div>
            {selectedRequest.evidenceText && (
              <div className="admin-code-block">
                <strong>Bằng chứng</strong>
                <pre>{selectedRequest.evidenceText}</pre>
              </div>
            )}
            {selectedRequest.adminNote && (
              <div className="admin-code-block">
                <strong>Ghi chú admin</strong>
                <pre>{selectedRequest.adminNote}</pre>
              </div>
            )}
            {selectedRequest.originalCredentialId && (
              <div className="admin-code-block">
                <strong>Credential gốc</strong>
                <pre>ID: {selectedRequest.originalCredentialId}</pre>
              </div>
            )}
            {selectedRequest.replacementCredentialId && (
              <div className="admin-code-block">
                <strong>Credential thay thế</strong>
                <pre>ID: {selectedRequest.replacementCredentialId}</pre>
              </div>
            )}
            {selectedRequest.refundWalletTransactionId && (
              <div className="admin-code-block">
                <strong>Giao dịch hoàn tiền</strong>
                <pre>Transaction ID: {selectedRequest.refundWalletTransactionId}</pre>
              </div>
            )}

            {selectedRequest.status !== 'REJECTED' && selectedRequest.status !== 'APPROVED_REPLACE'
              && selectedRequest.status !== 'APPROVED_REFUND' && selectedRequest.status !== 'RESOLVED' && (
                <form onSubmit={handleReview} className="admin-form compact" style={{ borderTop: '1px solid var(--kd-border)', paddingTop: '16px' }}>
                  <div className="admin-panel-head compact-head" style={{ marginTop: 0 }}>
                    <h3>Xử lý yêu cầu</h3>
                  </div>
                  <label>
                    <span>Hành động</span>
                    <select
                      value={reviewForm.status}
                      onChange={(event) => setReviewForm((f) => ({ ...f, status: event.target.value }))}
                      required
                    >
                      <option value="">Chọn hành động...</option>
                      <option value="REVIEWING">Đánh dấu đang xem xét</option>
                      <option value="APPROVED_REPLACE">Duyệt đổi tài khoản</option>
                      <option value="APPROVED_REFUND">Duyệt hoàn tiền</option>
                      <option value="REJECTED">Từ chối</option>
                    </select>
                  </label>
                  {reviewForm.status === 'APPROVED_REPLACE' && (
                    <label>
                      <span>ID credential thay thế (để trống nếu tự động lấy từ kho)</span>
                      <input
                        value={reviewForm.replacementCredentialId}
                        onChange={(event) => setReviewForm((f) => ({ ...f, replacementCredentialId: event.target.value }))}
                        placeholder="Nhập credential ID hoặc để trống"
                        inputMode="numeric"
                      />
                    </label>
                  )}
                  <label>
                    <span>Ghi chú admin</span>
                    <textarea
                      value={reviewForm.adminNote}
                      onChange={(event) => setReviewForm((f) => ({ ...f, adminNote: event.target.value }))}
                      rows="3"
                      placeholder="Lý do duyệt / từ chối, hướng dẫn thêm..."
                    />
                  </label>
                  <button type="submit" disabled={submitting} className="admin-primary-button" style={{ height: '34px', minHeight: '34px', fontSize: '13px' }}>
                    {submitting ? 'Đang xử lý...' : 'Xác nhận'}
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
