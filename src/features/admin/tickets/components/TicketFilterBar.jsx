import { ticketCategories, ticketPriorities, ticketStatuses, ticketCategoryLabels, ticketPriorityLabels, ticketStatusLabels } from '../tickets.constants'
import SearchField from '../../../../components/SearchField/SearchField'
import BaseSelect from '../../../../components/ui/BaseSelect'

function TicketFilterBar({
  categoryFilter,
  onCategoryFilterChange,
  onPriorityFilterChange,
  onQueryChange,
  onStatusFilterChange,
  onTicketQueueChange,
  priorityFilter,
  query,
  statusFilter,
  ticketQueue,
}) {
  return (
    <div className="admin-filters support-filters">
      <BaseSelect
        value={ticketQueue}
        onChange={(value) => onTicketQueueChange(value)}
        options={[
          { value: 'all', label: 'Tất cả ticket' },
          { value: 'unassigned', label: 'Chưa assign' },
          { value: 'mine', label: 'Assigned to me' }
        ]}
        placeholder="All tickets"
      />
      <SearchField value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Tìm ticket, user, chủ đề" />
      <BaseSelect
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value)}
        options={ticketStatuses.map((status) => ({
          value: status,
          label: ticketStatusLabels[status] || status || 'Tất cả trạng thái'
        }))}
        placeholder="Tất cả trạng thái"
      />
      <BaseSelect
        value={priorityFilter}
        onChange={(value) => onPriorityFilterChange(value)}
        options={ticketPriorities.map((priority) => ({
          value: priority,
          label: ticketPriorityLabels[priority] || priority || 'Tất cả ưu tiên'
        }))}
        placeholder="Tất cả ưu tiên"
      />
      <BaseSelect
        value={categoryFilter}
        onChange={(value) => onCategoryFilterChange(value)}
        options={ticketCategories.map((category) => ({
          value: category,
          label: ticketCategoryLabels[category] || category || 'Tất cả danh mục'
        }))}
        placeholder="Tất cả danh mục"
      />
    </div>
  )
}

export default TicketFilterBar