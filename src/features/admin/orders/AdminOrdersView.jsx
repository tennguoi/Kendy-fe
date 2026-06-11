import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import OrderDetailPanel from './components/OrderDetailPanel'
import OrderFilterBar from './components/OrderFilterBar'
import OrderListPanel from './components/OrderListPanel'

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

      <OrderFilterBar
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        query={query}
        statusFilter={statusFilter}
      />

      <div className="admin-grid detail-layout">
        <OrderListPanel
          onSelectOrder={selectOrder}
          orders={orders}
          selectedOrder={selectedOrder}
        />
        <OrderDetailPanel
          activeOrder={activeOrder}
          bulkRefundCodes={bulkRefundCodes}
          onBulkRefundCodesChange={setBulkRefundCodes}
          onRunBulkRefund={runBulkRefund}
          onRunOrderAction={runOrderAction}
          onSaveAdminNote={saveAdminNote}
          onSaveUserNote={saveUserNote}
          onUpdateDraft={updateDraft}
          orderForm={orderForm}
          refundableOrder={refundableOrder}
          selectedOrder={selectedOrder}
          submitting={submitting}
        />
      </div>
    </section>
  )
}

export default AdminOrdersView
