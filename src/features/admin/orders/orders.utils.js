export function safeOrderBlock(value) {
  if (!value) {
    return 'Chưa có dữ liệu'
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}
