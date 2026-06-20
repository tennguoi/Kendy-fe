const CLOCK_JUMP_TOLERANCE_MS = 5_000

let serverEpochAtSync = null
let monotonicAtSync = null
let localEpochAtSync = null
let clockManipulated = false

const monotonicNow = () => (
  typeof performance !== 'undefined' ? performance.now() : Date.now()
)

export function syncServerTime(serverEpochMillis, requestStartedAt = monotonicNow()) {
  const parsed = Number(serverEpochMillis)
  if (!Number.isFinite(parsed) || parsed <= 0) return

  const receivedAt = monotonicNow()
  serverEpochAtSync = parsed + Math.max(0, receivedAt - requestStartedAt) / 2
  monotonicAtSync = receivedAt
  localEpochAtSync = Date.now()
  clockManipulated = false
}

export function serverNow() {
  if (serverEpochAtSync == null || monotonicAtSync == null) return Date.now()

  const elapsed = monotonicNow() - monotonicAtSync
  const localElapsed = Date.now() - localEpochAtSync
  if (Math.abs(localElapsed - elapsed) > CLOCK_JUMP_TOLERANCE_MS) {
    clockManipulated = true
  }
  return serverEpochAtSync + Math.max(0, elapsed)
}

export function isClientClockManipulated() {
  serverNow()
  return clockManipulated
}

export async function initializeServerTime(apiClient) {
  const startedAt = monotonicNow()
  const response = await apiClient.get('/api/time', {
    meta: { requestStartedAt: startedAt, skipTimeSync: true },
  })
  syncServerTime(response?.epochMillis, startedAt)
}

export function getMonotonicTimestamp() {
  return monotonicNow()
}
