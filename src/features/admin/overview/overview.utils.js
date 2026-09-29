export const STATUS_SUCCESS = ['COMPLETED', 'CREDITED', 'MATCHED', 'SUCCESS', 'DONE', 'PAID']
export const STATUS_PENDING = ['PENDING', 'PROCESSING', 'PENDING_VERIFY', 'MANUAL_REVIEW', 'UNMATCHED', 'WAITING']
export const STATUS_FAILED = ['FAILED', 'ERROR', 'IGNORED', 'DUPLICATE', 'CANCELLED', 'REJECTED']

export function safeArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  return ['content', 'items', 'data', 'records', 'results', 'rows'].map((key) => value[key]).find(Array.isArray) || []
}

export function safeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function firstNumber(...values) {
  const found = values.find((value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)))
  return safeNumber(found, 0)
}

export function sumBy(rows, keys) {
  return safeArray(rows).reduce((total, row) => total + pickNumber(row, keys), 0)
}

export function pickNumber(row, keys) {
  const key = keys.find((item) => Number.isFinite(Number(row?.[item])))
  return safeNumber(row?.[key], 0)
}

export function percent(part, total) {
  const base = safeNumber(total)
  if (base <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((safeNumber(part) / base) * 100)))
}

export function normalizeStatus(value) {
  return String(value || '').trim().toUpperCase()
}

export function countStatus(rows, statuses) {
  const allowed = new Set(statuses)
  return safeArray(rows).filter((row) => allowed.has(normalizeStatus(row.status || row.state || row.matchStatus || row.paymentStatus))).length
}

export function compactDate(value) {
  if (!value) return '-'
  const raw = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(5, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return raw.slice(0, 5)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date)
}

export function trendText(current, previous) {
  const now = safeNumber(current)
  const prev = safeNumber(previous)
  if (prev <= 0 && now > 0) return '+100%'
  if (prev <= 0) return '0%'
  const value = Math.round(((now - prev) / prev) * 100)
  return `${value >= 0 ? '+' : ''}${value}%`
}
