import { LifeBuoy, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supportCategories, supportCategoryLabels } from '../support.constants'
import BaseSelect from '../../../../components/ui/BaseSelect'
import BaseTextarea from '../../../../components/ui/BaseTextarea'
import { isRequired, composeValidators } from '../../../../utils/validation'

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024

function SupportWidget({
  file,
  onCreateTicket,
  onFileChange,
  onTicketFormChange,
  orders = [],
  submitting,
  ticketForm,
}) {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [fileError, setFileError] = useState('')

  // Validation for support form
  const validateRequired = composeValidators(isRequired)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null
    if (selectedFile && selectedFile.size > MAX_ATTACHMENT_SIZE) {
      setFileError(t('support.maxSizeError', { defaultValue: 'Ảnh tối đa 5MB.' }))
      onFileChange(null)
      event.target.value = ''
      return
    }

    setFileError('')
    onFileChange(selectedFile)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Validate form
    const categoryValidation = validateRequired(ticketForm.category)
    const messageValidation = validateRequired(ticketForm.message)

    if (!categoryValidation.isValid) {
      // Set error state or handle validation error
      // For now, we'll let the form submit and validation will be handled by the onCreateTicket function
      // In a real implementation, we might want to set form-level errors
    }

    if (!messageValidation.isValid) {
      // Same as above
    }

    const saved = await onCreateTicket(event)
    if (saved) {
      setIsOpen(false)
    }
  }

  return (
    <div className="support-widget">
      {isOpen && (
        <>
          <div className="support-widget-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <section className="support-widget-panel" aria-label={t('support.helpRequestTitle', { defaultValue: 'Gửi yêu cầu trợ giúp' })}>
          <div className="support-widget-head">
            <h2>{t('support.helpRequestTitle', { defaultValue: 'Gửi yêu cầu trợ giúp' })}</h2>
            <button type="button" onClick={() => setIsOpen(false)} aria-label={t('support.closeHelp', { defaultValue: 'Đóng hỗ trợ' })}>
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <form className="support-widget-form" onSubmit={handleSubmit}>
            <div className="support-upload-box">
              <input ref={fileInputRef} accept="image/png,image/jpeg" onChange={handleFileChange} type="file" />
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} strokeWidth={2} />
                <span>{file ? file.name : t('support.uploadPlaceholder', { defaultValue: 'Tải lên ảnh chụp vấn đề' })}</span>
              </button>
              <p>{fileError || t('support.fileFormatDesc', { defaultValue: 'Định dạng file png, jpg, tối đa 5MB.' })}</p>
            </div>

            <label>
              <span>{t('support.selectOrderHelp', { defaultValue: 'Đơn hàng cần hỗ trợ' })}</span>
              <BaseSelect
                value={ticketForm.orderCode}
                onChange={(value) => onTicketFormChange('orderCode', value)}
                options={[
                  { value: '', label: t('support.noOrderOption', { defaultValue: 'Không chọn đơn hàng' }) },
                  ...orders.map((order) => ({
                    value: order.orderCode || '',
                    label: `${order.orderCode || `Đơn #${order.id}`} ${order.serviceName ? `- ${order.serviceName}` : ''}`
                  }))
                ]}
                validators={[]} // Order code is optional
                placeholder={t('support.selectOrderHelp', { defaultValue: 'Đơn hàng cần hỗ trợ' })}
              />
            </label>

            <BaseSelect
              label={t('support.selectCategoryHelp', { defaultValue: 'Bạn cần trợ giúp về vấn đề gì? *' })}
              value={ticketForm.category}
              onChange={(value) => onTicketFormChange('category', value)}
              options={supportCategories.map((category) => ({
                value: category,
                label: t('status.' + category, { defaultValue: supportCategoryLabels[category] })
              }))}
              validators={[validateRequired]}
              errorMessage={t('support.categoryRequired', { defaultValue: 'Vui lòng chọn danh mục' })}
              required
            />

            <BaseTextarea
              label={t('support.detailDesc', { defaultValue: 'Mô tả chi tiết vấn đề' })}
              value={ticketForm.message}
              onChange={(value) => onTicketFormChange('message', value)}
              placeholder={t('support.descPlaceholder', { defaultValue: 'Nhập mô tả chi tiết tại đây ...' })}
              rows="4"
              validators={[validateRequired]}
              errorMessage={t('support.messageRequired', { defaultValue: 'Vui lòng nhập mô tả vấn đề' })}
              required
            />

            <button className="support-widget-submit" type="submit" disabled={submitting || !ticketForm.message.trim()}>
              {t('support.widgetSubmitBtn', { defaultValue: 'Gửi yêu cầu' })}
            </button>
          </form>
        </section>
        </>
      )}

      <button type="button" className="support-widget-trigger" onClick={() => setIsOpen((current) => !current)}>
        <LifeBuoy size={20} strokeWidth={2.2} />
        <span>{t('support.widgetTrigger', { defaultValue: 'Hỗ trợ' })}</span>
      </button>
    </div>
  )
}

export default SupportWidget