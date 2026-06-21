import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import AdminDrawer from '../AdminDrawer'
import OrderDetailPanel from './components/OrderDetailPanel'
import OrderFilterBar from './components/OrderFilterBar'
import OrderListPanel from './components/OrderListPanel'
import Pagination from '../../../components/Pagination/Pagination'
import Loading from '../../../components/Loading/Loading'

function toDateTimeInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localTime.toISOString().slice(0, 16)
}

function toInstant(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function formFromOrder(order) {
  return {
    adminNote: order?.adminNote || '',
    assignedAdminId: order?.assignedAdminId || '',
    manualChecklist: order?.manualChecklist || '',
    minutes: '60',
    orderCode: order?.orderCode || '',
    processingDeadlineAt: toDateTimeInput(order?.processingDeadlineAt),
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
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { t } = useTranslation()

  const selectedOrder = orders.find((order) => order.id === selectedId) || orders[0]
  const orderForm = selectedOrder && draft?.orderCode === selectedOrder.orderCode
    ? draft
    : formFromOrder(selectedOrder)
  const activeOrder = selectedOrder && ['PENDING_PAYMENT', 'PROCESSING'].includes(selectedOrder.status)
  const refundableOrder = selectedOrder && !['CANCELLED', 'REFUNDED'].includes(selectedOrder.status)

  const setViewError = useCallback((message) => {
    setError(message)
    onSetError(message)
  }, [onSetError])

  const loadOrders = useCallback(async (page) => {
    if (!token) {
      return
    }

    const targetPage = page ?? currentPage
    setLoading(true)
    setViewError('')
    try {
      const data = await adminApi.searchOrders({ query: query.trim(), status: statusFilter, page: targetPage }, token)
      const { items, totalPages: pages } = normalizePaged(data, 50)
      setOrders(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
      setSelectedId((current) => (current && items.some((item) => item.id === current) ? current : items[0]?.id || null))
    } catch (err) {
      setViewError(err.message || t('admin.orders.loadError'))
    } finally {
      setLoading(false)
    }
  }, [currentPage, query, setViewError, statusFilter, token])

  useEffect(() => {
    setCurrentPage(0)
  }, [query, statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => loadOrders(), 250)
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
    setDrawerOpen(true)
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
      setViewError(t('admin.orders.reasonRequired'))
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
      onSetNotice(t('admin.orders.updateSuccess', { code: saved.orderCode }))
    } catch (err) {
      setViewError(err.message || t('admin.orders.updateError'))
    } finally {
      setSubmitting(false)
    }
  }

  const saveAdminNote = async (event) => {
    event.preventDefault()
    if (!selectedOrder || !orderForm.adminNote.trim()) {
      setViewError(t('admin.orders.adminNoteRequired'))
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
      onSetNotice(t('admin.orders.adminNoteSaveSuccess', { code: saved.orderCode }))
    } catch (err) {
      setViewError(err.message || t('admin.orders.adminNoteSaveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const saveUserNote = async (event) => {
    event.preventDefault()
    if (!selectedOrder || !orderForm.userNote.trim()) {
      setViewError(t('admin.orders.userNoteRequired'))
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
      onSetNotice(t('admin.orders.userNoteSaveSuccess', { code: saved.orderCode }))
    } catch (err) {
      setViewError(err.message || t('admin.orders.userNoteSaveError'))
    } finally {
      setSubmitting(false)
    }
  }

  const updateManualWorkflow = async (orderCode) => {
    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.updateManualWorkflow(orderCode, {
        assignedAdminId: draft?.assignedAdminId ? Number(draft.assignedAdminId) : null,
        processingDeadlineAt: toInstant(draft?.processingDeadlineAt),
        manualChecklist: draft?.manualChecklist?.trim() || null,
        adminNote: draft?.adminNote?.trim() || null,
      }, token)
      patchOrder(saved)
      setDraft(formFromOrder(saved))
      await loadOrders()
      onSetNotice(t('admin.orders.workflowUpdateSuccess', { code: saved.orderCode }))
    } catch (err) {
      setViewError(err.message || t('admin.orders.workflowUpdateError'))
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
      setViewError(t('admin.orders.bulkRefundCodesRequired'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const savedItems = await adminApi.bulkRefundOrders({ orderCodes, reason: orderForm.reason.trim() }, token)
      savedItems.forEach(patchOrder)
      setBulkRefundCodes('')
      await loadOrders()
      onSetNotice(t('admin.orders.bulkRefundSuccess', { count: savedItems.length }))
    } catch (err) {
      setViewError(err.message || t('admin.orders.bulkRefundError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div className="admin-toolbar-info">
          <div>
            <h2>{t('admin.orders.title')}</h2>
          </div>
          {orders.length > 0 && (
            <div className="admin-quick-stats">
              <span className="admin-quick-stat"><strong>{orders.length}</strong> {t('admin.orders.orders')}</span>
            </div>
          )}
        </div>
        <button type="button" className={`admin-icon-button ${loading ? 'loading' : ''}`} onClick={loadOrders} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>{t('admin.orders.reload')}</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message={t('admin.orders.loading')} subMessage="" />}

      <OrderFilterBar
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        query={query}
        statusFilter={statusFilter}
      />

      <OrderListPanel
        onSelectOrder={selectOrder}
        orders={orders}
        selectedOrder={selectedOrder}
      />

      <Pagination
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPageChange={(page) => loadOrders(page - 1)}
      />

      <AdminDrawer
        isOpen={drawerOpen && Boolean(selectedOrder)}
        onClose={() => setDrawerOpen(false)}
        title={selectedOrder?.orderCode || t('admin.orders.drawerTitle')}
        width="620px"
      >
        <OrderDetailPanel
          activeOrder={activeOrder}
          bulkRefundCodes={bulkRefundCodes}
          onBulkRefundCodesChange={setBulkRefundCodes}
          onRunBulkRefund={runBulkRefund}
          onRunOrderAction={runOrderAction}
          onSaveAdminNote={saveAdminNote}
          onSaveUserNote={saveUserNote}
          onUpdateDraft={updateDraft}
          onUpdateManualWorkflow={updateManualWorkflow}
          orderForm={orderForm}
          refundableOrder={refundableOrder}
          selectedOrder={selectedOrder}
          submitting={submitting}
        />
      </AdminDrawer>
    </section>
  )
}

export default AdminOrdersView
