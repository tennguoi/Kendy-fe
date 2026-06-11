import TicketCreatePanel from './components/TicketCreatePanel'
import TicketDetailPanel from './components/TicketDetailPanel'
import TicketListPanel from './components/TicketListPanel'

function SupportView({
  attachments = [],
  file,
  loading,
  message,
  onCloseTicket,
  onCreateTicket,
  onDeleteAttachment,
  onFileChange,
  onLoadTicket,
  onRefresh,
  onReopenTicket,
  onSearchChange,
  onSendMessage,
  onSetMessage,
  onStatusChange,
  onTicketFormChange,
  onUploadAttachment,
  query,
  selectedTicket,
  statusFilter,
  submitting,
  ticketForm,
  tickets = [],
}) {
  const selectedCode = selectedTicket?.ticketCode || ''

  return (
    <section className="support-layout">
      <TicketCreatePanel
        loading={loading}
        onCreateTicket={onCreateTicket}
        onRefresh={onRefresh}
        onTicketFormChange={onTicketFormChange}
        submitting={submitting}
        ticketForm={ticketForm}
      />

      <article className="ticket-list">
        <TicketListPanel
          onLoadTicket={onLoadTicket}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          query={query}
          selectedCode={selectedCode}
          statusFilter={statusFilter}
          tickets={tickets}
        />
        <TicketDetailPanel
          attachments={attachments}
          file={file}
          message={message}
          onCloseTicket={onCloseTicket}
          onDeleteAttachment={onDeleteAttachment}
          onFileChange={onFileChange}
          onReopenTicket={onReopenTicket}
          onSendMessage={onSendMessage}
          onSetMessage={onSetMessage}
          onUploadAttachment={onUploadAttachment}
          selectedTicket={selectedTicket}
          submitting={submitting}
        />
      </article>
    </section>
  )
}

export default SupportView
