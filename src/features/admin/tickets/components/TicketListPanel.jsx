import { AdminEmptyState, AdminStatusBadge } from '../../AdminShared'

function TicketListPanel({
  onSelectTicket,
  selectedTicket,
  tickets = [],
}) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Danh sách ticket</h3>
        <span>{tickets.length} ticket</span>
      </div>
      <div className="admin-ticket-list">
        {tickets.map((ticket) => (
          <button
            type="button"
            className={selectedTicket?.ticketCode === ticket.ticketCode ? 'selected' : ''}
            key={ticket.ticketCode}
            onClick={() => onSelectTicket(ticket.ticketCode)}
          >
            <span>
              <strong>{ticket.subject}</strong>
              <small>{ticket.ticketCode} · User #{ticket.userId}</small>
            </span>
            <span className="admin-ticket-meta">
              <AdminStatusBadge status={ticket.status} />
              <small>{ticket.priority}</small>
            </span>
          </button>
        ))}
        {tickets.length === 0 && <AdminEmptyState />}
      </div>
    </div>
  )
}

export default TicketListPanel
