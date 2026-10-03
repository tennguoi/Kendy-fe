import { useId, useState } from 'react';
import { getDefaultErrorMessage } from '../../utils/validation';

function runValidators(validators, value, errorMessage) {
  for (const validator of validators) {
    let result;
    try {
      result = typeof validator === 'function' ? validator(value) : validator;
    } catch (err) {
      console.error('Validator error:', err);
      return errorMessage || getDefaultErrorMessage();
    }
    if (result === false) return errorMessage || getDefaultErrorMessage();
    if (result && result.isValid === false) {
      return result.error || errorMessage || getDefaultErrorMessage();
    }
  }
  return '';
}

const BaseInput = ({
  label, name, type = 'text', value, onChange, onBlur,
  validators = [], errorMessage = '', helperText,
  showError = false,            // ép hiện lỗi khi submit
  disabled = false, readOnly = false,
  className = '', children, ...rest
}) => {
  const [touched, setTouched] = useState(false);
  const autoId = useId();
  const id = rest.id ?? `${name}-${autoId}`;
  const isToggle = type === 'checkbox' || type === 'radio';

  const error = runValidators(validators, value, errorMessage);
  const shouldShowError = (touched || showError) && Boolean(error);

  const handleBlur = (e) => {
    setTouched(true);
    onBlur?.(e);
  };

  // Hợp đồng duy nhất: onChange(value, event)
  const handleChange = (e) => {
    if (!onChange) return;
    const val =
      type === 'file' ? e.target.files :
      type === 'checkbox' ? e.target.checked :
      e.target.value;
    onChange(val, e);
  };

  const inputProps = {
    ...rest,                      // đặt trước để không ghi đè props bên dưới
    id, name, type,
    onChange: handleChange,
    onBlur: handleBlur,
    className: `base-input-field ${shouldShowError ? 'error' : ''} ${className}`.trim(),
    disabled, readOnly,
    'aria-invalid': shouldShowError || undefined,
    'aria-describedby': shouldShowError ? `${id}-error` : helperText ? `${id}-help` : undefined,
  };

  if (type === 'checkbox') inputProps.checked = Boolean(value);
  else if (type !== 'file') inputProps.value = value ?? '';

  return (
    <div className="base-input">
      {label && <label htmlFor={id} className="base-input-label">{label}</label>}
      <div className={`base-input-wrapper ${shouldShowError ? 'has-error' : ''} ${children ? 'has-addon' : ''}`}>
        <input {...inputProps} />
        {children}
      </div>
      {shouldShowError && <span id={`${id}-error`} role="alert" className="base-input-error">{error}</span>}
      {helperText && !shouldShowError && <span id={`${id}-help`} className="base-input-helper">{helperText}</span>}
    </div>
  );
};

export default BaseInput;