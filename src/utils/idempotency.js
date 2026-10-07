export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function createIdempotencyKey(prefix = 'buy') {
  const cleanPrefix = typeof prefix === 'object' ? 'buy' : String(prefix).replace(/[^a-zA-Z0-9_-]/g, '')
  return `${cleanPrefix}-${generateUUID()}`
}
