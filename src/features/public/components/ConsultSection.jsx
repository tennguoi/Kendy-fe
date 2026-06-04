import { Send } from 'lucide-react'

function ConsultSection({ onSubmit }) {
  return (
    <section className="public-section consult-section" id="contact">
      <div className="consult-copy">
        <span className="eyebrow">Tư vấn quảng cáo</span>
        <h2>Cần chạy quảng cáo Facebook? Gửi brief ngắn để được tư vấn loại dịch vụ phù hợp</h2>
        <p>
          Dịch vụ quảng cáo cần hiểu sản phẩm, ngân sách và mục tiêu trước khi báo giá. Form này giúp đội tư vấn nắm
          nhanh bối cảnh thay vì hỏi lại từng thông tin.
        </p>
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
            <option>Dưới 5 triệu/tháng</option>
            <option>5-20 triệu/tháng</option>
            <option>Trên 20 triệu/tháng</option>
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
