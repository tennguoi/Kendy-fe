import { useTranslation } from 'react-i18next'

function CatalogToolbar({ count }) {
  const { t } = useTranslation()
  return (
    <div className="catalog-toolbar">
      <div>
        <h2>{t('services.catalogTitle', { defaultValue: 'Catalog dịch vụ' })}</h2>
      </div>
      <div className="catalog-summary">
        <span>{t('services.serviceCount', { count, defaultValue: '{{count}} dịch vụ' })}</span>
      </div>
    </div>
  )
}

export default CatalogToolbar
