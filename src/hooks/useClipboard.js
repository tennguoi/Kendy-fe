import { useState } from 'react'

export function useClipboard(resetDelay = 1400) {
  const [copied, setCopied] = useState('')

  const copyText = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const input = document.createElement('textarea')
      input.value = value
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }

    setCopied(key)
    window.setTimeout(() => setCopied(''), resetDelay)
  }

  return { copied, copyText }
}
