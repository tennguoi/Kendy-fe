export function readOAuthCallback(search = window.location.search) {
  const params = new URLSearchParams(search)
  const token = params.get('token')
  const oauthError = params.get('oauthError')
  const expiresAt = params.get('expiresAt')

  if (!token && !oauthError) {
    return null
  }

  return {
    error: oauthError,
    expiresAt,
    token,
  }
}

export function clearOAuthCallbackUrl() {
  window.history.replaceState({}, document.title, window.location.origin)
}
