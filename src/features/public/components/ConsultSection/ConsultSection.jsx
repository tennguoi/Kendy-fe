import { Send } from 'lucide-react'
import './ConsultSection.css'

function ConsultSection({ onSubmit, dynamicContent }) {
  const eyebrow = dynamicContent?.eyebrow || 'Tư vấn quảng cáo'
  const title = dynamicContent?.title || 'Cần chạy quảng cáo Facebook? Gửi brief ngắn để được tư vấn loại dịch vụ phù hợp'
  const description = dynamicContent?.description || 'Dịch vụ quảng cáo cần hiểu sản phẩm, ngân sách và mục tiêu trước khi báo giá. Form này giúp đội tư vấn nắm nhanh bối cảnh thay vì hỏi lại từng thông tin.'
  const budgetOptions = dynamicContent?.budgetOptions || ['Dưới 5 triệu/tháng', '5-20 triệu/tháng', 'Trên 20 triệu/tháng']

  return (
    <section className="public-section consult-section" id="contact">
      <div className="consult-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <form className="consult-form" onSubmit={onSubmit}>
        <label>
          <span>Họ tên</span>
          <input name="name" placeholder="Nguyễn Văn A" required />
        </label>
        <label>
          <span>Số điện thoại/Zalo</span>
          <input name="phone" placeholder="0900000000" required />
        </label>
        <label>
          <span>Ngành hàng</span>
          <input name="industry" placeholder="Mỹ phẩm, thời trang, giáo dục..." />
        </label>
        <label>
          <span>Ngân sách dự kiến</span>
          <select name="budget" defaultValue="">
            <option value="" disabled>
              Chọn mức ngân sách
            </option>
            {budgetOptions.map((opt, idx) => (
              <option key={idx}>{opt}</option>
            ))}
          </select>
        </label>
        <label className="wide">
          <span>Mục tiêu cần tư vấn</span>
          <textarea name="goal" placeholder="Tin nhắn, đơn hàng, traffic, branding hoặc vấn đề đang gặp..." rows="4" />
        </label>
        <button type="submit" className="public-btn primary">
          <span>Gửi yêu cầu tư vấn</span>
          <Send size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </form>
    </section>
  )
}

export default ConsultSection
