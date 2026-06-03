export function createIdempotencyKey(serviceId) {
  return `buy-${serviceId}-${Date.now()}`
}
