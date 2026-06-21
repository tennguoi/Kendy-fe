import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import './SearchField.css'

function SearchField({
  className = '',
  inputClassName = '',
  onChange,
  onClear,
  showClear = true,
  size = 'default',
  value = '',
  ...inputProps
}) {
  const { t } = useTranslation()

  const clear = () => {
    if (onClear) return onClear()
    onChange?.({ target: { value: '' } })
  }

  return (
    <label className={`search-field search-field-${size} ${className}`.trim()}>
      <Search className="search-field-icon" size={17} strokeWidth={2} aria-hidden="true" />
      <input {...inputProps} className={inputClassName} type="search" value={value} onChange={onChange} />
      {showClear && Boolean(value) && (
        <button type="button" className="search-field-clear" onClick={clear} aria-label={t('common.clearSearch', { defaultValue: 'Xóa nội dung tìm kiếm' })}>
          <X size={15} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}
    </label>
  )
}

export default SearchField
