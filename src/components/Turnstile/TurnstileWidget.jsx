import { useEffect, useRef } from 'react'

const SCRIPT_ID = 'cf-turnstile-script'
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/**
 * Cloudflare Turnstile widget. Renders only when a public site key is configured; calls onToken
 * with the challenge token (or an empty string on expiry/error).
 */
export default function TurnstileWidget({ siteKey, onToken, theme = 'auto', refreshKey = 0 }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    if (!siteKey) return undefined
    let cancelled = false

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => onToken?.(token || ''),
        'expired-callback': () => onToken?.(''),
        'error-callback': () => onToken?.(''),
      })
    }

    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      if (window.turnstile) {
        render()
      } else {
        existing.addEventListener('load', render, { once: true })
      }
    } else {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.addEventListener('load', render, { once: true })
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      if (window.turnstile && widgetIdRef.current != null) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // widget already removed
        }
      }
      widgetIdRef.current = null
    }
  }, [siteKey, theme, onToken, refreshKey])

  if (!siteKey) return null
  return <div className="turnstile-widget" ref={containerRef} />
}
