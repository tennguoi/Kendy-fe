import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supportCategories, supportPriorities, supportCategoryLabels, supportPriorityLabels } from '../support.constants'
import BaseInput from '../../../../components/ui/BaseInput'
import BaseSelect from '../../../../components/ui/BaseSelect'
import BaseTextarea from '../../../../components/ui/BaseTextarea'
import { validateRequired } from '../../../../utils/validation'

function TicketCreatePanel({
  loading,
  onCreateTicket,
  onRefresh,
  onTicketFormChange,
  submitting,
  ticketForm,
}) {
  const { t } = useTranslation()

  // Validators
    const validateOptional = () => ({ isValid: true }) // Always valid for optional fields

  return (
    <article className="ticket-form">
      <div className="admin-panel-head">
        <div>
          <h2>{t('support.createTicket', { defaultValue: 'Yêu cầu hỗ trợ' })}</h2>
        </div>
        <button type="button" className="admin-icon-button" disabled={loading} onClick={onRefresh}>
          <RefreshCw size={17} strokeWidth={2} aria-hidden="true" />
          <span>{t('support.reload', { defaultValue: 'Tải lại' })}</span>
        </button>
      </div>

      <form className="admin-form compact" onSubmit={onCreateTicket}>
        <BaseInput
          label={t('support.subject', { defaultValue: 'Chủ đề' })}
          value={ticketForm.subject}
          onChange={(value) => onTicketFormChange('subject', value)}
          validators={[validateRequired]}
          errorMessage={t('support.subjectRequired', { defaultValue: 'Vui lòng nhập chủ đề' })}
          required
        />
        <div className="ticket-form-row">
          <BaseSelect
            label={t('support.category', { defaultValue: 'Danh mục' })}
            value={ticketForm.category}
            onChange={(value) => onTicketFormChange('category', value)}
            options={supportCategories.map((category) => ({
              value: category,
              label: t('status.' + category, { defaultValue: supportCategoryLabels[category] })
            }))}
            validators={[validateRequired]}
            errorMessage={t('support.categoryRequired', { defaultValue: 'Vui lòng chọn danh mục' })}
            placeholder={t('support.selectCategory', { defaultValue: 'Chọn danh mục' })}
          />
          <BaseSelect
            label={t('support.priority', { defaultValue: 'Ưu tiên' })}
            value={ticketForm.priority}
            onChange={(value) => onTicketFormChange('priority', value)}
            options={supportPriorities.map((priority) => ({
              value: priority,
              label: t('status.' + priority, { defaultValue: supportPriorityLabels[priority] })
            }))}
            validators={[validateRequired]}
            errorMessage={t('support.priorityRequired', { defaultValue: 'Vui lòng chọn mức ưu tiên' })}
            placeholder={t('support.selectPriority', { defaultValue: 'Chọn mức ưu tiên' })}
          />
        </div>
        <div className="ticket-form-row">
          <BaseInput
            label={t('support.orderCode', { defaultValue: 'Mã đơn' })}
            value={ticketForm.orderCode}
            onChange={(value) => onTicketFormChange('orderCode', value)}
            validators={[validateOptional]}
            errorMessage={t('support.orderCodeInvalid', { defaultValue: 'Mã đơn không hợp lệ' })}
          />
          <BaseInput
            label={t('support.depositCode', { defaultValue: 'Mã nạp' })}
            value={ticketForm.depositCode}
            onChange={(value) => onTicketFormChange('depositCode', value)}
            validators={[validateOptional]}
            errorMessage={t('support.depositCodeInvalid', { defaultValue: 'Mã nạp không hợp lệ' })}
          />
        </div>
        <BaseTextarea
          label={t('support.content', { defaultValue: 'Nội dung' })}
          value={ticketForm.message}
          onChange={(value) => onTicketFormChange('message', value)}
          validators={[validateRequired]}
          errorMessage={t('support.contentRequired', { defaultValue: 'Vui lòng nhập nội dung' })}
          rows={3}
        />
        <button className="primary-button" type="submit" disabled={submitting}>
          {t('support.submitBtn', { defaultValue: 'Gửi ticket' })}
        </button>
      </form>
    </article>
  )
}

export default TicketCreatePanel