function FaqSection({ groups }) {
  return (
    <section className="public-section faq-section" id="faq">
      <div className="section-heading">
        <span className="eyebrow">FAQ</span>
        <h2>Các câu hỏi thường gặp trước khi mua, nạp tiền hoặc gửi yêu cầu tư vấn</h2>
      </div>

      <div className="faq-group-grid">
        {groups.map((group) => (
          <article className="faq-group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="faq-list">
              {group.items.map((item) => (
                <details className="faq-item" key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FaqSection
