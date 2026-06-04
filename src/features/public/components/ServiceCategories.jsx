function ServiceCategories({ categories }) {
  return (
    <section className="public-section" id="services">
      <div className="section-heading">
        <span className="eyebrow">Dịch vụ</span>
        <h2>Các nhóm dịch vụ digital được tổ chức theo nhu cầu sử dụng</h2>
        <p>
          Mỗi nhóm dịch vụ có mô tả, điều kiện sử dụng và kênh hỗ trợ riêng để người dùng biết mình đang mua gì trước
          khi vào dashboard giao dịch.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((item) => {
          const Icon = item.icon

          return (
            <article className="category-card" key={item.title}>
              <span className="category-icon">
                <Icon size={24} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <a href="#pricing">Xem dịch vụ</a>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ServiceCategories
