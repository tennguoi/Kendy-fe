import { LifeBuoy, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { supportCategories, supportCategoryLabels } from '../support.constants'

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
  const fileInputRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [fileError, setFileError] = useState('')

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null
    if (selectedFile && selectedFile.size > MAX_ATTACHMENT_SIZE) {
      setFileError('Ảnh tối đa 5MB.')
      onFileChange(null)
      event.target.value = ''
      return
    }

    setFileError('')
    onFileChange(selectedFile)
  }

  const handleSubmit = async (event) => {
    const saved = await onCreateTicket(event)
    if (saved) {
      setIsOpen(false)
    }
  }

  return (
    <div className="support-widget">
      {isOpen && (
        <section className="support-widget-panel" aria-label="Gửi yêu cầu trợ giúp">
          <div className="support-widget-head">
            <h2>Gửi yêu cầu trợ giúp</h2>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Đóng hỗ trợ">
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <form className="support-widget-form" onSubmit={handleSubmit}>
            <div className="support-upload-box">
              <input ref={fileInputRef} accept="image/png,image/jpeg" onChange={handleFileChange} type="file" />
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} strokeWidth={2} />
                <span>{file ? file.name : 'Tải lên ảnh chụp vấn đề'}</span>
              </button>
              <p>{fileError || 'Định dạng file png, jpg, tối đa 5MB.'}</p>
            </div>

            <label>
              <span>Đơn hàng cần hỗ trợ</span>
              <select value={ticketForm.orderCode} onChange={(event) => onTicketFormChange('orderCode', event.target.value)}>
                <option value="">Không chọn đơn hàng</option>
                {orders.map((order) => (
                  <option key={order.orderCode || order.id} value={order.orderCode || ''}>
                    {order.orderCode || `Đơn #${order.id}`} {order.serviceName ? `- ${order.serviceName}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Bạn cần trợ giúp về vấn đề gì? *</span>
              <select value={ticketForm.category} onChange={(event) => onTicketFormChange('category', event.target.value)} required>
                {supportCategories.map((category) => <option value={category} key={category}>{supportCategoryLabels[category] || category}</option>)}
              </select>
            </label>

            <label>
              <span>Mô tả chi tiết vấn đề</span>
              <textarea
                value={ticketForm.message}
                onChange={(event) => onTicketFormChange('message', event.target.value)}
                placeholder="Nhập mô tả chi tiết tại đây ..."
                rows="4"
                required
              />
            </label>

            <button className="support-widget-submit" type="submit" disabled={submitting || !ticketForm.message.trim()}>
              Gửi yêu cầu
            </button>
          </form>
        </section>
      )}

      <button type="button" className="support-widget-trigger" onClick={() => setIsOpen((current) => !current)}>
        <LifeBuoy size={20} strokeWidth={2.2} />
        <span>Hỗ trợ</span>
      </button>
    </div>
  )
}

export default SupportWidget
