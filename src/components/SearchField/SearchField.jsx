import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import BaseInput from '../ui/BaseInput'
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

  const handleInputChange = (val, event) => {
    if (!onChange) return
    const syntheticEvent = (event && event.target) ? event : { target: { value: val ?? '' } }
    onChange(syntheticEvent, val)
  }

  return (
    <div className={`search-field search-field-${size} ${className}`.trim()} role="search">
      <Search className="search-field-icon" size={17} strokeWidth={2} aria-hidden="true" />
      <BaseInput
        {...inputProps}
        className={inputClassName}
        type="search"
        value={value}
        onChange={handleInputChange}
      />
      {showClear && Boolean(value) && (
        <button type="button" className="search-field-clear" onClick={clear} aria-label={t('common.clearSearch', { defaultValue: 'Xóa nội dung tìm kiếm' })}>
          <X size={15} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default SearchField