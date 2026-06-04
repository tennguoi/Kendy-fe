function FaqSection({ items }) {
  return (
    <section className="public-section faq-section" id="faq">
      <div className="section-heading">
        <span className="eyebrow">FAQ</span>
        <h2>Các câu hỏi thường gặp trước khi nạp tiền và mua dịch vụ</h2>
      </div>

      <div className="faq-list">
        {items.map((item) => (
          <details className="faq-item" key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default FaqSection
