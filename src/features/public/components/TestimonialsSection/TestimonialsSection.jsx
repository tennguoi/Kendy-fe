import './TestimonialsSection.css'

function TestimonialsSection({ items }) {
  return (
    <section className="public-section proof-section" id="proof">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Minh bạch trong từng đơn</span>
          <h2>Chưa cần testimonial giả, hãy cho khách thấy cách đơn hàng được theo dõi</h2>
        </div>
        <p>
          Khi chưa có đánh giá thật, public site nên dùng mockup lịch sử đơn, giao dịch ví và ticket hỗ trợ để chứng
          minh quy trình rõ ràng.
        </p>
      </div>

      <div className="proof-grid">
        {items.map((item) => (
          <article className={`proof-card ${item.tone}`} key={item.title}>
            <span>{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="proof-mini-list">
              {item.lines.map((line) => (
                <strong key={line}>{line}</strong>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
