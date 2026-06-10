import './ServiceCategories.css'

function ServiceCategories({ categories }) {
  return (
    <section className="public-section" id="services">
      <div className="section-heading">
        <span className="eyebrow">Dịch vụ</span>
        <h2>Các nhóm dịch vụ chính: Facebook, CapCut và nâng cấp tài khoản</h2>
        <p>
          Nội dung được viết theo nhu cầu thật của khách: mua tài khoản, đăng ký dịch vụ, nâng cấp gói, chạy quảng cáo
          và nhận hỗ trợ nếu đơn có vấn đề.
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
              <small>{item.microcopy}</small>
              <dl className="category-meta">
                <div>
                  <dt>Giá từ</dt>
                  <dd>{item.priceFrom}</dd>
                </div>
                <div>
                  <dt>Thời gian</dt>
                  <dd>{item.processingTime}</dd>
                </div>
                <div>
                  <dt>Bảo hành</dt>
                  <dd>{item.warranty}</dd>
                </div>
              </dl>
              <ul>
                {item.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
              <a href={item.id === 'ads' || item.id === 'facebook' ? '#contact' : '#pricing'}>{item.cta}</a>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ServiceCategories
