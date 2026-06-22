import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../../../components/LanguageSwitcher/LanguageSwitcher'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../../../contexts/ThemeContext'

function LanguageTab() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <div className="settings-tab-content">
      <div className="admin-form compact">
        <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
          {t('admin.settings.language.description')}
        </p>
        <div className="settings-language-switcher">
          <label>
            <span>{t('admin.settings.language.label')}</span>
            <LanguageSwitcher />
          </label>
          <label>
            <span>{t('admin.settings.language.themeLabel')}</span>
            <button
              type="button"
              className="admin-icon-button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === 'dark' ? t('admin.settings.language.themeLight') : t('admin.settings.language.themeDark')}</span>
            </button>
          </label>
        </div>
      </div>
    </div>
  )
}

export default LanguageTab
