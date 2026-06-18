import { useCallback, useEffect, useState } from 'react'
import { publicApi } from '../../../api/public.api'
import {
  applySiteTheme,
  buildSiteSettings,
  defaultSiteSettings,
  resetSiteTheme,
} from '../data/siteSettings'

export function usePublicSiteSettings() {
  const [settings, setSettings] = useState(defaultSiteSettings)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const items = await publicApi.getAllSiteSections()
      setSettings(buildSiteSettings(items))
    } catch {
      setSettings(defaultSiteSettings)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    publicApi.getAllSiteSections()
      .then((items) => {
        if (active) setSettings(buildSiteSettings(items))
      })
      .catch(() => {
        if (active) setSettings(defaultSiteSettings)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    applySiteTheme(settings.theme)
    return resetSiteTheme
  }, [settings.theme])

  return { settings, loading, reload: load }
}
