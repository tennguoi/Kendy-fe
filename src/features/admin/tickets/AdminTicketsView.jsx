import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../../api/admin.api'
import AdminDrawer from '../AdminDrawer'
import TicketDetailPanel from './components/TicketDetailPanel'
import TicketFilterBar from './components/TicketFilterBar'
import TicketListPanel from './components/TicketListPanel'
import Loading from '../../../components/Loading/Loading'

function AdminTicketsView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [admins, setAdmins] = useState([])
  const [attachments, setAttachments] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [editor, setEditor] = useState({ assignedAdminId: '', category: '', priority: 'NORMAL', status: 'OPEN' })
  const [error, setError] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [query, setQuery] = useState('')
  const [resolution, setResolution] = useState(null)
  const [selectedCode, setSelectedCode] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ticketQueue, setTicketQueue] = useState('all')
  const [tickets, setTickets] = useState([])

  const selectedTicket = tickets.find((ticket) => ticket.ticketCode === selectedCode) || tickets[0]
  const closedTicketsText = resolution ? String(resolution.closedTickets || 0) : '--'
  const averageResolutionText = resolution ? String(Math.round(resolution.averageResolutionMinutes || 0)) : '--'

  const setViewError = useCallback((messageText) => {
    setError(messageText)
    onSetError(messageText)
  }, [onSetError])

  const patchTicket = (saved) => {
    setTickets((items) => items.map((item) => (item.ticketCode === saved.ticketCode ? saved : item)))
  }

  const loadTickets = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setViewError('')
    try {
      const ticketRequest = ticketQueue === 'unassigned'
        ? adminApi.getUnassignedTickets(token)
        : ticketQueue === 'mine'
          ? adminApi.getAssignedToMeTickets(token)
          : adminApi.searchTickets({
              category: categoryFilter,
              priority: priorityFilter,
              query: query.trim(),
              status: statusFilter,
            }, token)
      const [ticketData, adminData, resolutionData] = await Promise.all([
        ticketRequest,
        adminApi.getAdmins(token),
        adminApi.getTicketResolutionTime(token),
      ])
      setTickets(ticketData)
      setAdmins(adminData)
      setResolution(resolutionData)
      setSelectedCode((current) => (current && ticketData.some((ticket) => ticket.ticketCode === current) ? current : ticketData[0]?.ticketCode || null))
    } catch (err) {
      setViewError(err.message || 'Không tải được danh sách ticket.')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, priorityFilter, query, setViewError, statusFilter, ticketQueue, token])

  const loadAttachments = useCallback(async (ticketCode) => {
    if (!token || !ticketCode) {
      setAttachments([])
      return
    }

    try {
      setAttachments(await adminApi.getTicketAttachments(ticketCode, token))
    } catch {
      setAttachments([])
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(loadTickets, 250)
    return () => window.clearTimeout(timer)
  }, [loadTickets])

  useEffect(() => {
    if (!token || !selectedTicket?.ticketCode) {
      return
    }

    let active = true
    async function loadTicketDetail() {
      try {
        const detail = await adminApi.getTicket(selectedTicket.ticketCode, token)
        if (active) {
          patchTicket(detail)
        }
      } catch {
        // Keep the current list item usable if detail refresh fails.
      }
    }

    loadTicketDetail()
    return () => {
      active = false
    }
  }, [selectedTicket?.ticketCode, token])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedTicket) {
        setEditor({
          assignedAdminId: selectedTicket.assignedAdminId ? String(selectedTicket.assignedAdminId) : '',
          category: selectedTicket.category || '',
          priority: selectedTicket.priority || 'NORMAL',
          status: selectedTicket.status || 'OPEN',
        })
        loadAttachments(selectedTicket.ticketCode)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadAttachments, selectedTicket])

  const submitMessage = async (event) => {
    event.preventDefault()
    if (!selectedTicket || !message.trim()) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const saved = await adminApi.sendTicketMessage(selectedTicket.ticketCode, { message: message.trim() }, token)
      patchTicket(saved)
      setMessage('')
      onSetNotice(`Đã phản hồi ticket ${selectedTicket.ticketCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không gửi được phản hồi ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateTicketFields = async (next = {}) => {
    if (!selectedTicket) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        assignedAdminId: editor.assignedAdminId ? Number(editor.assignedAdminId) : null,
        priority: next.priority || editor.priority,
        status: next.status || editor.status,
      }
      let saved = await adminApi.updateTicket(selectedTicket.ticketCode, payload, token)
      if (next.category || editor.category) {
        saved = await adminApi.updateTicketCategory(selectedTicket.ticketCode, { category: next.category || editor.category }, token)
      }
      if (next.priority) {
        saved = await adminApi.updateTicketPriority(selectedTicket.ticketCode, { priority: next.priority }, token)
      }
      patchTicket(saved)
      onSetNotice(`Đã cập nhật ticket ${selectedTicket.ticketCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không cập nhật được ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const uploadAttachment = async (event) => {
    event.preventDefault()
    if (!selectedTicket || !file) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.uploadTicketAttachment(selectedTicket.ticketCode, file, token)
      setFile(null)
      await loadAttachments(selectedTicket.ticketCode)
      onSetNotice(`Đã tải attachment cho ${selectedTicket.ticketCode}.`)
    } catch (err) {
      setViewError(err.message || 'Không tải được attachment.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteAttachment = async (attachmentId) => {
    if (!selectedTicket) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.deleteTicketAttachment(selectedTicket.ticketCode, attachmentId, token)
      await loadAttachments(selectedTicket.ticketCode)
      onSetNotice(`Đã xóa attachment #${attachmentId}.`)
    } catch (err) {
      setViewError(err.message || 'Không xóa được attachment.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectTicket = (ticketCode) => {
    setSelectedCode(ticketCode)
    setDrawerOpen(true)
  }

  return (
    <section className="admin-view">
      <div className="admin-toolbar">
        <div className="admin-toolbar-info">
          <div>
            <h2>Quản lý hỗ trợ</h2>
          </div>
          {tickets.length > 0 && (
            <div className="admin-quick-stats">
              <span className="admin-quick-stat"><strong>{tickets.length}</strong> ticket</span>
            </div>
          )}
        </div>
        <button type="button" className={`admin-icon-button ${loading ? 'loading' : ''}`} onClick={loadTickets} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message="Đang tải hỗ trợ..." subMessage="" />}

      <TicketFilterBar
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onPriorityFilterChange={setPriorityFilter}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        onTicketQueueChange={setTicketQueue}
        priorityFilter={priorityFilter}
        query={query}
        statusFilter={statusFilter}
        ticketQueue={ticketQueue}
      />

      <div className="admin-report-grid compact-report">
        <div><span>Ticket đã đóng</span><strong>{closedTicketsText}</strong></div>
        <div><span>Phút xử lý TB</span><strong>{averageResolutionText}</strong></div>
      </div>

      <TicketListPanel
        onSelectTicket={selectTicket}
        selectedTicket={selectedTicket}
        tickets={tickets}
      />

      <AdminDrawer
        isOpen={drawerOpen && Boolean(selectedTicket)}
        onClose={() => setDrawerOpen(false)}
        title={selectedTicket?.ticketCode || 'Chi tiết ticket'}
        width="640px"
      >
        <TicketDetailPanel
          admins={admins}
          attachments={attachments}
          editor={editor}
          file={file}
          message={message}
          onDeleteAttachment={deleteAttachment}
          onEditorChange={setEditor}
          onFileChange={setFile}
          onMessageChange={setMessage}
          onSendMessage={submitMessage}
          onUpdateTicketFields={updateTicketFields}
          onUploadAttachment={uploadAttachment}
          selectedTicket={selectedTicket}
          submitting={submitting}
        />
      </AdminDrawer>
    </section>
  )
}

export default AdminTicketsView
