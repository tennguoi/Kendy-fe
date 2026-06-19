export function formatDate(value, options = {}) {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  // Mặc định format ngày tháng năm và giờ phút thân thiện
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }

  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(date)
}
