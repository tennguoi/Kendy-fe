import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  return (
    <div className="admin-filters support-filters">
      <BaseSelect
        value={ticketQueue}
        onChange={(value) => onTicketQueueChange(value)}
        options={[
          { value: 'all', label: t('admin.tickets.filter.allTickets', { defaultValue: 'Tất cả ticket' }) },
          { value: 'unassigned', label: t('admin.tickets.filter.unassigned', { defaultValue: 'Chưa phân công' }) },
          { value: 'mine', label: t('admin.tickets.filter.mine', { defaultValue: 'Được gán cho tôi' }) }
        ]}
        placeholder={t('admin.tickets.filter.allTickets', { defaultValue: 'Tất cả ticket' })}
      />
      <SearchField
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t('admin.tickets.filter.searchPlaceholder', { defaultValue: 'Tìm ticket, user, chủ đề' })}
      />
      <BaseSelect
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value)}
        options={ticketStatuses.map((status) => ({
          value: status,
          label: !status
            ? t('admin.tickets.filter.allStatus', { defaultValue: 'Tất cả trạng thái' })
            : t(`status.${status}`, { defaultValue: ticketStatusLabels[status] || status }),
        }))}
        placeholder={t('admin.tickets.filter.allStatus', { defaultValue: 'Tất cả trạng thái' })}
      />
      <BaseSelect
        value={priorityFilter}
        onChange={(value) => onPriorityFilterChange(value)}
        options={ticketPriorities.map((priority) => ({
          value: priority,
          label: !priority
            ? t('admin.tickets.filter.allPriorities', { defaultValue: 'Tất cả ưu tiên' })
            : t(`priority.${priority}`, { defaultValue: ticketPriorityLabels[priority] || priority }),
        }))}
        placeholder={t('admin.tickets.filter.allPriorities', { defaultValue: 'Tất cả ưu tiên' })}
      />
      <BaseSelect
        value={categoryFilter}
        onChange={(value) => onCategoryFilterChange(value)}
        options={ticketCategories.map((category) => ({
          value: category,
          label: !category
            ? t('admin.tickets.filter.allCategories', { defaultValue: 'Tất cả danh mục' })
            : ticketCategoryLabels[category] || category,
        }))}
        placeholder={t('admin.tickets.filter.allCategories', { defaultValue: 'Tất cả danh mục' })}
      />
    </div>
  )
}

export default TicketFilterBar
