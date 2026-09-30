import { getDefaultErrorMessage } from '../../utils/validation';

/**
 * Base textarea component with validation and error display
 */
const BaseTextarea = ({
  label,
  name,
  value,
  onChange,
  validators = [],
  errorMessage = '',
  helperText,
  disabled = false,
  readOnly = false,
  rows = 2,
  placeholder,
  ...rest
}) => {
  // Run validation
  let error = '';
  if (validators && validators.length) {
    for (const validator of validators) {
      const result = typeof validator === 'function' ? validator(value) : validator;
      if (typeof result === 'boolean' && !result) {
        error = errorMessage || getDefaultErrorMessage();
        break;
      }
      if (result && result.isValid === false) {
        error = result.error || errorMessage || getDefaultErrorMessage();
        break;
      }
    }
  }

  return (
    <div className="base-textarea">
      {label && <label htmlFor={name} className="base-textarea-label">{label}</label>}
      <textarea
        id={name}
        name={name}
        value={value !== null && value !== undefined ? value : ''}
        onChange={(e) => {
          if (!onChange) return;
          try {
            onChange(e.target.value, e);
          } catch (err) {
            if (err instanceof TypeError && (err.message?.includes("reading 'value'") || err.message?.includes("reading 'target'"))) {
              onChange(e);
            } else {
              throw err;
            }
          }
        }}
        className={`base-textarea-field ${error ? 'error' : ''}`}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        placeholder={placeholder}
        {...rest}
      />
      {error && <span className="base-textarea-error">{error}</span>}
      {helperText && !error && <span className="base-textarea-helper">{helperText}</span>}
    </div>
  );
};

export default BaseTextarea;