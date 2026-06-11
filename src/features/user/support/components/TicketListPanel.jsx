import StatusBadge from '../../../../components/status/StatusBadge'
import { supportStatuses } from '../support.constants'
import { formatSupportDate } from '../supportFormat'

function TicketListPanel({
  onLoadTicket,
  onSearchChange,
  onStatusChange,
  query,
  selectedCode,
  statusFilter,
  tickets = [],
}) {
  return (
    <>
      <div className="admin-panel-head">
        <h2>Ticket của tôi</h2>
        <span>{tickets.length} ticket</span>
      </div>
      <div className="admin-filters single-filter">
        <input value={query} onChange={(event) => onSearchChange(event.target.value)} placeholder="Tìm ticket, chủ đề, mã đơn" type="search" />
        <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
          {supportStatuses.map((status) => <option value={status} key={status || 'all'}>{status || 'Tất cả trạng thái'}</option>)}
        </select>
      </div>
      <div className="admin-ticket-list">
        {tickets.map((ticket) => (
          <button
            className={selectedCode === ticket.ticketCode ? 'selected' : ''}
            key={ticket.ticketCode}
            type="button"
            onClick={() => onLoadTicket(ticket.ticketCode)}
          >
            <span>
              <strong>{ticket.subject}</strong>
              <small>{ticket.ticketCode} · {ticket.category} · {formatSupportDate(ticket.updatedAt)}</small>
            </span>
            <span className="admin-ticket-meta">
              <StatusBadge status={ticket.status} />
              <small>{ticket.priority}</small>
            </span>
          </button>
        ))}
        {tickets.length === 0 && <p className="admin-empty-state">Chưa có ticket hỗ trợ.</p>}
      </div>
    </>
  )
}

export default TicketListPanel
