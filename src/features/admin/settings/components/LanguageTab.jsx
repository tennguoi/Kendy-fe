import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../../../components/LanguageSwitcher/LanguageSwitcher'

function LanguageTab() {
  const { t } = useTranslation()

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
        </div>
      </div>
    </div>
  )
}

export default LanguageTab
