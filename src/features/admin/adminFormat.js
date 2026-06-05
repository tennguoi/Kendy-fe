import { money } from '../../utils/currency'

export function formatAdminMoney(value) {
  return money.format(Number(value || 0))
}

export function formatAdminDate(value) {
  if (!value) {
    return 'Chưa có'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function includesKeyword(item, keyword, fields) {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return fields.some((field) => String(item?.[field] || '').toLowerCase().includes(normalized))
}

