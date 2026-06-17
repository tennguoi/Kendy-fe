export function normalizeServiceText(value) {
  return String(value || '').trim().toLowerCase()
}

export function uniqueServiceOptions(services, field) {
  return Array.from(new Set(services.map((service) => service[field]).filter(Boolean)))
}

export function mergeServiceLists(primary, fallback) {
  const byId = new Map()
  primary.forEach((service) => byId.set(service.id, service))
  fallback.forEach((service) => {
    if (byId.has(service.id)) {
      byId.set(service.id, { ...service, ...byId.get(service.id) })
    }
  })
  return Array.from(byId.values())
}

export function isServiceOnSale(service) {
  if (!service?.pricingBadge) return false
  const badge = service.pricingBadge.toLowerCase()
  return badge.includes('khuyến mãi') || badge.includes('giảm') || badge.includes('sale') || badge.includes('discount')
}

export function isServiceOutOfStock(service) {
  return service?.stockStatus === 'OUT_OF_STOCK'
}
