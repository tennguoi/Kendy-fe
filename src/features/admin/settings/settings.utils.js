export function downloadBlobFile(fileName, blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadTextFile(fileName, content) {
  downloadBlobFile(fileName, new Blob([content], { type: 'text/csv;charset=utf-8' }))
}

export function toSettingsMap(settingsList) {
  const map = {}
  settingsList.forEach((setting) => {
    map[setting.key] = setting.value
  })
  return map
}

export function sepayConfigToObject(items) {
  const config = {}
  items.forEach((item) => {
    config[item.key.replace(/^sepay\./, '')] = item.value
  })
  return config
}

export function mergeSettings(currentSettings, savedSettings) {
  const savedByKey = new Map(savedSettings.map((setting) => [setting.key, setting]))
  const merged = currentSettings.map((setting) => savedByKey.get(setting.key) || setting)

  savedSettings.forEach((setting) => {
    if (!currentSettings.some((item) => item.key === setting.key)) {
      merged.push(setting)
    }
  })

  return merged
}
