import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../../api/admin.api'
import { userApi } from '../../../../api/user.api'
import { mergeSettings, toSettingsMap } from '../settings.utils'

export function useSystemSettings({
  currentUser,
  onCurrentUserChange,
  onSetNotice,
  setSubmitting,
  setViewError,
  token,
}) {
  const { t } = useTranslation()
  const [settings, setSettings] = useState([])
  const [settingHistory, setSettingHistory] = useState([])
  const [settingHistoryKey, setSettingHistoryKey] = useState('')
  const [settingSearch, setSettingSearch] = useState('')
  const [restoreText, setRestoreText] = useState('{\n  "settings": []\n}')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorEmailSent, setTwoFactorEmailSent] = useState(false)

  const settingsMap = toSettingsMap(settings)
  const twoFactorRequired = settingsMap.admin_2fa_required === 'true'

  const toggleTwoFactor = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const savedSettings = await adminApi.updateSettings(
        {
          settings: [
            {
              key: 'admin_2fa_required',
              publicSetting: false,
              value: twoFactorRequired ? 'false' : 'true',
            },
          ],
        },
        token,
      )
      setSettings((current) => mergeSettings(current, savedSettings))
      onSetNotice(t('admin.settings.success.twoFAUpdated'))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.updateFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const sendTwoFactorEnableCode = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      await userApi.sendTwoFactorEnableEmailCode(token)
      setTwoFactorEmailSent(true)
      onSetNotice(t('admin.settings.success.twoFAEmailSent', { email: currentUser?.email || 'email admin' }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.twoFAEmailFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const enableEmailTwoFactor = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const savedUser = await userApi.enableEmailTwoFactor({ code: twoFactorCode.trim() }, token)
      setTwoFactorCode('')
      setTwoFactorEmailSent(false)
      onCurrentUserChange(savedUser)
      onSetNotice(t('admin.settings.success.twoFAEnabled'))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.twoFAInvalidCode'))
    } finally {
      setSubmitting(false)
    }
  }

  const backupSettings = async () => {
    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.backupSettings(token)
      setSettings(data)
      onSetNotice(t('admin.settings.success.backupDone', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.backupFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const restoreSettingsFromText = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setViewError('')
    try {
      const parsed = JSON.parse(restoreText)
      const payload = Array.isArray(parsed) ? { settings: parsed } : parsed
      const saved = await adminApi.restoreSettings(payload, token)
      setSettings(saved)
      onSetNotice(t('admin.settings.success.restoreDone', { count: saved.length }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.restoreFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const loadSettingHistory = async (event) => {
    event.preventDefault()
    if (!settingHistoryKey.trim()) {
      setViewError(t('admin.settings.error.historyKeyRequired'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const data = await adminApi.getSettingHistory(settingHistoryKey.trim(), token)
      setSettingHistory(data)
      onSetNotice(t('admin.settings.success.historyLoaded', { count: data.length }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.historyLoadFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    backupSettings,
    enableEmailTwoFactor,
    loadSettingHistory,
    restoreSettingsFromText,
    restoreText,
    sendTwoFactorEnableCode,
    setRestoreText,
    setSettingHistory,
    setSettingHistoryKey,
    setSettingSearch,
    setSettings,
    setTwoFactorCode,
    settingHistory,
    settingHistoryKey,
    settingSearch,
    settings,
    settingsMap,
    toggleTwoFactor,
    twoFactorCode,
    twoFactorEmailSent,
    twoFactorRequired,
  }
}
