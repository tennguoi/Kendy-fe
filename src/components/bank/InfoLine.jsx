function InfoLine({ label, value, copied, onCopy, strong = false }) {
  return (
    <div className="info-line">
      <span>{label}</span>
      <strong className={strong ? 'highlight' : ''}>{value}</strong>
      <button type="button" onClick={() => onCopy(label, value)}>
        {copied === label ? 'Đã copy' : 'Copy'}
      </button>
    </div>
  )
}

export default InfoLine
