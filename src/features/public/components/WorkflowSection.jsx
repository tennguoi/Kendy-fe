function WorkflowSection({ steps }) {
  return (
    <section className="public-section workflow-section" id="workflow">
      <div className="section-heading">
        <span className="eyebrow">Hướng dẫn</span>
        <h2>Quy trình hoạt động giúp người dùng hiểu vì sao có dashboard và ví tiền</h2>
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
    </section>
  )
}

export default WorkflowSection
