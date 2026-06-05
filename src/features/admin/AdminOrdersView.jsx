import { Ban, CircleCheck, CircleX, RefreshCw, RotateCcw, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../api/admin.api'
import { AdminEmptyState, AdminStatusBadge } from './AdminShared'
import { formatAdminDate, formatAdminMoney } from './adminFormat'

const orderStatuses = ['', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']

function safeBlock(value) {
  if (!value) {
    return 'Chưa có dữ liệu'
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function formFromOrder(order) {
  return {
    adminNote: order?.adminNote || '',
    minutes: '60',
    orderCode: order?.orderCode || '',
    reason: '',
    resultData: order?.resultData || '',
    userNote: order?.userNote || '',
  }
}

function AdminOrdersView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [draft, setDraft] = useState(null)
  const [bulkRefundCodes, setBulkRefundCodes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedOrder = orders.find((order) => order.id === selectedId) || orders[0]
  const orderForm = selectedOrder && draft?.orderCode === selectedOrder.orderCode
    ? draft
    : formFromOrder(selectedOrder)
  const activeOrder = selectedOrder && ['PENDING', 'PROCESSING'].includes(selectedOrder.status)
  const refundableOrder = selectedOrder && !['CANCELLED', 'REFUNDED'].includes(selectedOrder.status)

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadOrders = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
    try {
      const data = await adminApi.searchOrders({ query: query.trim(), status: statusFilter }, token)
      setOrders(data)
      setSelectedId((current) => (current && data.some((item) => item.id === current) ? current : data[0]?.id || null))
    } catch (err) {
      setViewError(err.message || 'Không tải được danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }, [query, setViewError, statusFilter, token])

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, 250)
    return () => window.clearTimeout(timer)
  }, [loadOrders])

  useEffect(() => {
    if (!token || !selectedOrder?.orderCode) {
      return
    }

    let active = true
    async function loadOrderDetail() {
      try {
        const detail = await adminApi.getOrder(selectedOrder.orderCode, token)
        if (active) {
          setOrders((items) => {
            if (items.some((item) => item.id === detail.id)) {
              return items.map((item) => (item.id === detail.id ? detail : item))
            }

            return [detail, ...items]
          })
        }
      } catch {
        // The list row is still usable if the detail refresh fails.
      }
    }

    loadOrderDetail()
    return () => {
      active = false
    }
  }, [selectedOrder?.orderCode, token])

  const selectOrder = (orderId) => {
    setSelectedId(orderId)
    setDraft(null)
  }

  const updateDraft = (field, value) => {
    if (!selectedOrder) {
      return
    }

    setDraft((current) => {
      const base = current?.orderCode === selectedOrder.orderCode ? current : formFromOrder(selectedOrder)
      return { ...base, [field]: value }
    })
  }

  const patchOrder = (saved) => {
    setOrders((items) => {
      if (items.some((item) => item.id === saved.id)) {
        return items.map((item) => (item.id === saved.id ? saved : item))
      }

      return [saved, ...items]
    })
  }

  const runOrderAction = async (action) => {
    if (!selectedOrder) {
      return
    }

    if ((action === 'cancel' || action === 'refund' || action === 'extend' || action === 'reprocess') && !orderForm.reason.trim()) {
      setViewError('Nhập lý do trước khi hủy, refund, gia hạn hoặc chạy lại đơn.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        adminNote: orderForm.adminNote.trim(),
        resultData: orderForm.resultData.trim(),
      }
      const reasonPayload = { reason: orderForm.reason.trim() }
      let saved

      if (action === 'complete') {
        saved = await adminApi.completeOrder(selectedOrder.orderCode, payload, token)
      } else if (action === 'fail') {
        saved = await adminApi.failOrder(selectedOrder.orderCode, payload, token)
      } else if (action === 'cancel') {
        saved = await adminApi.cancelOrder(selectedOrder.orderCode, reasonPayload, token)
      } else if (action === 'extend') {
        saved = await adminApi.extendOrder(selectedOrder.orderCode, {
          minutes: Number(orderForm.minutes) || 60,
          reason: orderForm.reason.trim(),
        }, token)
      } else if (action === 'reprocess') {
        saved = await adminApi.reprocessOrder(selectedOrder.orderCode, reasonPayload, token)
      } else {
        saved = await adminApi.refundOrder(selectedOrder.orderCode, reasonPayload, token)
      }

      patchOrder(saved)
      setDraft(formFromOrder(saved))
      await loadOrders()
      onSetNotice(`Đã cập nhật đơn ${saved.orderCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được đơn hàng.')
    } finally {
      setSubmitting(false)
    }
  }

  const saveAdminNote = async (event) => {
    event.preventDefault()
    if (!selectedOrder || !orderForm.adminNote.trim()) {
      setViewError('Ghi chú admin không được để trống.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.updateOrderAdminNote(
        selectedOrder.orderCode,
        { note: orderForm.adminNote.trim() },
        token,
      )
      patchOrder(saved)
      setDraft(formFromOrder(saved))
      onSetNotice(`Đã lưu ghi chú cho đơn ${saved.orderCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không lưu được ghi chú đơn hàng.')
    } finally {
      setSubmitting(false)
    }
  }

  const saveUserNote = async (event) => {
    event.preventDefault()
    if (!selectedOrder || !orderForm.userNote.trim()) {
      setViewError('Ghi chú user không được để trống.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.updateOrderUserNote(
        selectedOrder.orderCode,
        { note: orderForm.userNote.trim() },
        token,
      )
      patchOrder(saved)
      setDraft(formFromOrder(saved))
      onSetNotice(`Đã lưu ghi chú user cho đơn ${saved.orderCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không lưu được ghi chú user.')
    } finally {
      setSubmitting(false)
    }
  }

  const runBulkRefund = async (event) => {
    event.preventDefault()
    const orderCodes = bulkRefundCodes
      .split(/[\s,]+/)
      .map((code) => code.trim())
      .filter(Boolean)

    if (orderCodes.length === 0 || !orderForm.reason.trim()) {
      setViewError('Nhập danh sách mã đơn và lý do bulk refund.')
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const savedItems = await adminApi.bulkRefundOrders({ orderCodes, reason: orderForm.reason.trim() }, token)
      savedItems.forEach(patchOrder)
      setBulkRefundCodes('')
      await loadOrders()
      onSetNotice(`Đã refund ${savedItems.length} đơn.`)
    } catch (err) {
      setViewError(err.message || 'Không bulk refund được đơn hàng.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">Orders</span>
          <h2>Quản lý đơn hàng</h2>
        </div>
        <button type="button" className="admin-icon-button" onClick={loadOrders} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {(error || loading) && <p className={error ? 'admin-message error' : 'admin-message'}>{error || 'Đang tải đơn hàng...'}</p>}

      <div className="admin-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, dịch vụ, user id" type="search" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          {orderStatuses.map((status) => (
            <option value={status} key={status || 'all'}>{status || 'Tất cả trạng thái'}</option>
          ))}
        </select>
      </div>

      <div className="admin-grid detail-layout">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Danh sách đơn</h3>
            <span>{orders.length} đơn</span>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-row head orders">
              <span>Đơn hàng</span>
              <span>Dịch vụ</span>
              <span>Số tiền</span>
              <span>Trạng thái</span>
              <span>Thời gian</span>
            </div>
            {orders.map((order) => (
              <button
                type="button"
                className={`admin-data-row orders ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                key={order.id}
                onClick={() => selectOrder(order.id)}
              >
                <span>
                  <strong>{order.orderCode}</strong>
                  <small>User #{order.userId}</small>
                </span>
                <span>{order.serviceName}</span>
                <span>{formatAdminMoney(order.amount)}</span>
                <span><AdminStatusBadge status={order.status} /></span>
                <span>{formatAdminDate(order.createdAt)}</span>
              </button>
            ))}
            {orders.length === 0 && <AdminEmptyState />}
          </div>
        </div>

        <aside className="admin-panel admin-detail-panel">
          <div className="admin-panel-head">
            <h3>{selectedOrder ? selectedOrder.orderCode : 'Chọn đơn'}</h3>
            {selectedOrder && <AdminStatusBadge status={selectedOrder.status} />}
          </div>

          {selectedOrder ? (
            <>
              <dl className="admin-detail-list">
                <div><dt>Dịch vụ</dt><dd>{selectedOrder.serviceName}</dd></div>
                <div><dt>User</dt><dd>#{selectedOrder.userId}</dd></div>
                <div><dt>Số tiền</dt><dd>{formatAdminMoney(selectedOrder.amount)}</dd></div>
                <div><dt>Tạo lúc</dt><dd>{formatAdminDate(selectedOrder.createdAt)}</dd></div>
                <div><dt>Deadline</dt><dd>{formatAdminDate(selectedOrder.processingDeadlineAt)}</dd></div>
                <div><dt>Hoàn thành</dt><dd>{formatAdminDate(selectedOrder.completedAt)}</dd></div>
              </dl>

              <div className="admin-code-block">
                <strong>Input khách gửi</strong>
                <pre>{safeBlock(selectedOrder.inputData)}</pre>
              </div>
              <div className="admin-code-block">
                <strong>Kết quả xử lý</strong>
                <pre>{safeBlock(selectedOrder.resultData)}</pre>
              </div>
              <div className="admin-code-block">
                <strong>Ghi chú admin</strong>
                <pre>{selectedOrder.adminNote || 'Chưa có ghi chú'}</pre>
              </div>
              <div className="admin-code-block">
                <strong>Ghi chú user</strong>
                <pre>{selectedOrder.userNote || 'Chưa có ghi chú'}</pre>
              </div>

              <form className="admin-form compact order-action-form" onSubmit={(event) => event.preventDefault()}>
                <div className="admin-panel-head compact-head">
                  <h3>Xử lý đơn</h3>
                  <span>{activeOrder ? 'Đơn còn thao tác' : 'Trạng thái đã khóa'}</span>
                </div>
                <label>
                  <span>Kết quả hoặc lý do lỗi</span>
                  <textarea
                    value={orderForm.resultData}
                    onChange={(event) => updateDraft('resultData', event.target.value)}
                    placeholder="Nhập kết quả trả khách hoặc mô tả lỗi xử lý"
                    rows="4"
                  />
                </label>
                <label>
                  <span>Lý do hủy/refund</span>
                  <textarea
                    value={orderForm.reason}
                    onChange={(event) => updateDraft('reason', event.target.value)}
                    placeholder="Bắt buộc khi hủy đơn hoặc refund"
                    rows="3"
                  />
                </label>
                <label>
                  <span>Số phút gia hạn</span>
                  <input
                    value={orderForm.minutes}
                    onChange={(event) => updateDraft('minutes', event.target.value)}
                    inputMode="numeric"
                    placeholder="60"
                  />
                </label>
                <div className="admin-action-row">
                  <button type="button" className="admin-icon-button" disabled={submitting || !activeOrder} onClick={() => runOrderAction('complete')}>
                    <CircleCheck size={17} strokeWidth={2} aria-hidden="true" />
                    <span>Hoàn thành</span>
                  </button>
                  <button type="button" className="admin-icon-button" disabled={submitting || !activeOrder} onClick={() => runOrderAction('fail')}>
                    <CircleX size={17} strokeWidth={2} aria-hidden="true" />
                    <span>Báo lỗi</span>
                  </button>
                  <button type="button" className="admin-danger-button" disabled={submitting || !activeOrder} onClick={() => runOrderAction('cancel')}>
                    <Ban size={17} strokeWidth={2} aria-hidden="true" />
                    <span>Hủy & hoàn</span>
                  </button>
                  <button type="button" className="admin-danger-button" disabled={submitting || !refundableOrder} onClick={() => runOrderAction('refund')}>
                    <RotateCcw size={17} strokeWidth={2} aria-hidden="true" />
                    <span>Refund</span>
                  </button>
                  <button type="button" className="admin-icon-button" disabled={submitting || !activeOrder} onClick={() => runOrderAction('extend')}>
                    <RefreshCw size={17} strokeWidth={2} aria-hidden="true" />
                    <span>Gia hạn</span>
                  </button>
                  <button type="button" className="admin-icon-button" disabled={submitting || selectedOrder.status === 'REFUNDED'} onClick={() => runOrderAction('reprocess')}>
                    <RotateCcw size={17} strokeWidth={2} aria-hidden="true" />
                    <span>Chạy lại</span>
                  </button>
                </div>
              </form>

              <form className="admin-form compact" onSubmit={saveAdminNote}>
                <div className="admin-panel-head compact-head">
                  <h3>Ghi chú nội bộ</h3>
                  <Save size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <label>
                  <span>Note admin</span>
                  <textarea
                    value={orderForm.adminNote}
                    onChange={(event) => updateDraft('adminNote', event.target.value)}
                    placeholder="Ghi chú chỉ dành cho quản trị"
                    rows="3"
                    required
                  />
                </label>
                <button type="submit" disabled={submitting}>
                  <Save size={17} strokeWidth={2} aria-hidden="true" />
                  <span>Lưu note</span>
                </button>
              </form>

              <form className="admin-form compact" onSubmit={saveUserNote}>
                <div className="admin-panel-head compact-head">
                  <h3>Ghi chú cho user</h3>
                  <Save size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <label>
                  <span>User note</span>
                  <textarea
                    value={orderForm.userNote}
                    onChange={(event) => updateDraft('userNote', event.target.value)}
                    placeholder="Ghi chú hiển thị cho khách"
                    rows="3"
                    required
                  />
                </label>
                <button type="submit" disabled={submitting}>
                  <Save size={17} strokeWidth={2} aria-hidden="true" />
                  <span>Lưu user note</span>
                </button>
              </form>

              <form className="admin-form compact" onSubmit={runBulkRefund}>
                <div className="admin-panel-head compact-head">
                  <h3>Bulk refund</h3>
                  <RotateCcw size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <label>
                  <span>Mã đơn</span>
                  <textarea
                    value={bulkRefundCodes}
                    onChange={(event) => setBulkRefundCodes(event.target.value)}
                    placeholder="Nhập nhiều mã đơn, cách nhau bằng dấu phẩy hoặc xuống dòng"
                    rows="3"
                    required
                  />
                </label>
                <button type="button" className="admin-icon-button" onClick={() => setBulkRefundCodes(selectedOrder.orderCode)}>
                  Dùng đơn đang chọn
                </button>
                <button type="submit" className="admin-danger-button" disabled={submitting}>
                  Bulk refund
                </button>
              </form>
            </>
          ) : (
            <AdminEmptyState message="Chọn một đơn để xem chi tiết." />
          )}
        </aside>
      </div>
    </section>
  )
}

export default AdminOrdersView
