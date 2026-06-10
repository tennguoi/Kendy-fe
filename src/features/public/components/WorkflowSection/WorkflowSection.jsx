import './WorkflowSection.css'

function WorkflowSection({ steps }) {
  return (
    <section className="public-section workflow-section" id="workflow">
      <div className="section-heading">
        <span className="eyebrow">Hướng dẫn</span>
        <h2>Quy trình mua dịch vụ đơn giản, không phải nhắn hỏi từng bước</h2>
      </div>

      <div className="workflow-list">
        {steps.map((step, index) => {
          const Icon = step.icon

          return (
            <article className="workflow-step" key={step.title}>
              <span className="step-index">{String(index + 1).padStart(2, '0')}</span>
              <Icon size={24} strokeWidth={2} aria-hidden="true" />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          )
        })}
      </div>

      <div className="workflow-cta">
        <a className="public-btn primary" href="#services">
          Xem dịch vụ phù hợp
        </a>
      </div>
    </section>
  )
}

export default WorkflowSection
