import './WhyChooseSection.css'

function WhyChooseSection({ items, policies }) {
  return (
    <section className="public-section why-section" id="policies">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Tại sao chọn chúng tôi</span>
          <h2>Mua tài khoản và dịch vụ Facebook cần rõ điều kiện ngay từ đầu</h2>
        </div>
        <p>
          Khách không chỉ cần giá. Khách cần biết tài khoản dùng cho việc gì, bảo hành ra sao, đơn đang xử lý tới đâu
          và nếu lỗi thì liên hệ ở đâu.
        </p>
      </div>

      <div className="why-grid">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <article className="why-card" key={item.title}>
              <div className="why-icon-box">
                <Icon size={22} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="why-content-box">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="policy-strip" aria-label="Tóm tắt chính sách">
        {policies.map((item) => (
          <article key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.value}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WhyChooseSection
