export function parseMoneyInput(value) {
  const text = String(value ?? '').trim().toLowerCase()
  if (!text) {
    return ''
  }

  const multiplier = text.includes('tr') || text.includes('m') ? 1000000 : text.includes('k') ? 1000 : 1
  const normalized = text
    .replace(/,/g, '.')
    .replace(/[^0-9.]/g, '')

  if (!normalized) {
    return ''
  }

  const numericValue = Number(normalized)
  if (!Number.isFinite(numericValue)) {
    return ''
  }

  return String(Math.round(numericValue * multiplier))
}

export function formatMoneyInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) {
    return ''
  }

  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Number(digits))
}
