const ACCESS_TOKEN_KEY = 'kd_access_token'

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY) || ''
}

export function hasPersistentSession() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
}

export function persistAccessToken(token, remember) {
  const persistentStore = remember ? localStorage : sessionStorage
  const transientStore = remember ? sessionStorage : localStorage

  persistentStore.setItem(ACCESS_TOKEN_KEY, token)
  transientStore.removeItem(ACCESS_TOKEN_KEY)
}

export function clearStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}
