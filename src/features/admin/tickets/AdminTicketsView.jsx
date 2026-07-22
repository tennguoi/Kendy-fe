import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin.api'
import { normalizePaged } from '../../../utils/pagination'
import AdminDrawer from '../AdminDrawer'
import TicketDetailPanel from './components/TicketDetailPanel'
import TicketFilterBar from './components/TicketFilterBar'
import TicketListPanel from './components/TicketListPanel'
import Pagination from '../../../components/Pagination/Pagination'
import Loading from '../../../components/Loading/Loading'

function AdminTicketsView({
  onSetError,
  onSetNotice,
  token,
}) {
  const [admins, setAdmins] = useState([])
  const [attachments, setAttachments] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
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
  const { t } = useTranslation()

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

  const loadTickets = useCallback(async (page) => {
    if (!token) {
      return
    }

    const targetPage = typeof page === 'number' ? page : currentPage
    setLoading(true)
    setViewError('')
    try {
      const ticketRequest = ticketQueue === 'unassigned'
        ? adminApi.getUnassignedTickets(token)
        : ticketQueue === 'mine'
          ? adminApi.getAssignedToMeTickets(token)
          : adminApi.searchTickets({
              category: categoryFilter,
              page: targetPage,
              priority: priorityFilter,
              query: query.trim(),
              status: statusFilter,
            }, token)
      const [ticketData, adminData, resolutionData] = await Promise.all([
        ticketRequest,
        adminApi.getAdmins(token),
        adminApi.getTicketResolutionTime(token),
      ])
      const { items, totalPages: pages } = normalizePaged(ticketData, 50)
      setTickets(items)
      setTotalPages(pages)
      setCurrentPage(targetPage)
      setAdmins(adminData)
      setResolution(resolutionData)
      setSelectedCode((current) => (current && items.some((ticket) => ticket.ticketCode === current) ? current : items[0]?.ticketCode || null))
    } catch (err) {
      setViewError(err.message || t('admin.tickets.loadError'))
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, currentPage, priorityFilter, query, setViewError, statusFilter, ticketQueue, token])

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
    setCurrentPage(0)
  }, [categoryFilter, priorityFilter, query, statusFilter, ticketQueue])

  useEffect(() => {
    const timer = window.setTimeout(() => loadTickets(), 250)
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
      onSetNotice(t('admin.tickets.sendMessageSuccess', { code: selectedTicket.ticketCode }))
    } catch (err) {
      setViewError(err.message || t('admin.tickets.sendMessageError'))
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
      onSetNotice(t('admin.tickets.updateSuccess', { code: selectedTicket.ticketCode }))
    } catch (err) {
      setViewError(err.message || t('admin.tickets.updateError'))
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
      onSetNotice(t('admin.tickets.uploadSuccess', { code: selectedTicket.ticketCode }))
    } catch (err) {
      setViewError(err.message || t('admin.tickets.uploadError'))
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
      onSetNotice(t('admin.tickets.deleteAttachmentSuccess', { id: attachmentId }))
    } catch (err) {
      setViewError(err.message || t('admin.tickets.deleteAttachmentError'))
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
            <h2>{t('admin.tickets.title')}</h2>
          </div>
          {tickets.length > 0 && (
            <div className="admin-quick-stats">
              <span className="admin-quick-stat"><strong>{tickets.length}</strong> {t('admin.tickets.ticket')}</span>
            </div>
          )}
        </div>
        <button type="button" className={`admin-icon-button ${loading ? 'loading' : ''}`} onClick={loadTickets} disabled={loading}>
          <RefreshCw size={18} strokeWidth={2} aria-hidden="true" />
          <span>{t('admin.tickets.reload')}</span>
        </button>
      </div>

      {error && <p className="admin-message error">{error}</p>}
      {!error && loading && <Loading fullScreen={false} message={t('admin.tickets.loading')} subMessage="" />}

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
        <div><span>{t('admin.tickets.stats.closed')}</span><strong>{closedTicketsText}</strong></div>
        <div><span>{t('admin.tickets.stats.avgMinutes')}</span><strong>{averageResolutionText}</strong></div>
      </div>

      <TicketListPanel
        onSelectTicket={selectTicket}
        selectedTicket={selectedTicket}
        tickets={tickets}
      />

      <Pagination
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPageChange={(page) => loadTickets(page - 1)}
      />

      <AdminDrawer
        isOpen={drawerOpen && Boolean(selectedTicket)}
        onClose={() => setDrawerOpen(false)}
        title={selectedTicket?.ticketCode || t('admin.tickets.drawerTitle')}
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
          token={token}
        />
      </AdminDrawer>
    </section>
  )
}

export default AdminTicketsView
