function MiniStat({ label, value, icon: Icon, tone = 'blue' }) {
  return (
    <div className={`ov-mini-stat ov-tone-${tone}`}>
      <Icon size={18} strokeWidth={2.2} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default MiniStat
