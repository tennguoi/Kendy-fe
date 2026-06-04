function WhyChooseSection({ items, policies }) {
  return (
    <section className="public-section why-section" id="policies">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Tại sao chọn chúng tôi</span>
          <h2>Website bán dịch vụ digital nhưng vận hành như một platform có kiểm soát</h2>
        </div>
        <p>
          Trọng tâm là tạo niềm tin tài chính: giao dịch có lịch sử, đơn hàng có trạng thái và chính sách được đặt trước
          hành động mua.
        </p>
      </div>

      <div className="why-grid">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <article className="why-card" key={item.title}>
              <Icon size={22} strokeWidth={2} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
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
