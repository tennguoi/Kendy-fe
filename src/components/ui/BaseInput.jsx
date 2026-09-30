import { useState } from 'react';
import { getDefaultErrorMessage } from '../../utils/validation';

/**
 * Base input component with validation and error display
 * Usage:
 * <BaseInput
 *   label="Email"
 *   name="email"
 *   type="email"
 *   value={form.email}
 *   onChange={handleChange}
 *   validators={[isRequired, isValidEmail]}
 *   errorMessage="Vui lòng nhập email hợp lệ"
 * />
 */
const BaseInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  validators = [],
  errorMessage = '',
  helperText,
  disabled = false,
  readOnly = false,
  inputMode,
  autoComplete,
  placeholder,
  children,
  ...rest
}) => {
  const [touched, setTouched] = useState(false);

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

  // Only display validation error if the field has been interacted with (touched or has value)
  const hasValue = value !== null && value !== undefined && value !== '';
  const shouldShowError = (touched || hasValue) && Boolean(error);

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    if (!onChange) return;
    if (type === 'file') {
      onChange(e);
      return;
    }
    const val = type === 'checkbox' ? e.target.checked : e.target.value;
    try {
      onChange(val, e);
    } catch (err) {
      if (err instanceof TypeError && (err.message?.includes("reading 'value'") || err.message?.includes("reading 'checked'") || err.message?.includes("reading 'target'"))) {
        onChange(e);
      } else {
        throw err;
      }
    }
  };

  const inputProps = {
    id: name,
    name: name,
    type: type,
    onChange: handleChange,
    onBlur: handleBlur,
    className: `base-input-field ${shouldShowError ? 'error' : ''}`,
    disabled: disabled,
    readOnly: readOnly,
    inputMode: inputMode,
    autoComplete: autoComplete,
    placeholder: placeholder,
    ...rest,
  };

  if (type !== 'file') {
    inputProps.value = value !== null && value !== undefined ? value : '';
  }

  return (
    <div className="base-input">
      {label && <label htmlFor={name} className="base-input-label">{label}</label>}
      <div className={`base-input-wrapper ${shouldShowError ? 'has-error' : ''} ${children ? 'has-addon' : ''}`}>
        <input {...inputProps} />
        {children}
      </div>
      {shouldShowError && <span className="base-input-error">{error}</span>}
      {helperText && !shouldShowError && <span className="base-input-helper">{helperText}</span>}
    </div>
  );
};

export default BaseInput;