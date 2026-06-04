import { ArrowRight, CheckCircle2 } from 'lucide-react'

function FeaturedServices({ services, onPurchaseClick }) {
  return (
    <section className="public-section pricing-section" id="pricing">
      <div className="section-heading split">
        <div>
          <span className="eyebrow">Bảng giá</span>
          <h2>Dịch vụ nổi bật có giá, thời gian xử lý và bảo hành rõ ràng</h2>
        </div>
        <p>
          Các dịch vụ liên quan tài khoản hoặc nền tảng mạng xã hội luôn hiển thị điều kiện sử dụng để tránh kỳ vọng
          sai trước khi thanh toán.
        </p>
      </div>

      <div className="pricing-grid">
        {services.map((service) => (
          <article className="pricing-card" key={service.name}>
            <div className="pricing-head">
              <span>{service.category}</span>
              <strong>{service.name}</strong>
            </div>

            <div className="price-line">
              <strong>{service.price}</strong>
              <span>{service.mode}</span>
            </div>

            <dl className="service-meta">
              <div>
                <dt>Thời gian xử lý</dt>
                <dd>{service.processingTime}</dd>
              </div>
              <div>
                <dt>Bảo hành</dt>
                <dd>{service.warranty}</dd>
              </div>
            </dl>

            <ul className="condition-list">
              {service.conditions.map((condition) => (
                <li key={condition}>
                  <CheckCircle2 size={16} strokeWidth={2} aria-hidden="true" />
                  <span>{condition}</span>
                </li>
              ))}
            </ul>

            <button type="button" className="public-btn dark" onClick={onPurchaseClick}>
              <span>Mua ngay</span>
              <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FeaturedServices
