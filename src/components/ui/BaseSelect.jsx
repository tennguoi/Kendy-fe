/**
 * Base select component with validation and error display
 */
const BaseSelect = ({
  label,
  name,
  value,
  onChange,
  options = [], // array of {value, label}
  validators = [],
  errorMessage = '',
  helperText,
  disabled = false,
  placeholder = 'Chọn một tùy chọn',
  ...rest
}) => {
  // Run validation
  let error = '';
  if (validators && validators.length) {
    for (const validator of validators) {
      const result = typeof validator === 'function' ? validator(value) : validator;
      if (result && result.isValid === false) {
        error = result.error || errorMessage;
        break;
      }
    }
  }

  return (
    <div className="base-select">
      {label && <label htmlFor={name} className="base-select-label">{label}</label>}
      <select
        id={name}
        name={name}
        value={value !== null && value !== undefined ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className={`base-select-field ${error ? 'error' : ''}`}
        disabled={disabled}
        {...rest}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="base-select-error">{error}</span>}
      {helperText && !error && <span className="base-select-helper">{helperText}</span>}
    </div>
  );
};

export default BaseSelect;