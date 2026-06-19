import { money } from '../../utils/currency'
import { formatDate } from '../../utils/date'

export function formatAdminMoney(value) {
  return money.format(Number(value || 0))
}

export function formatAdminDate(value) {
  if (!value) {
    return 'Chưa có'
  }
  const formatted = formatDate(value)
  return formatted === '-' ? 'Chưa có' : formatted
}


export function includesKeyword(item, keyword, fields) {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return fields.some((field) => String(item?.[field] || '').toLowerCase().includes(normalized))
}

