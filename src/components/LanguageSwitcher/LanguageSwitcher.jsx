import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en'

  const switchTo = (lang) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div className="lang-switcher" role="radiogroup" aria-label="Language">
      <button
        type="button"
        className={currentLang === 'vi' ? 'active' : ''}
        onClick={() => switchTo('vi')}
        role="radio"
        aria-checked={currentLang === 'vi'}
      >
        <span className="lang-flag" aria-hidden="true">🇻🇳</span>
        <span>VI</span>
      </button>
      <button
        type="button"
        className={currentLang === 'en' ? 'active' : ''}
        onClick={() => switchTo('en')}
        role="radio"
        aria-checked={currentLang === 'en'}
      >
        <span className="lang-flag" aria-hidden="true">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  )
}

export default LanguageSwitcher
