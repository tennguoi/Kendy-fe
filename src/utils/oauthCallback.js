export function readOAuthCallback(search = window.location.search) {
  const params = new URLSearchParams(search)

  const hash = window.location.hash.replace(/^#/, '')
  if (hash) {
    const hashParams = new URLSearchParams(hash)
    for (const [key, value] of hashParams) {
      if (!params.has(key)) params.set(key, value)
    }
  }

  const token = params.get('token')
  const oauthTwoFactorChallenge = params.get('oauth2fa')
  const oauthError = params.get('oauthError')
  const expiresAt = params.get('expiresAt')
  const email = params.get('email')
  const provider = params.get('provider')

  if (!token && !oauthError && !oauthTwoFactorChallenge) {
    return null
  }

  return {
    email,
    error: oauthError,
    expiresAt,
    oauthTwoFactorChallenge,
    provider,
    token,
  }
}

export function clearOAuthCallbackUrl() {
  window.history.replaceState({}, document.title, window.location.origin)
}
