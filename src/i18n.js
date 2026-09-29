import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import vi from './locales/vi/translation.json'
import en from './locales/en/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'kd_lang',
      caches: ['localStorage'],
    },
  })

if (import.meta.hot) {
  import.meta.hot.accept(['./locales/vi/translation.json', './locales/en/translation.json'], ([newVi, newEn]) => {
    if (newVi) i18n.addResourceBundle('vi', 'translation', newVi.default || newVi, true, true)
    if (newEn) i18n.addResourceBundle('en', 'translation', newEn.default || newEn, true, true)
    i18n.emit('loaded')
  })
}

export default i18n
