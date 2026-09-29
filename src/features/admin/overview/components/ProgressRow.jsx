import { percent } from '../overview.utils'

function ProgressRow({ title, subtitle, value, max, amount }) {
  const pct = Math.max(6, percent(value, max))
  return (
    <article className="ov-progress-row">
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className="ov-progress-meta">
        <b>{amount}</b>
        <i><em style={{ width: `${pct}%` }} /></i>
      </div>
    </article>
  )
}

export default ProgressRow
