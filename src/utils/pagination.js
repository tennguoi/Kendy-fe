const LIST_KEYS = ['content', 'items', 'data', 'records', 'results']

export function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
  }
  if (!value || typeof value !== 'object') {
    return []
  }
  return LIST_KEYS.map((key) => value[key]).find(Array.isArray) || []
}

export function normalizePaged(response, defaultLimit = 20) {
  if (Array.isArray(response)) {
    return { items: response, totalPages: 1, totalElements: response.length }
  }
  if (!response || typeof response !== 'object') {
    return { items: [], totalPages: 0, totalElements: 0 }
  }

  const items = normalizeList(response)
  const totalPages = response.totalPages ?? Math.ceil((response.totalElements ?? items.length) / defaultLimit)
  const totalElements = response.totalElements ?? response.total ?? items.length

  return { items, totalPages, totalElements }
}
