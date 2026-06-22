import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en'

  const toggleLang = () => {
    i18n.changeLanguage(currentLang === 'vi' ? 'en' : 'vi')
  }

  return (
    <button
      type="button"
      className="lang-switcher"
      onClick={toggleLang}
      title={currentLang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      aria-label={currentLang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      {currentLang === 'vi' ? 'VI' : 'EN'}
    </button>
  )
}

export default LanguageSwitcher
