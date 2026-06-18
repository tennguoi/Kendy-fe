import './FaqSection.css'

function FaqSection({ eyebrow = 'FAQ', items, title = 'Các câu hỏi thường gặp' }) {
  return (
    <section className="public-section faq-section" id="faq">
      <div className="section-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>

      <div className="faq-list">
        {items.map((item) => (
          <details className="faq-item" key={item.id || item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default FaqSection
