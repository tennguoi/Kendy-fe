import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { getDefaultErrorMessage } from '../../utils/validation';
import './BaseSelect.css';

/**
 * Custom ultra-premium select dropdown with smooth micro-interactions,
 * deduplication, dark mode glassmorphism, and full backward compatibility.
 */
const BaseSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  validators = [],
  errorMessage = '',
  helperText,
  disabled = false,
  placeholder = 'Chọn một tùy chọn',
  className = '',
  ...rest
}) => {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Validate value if validators provided
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

  // Deduplicate and normalize options
  const normalizedOptions = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const opt of options) {
      const val = opt?.value ?? '';
      const key = String(val);
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          value: val,
          label: opt?.label ?? String(val),
        });
      }
    }
    return list;
  }, [options]);

  // Determine current display label
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value ?? ''));
  const hasValue = value !== '' && value !== null && value !== undefined;
  const displayLabel = selectedOption ? selectedOption.label : (hasValue ? String(value) : placeholder);
  const isPlaceholder = !selectedOption && !hasValue;

  // Handle click outside & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue, e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (!onChange) return;

    // Dual compatibility: supports both onChange(val, event) and onChange(event)
    try {
      onChange(optValue, { target: { value: optValue, name } });
    } catch (err) {
      if (err instanceof TypeError && (err.message?.includes("reading 'value'") || err.message?.includes("reading 'target'"))) {
        onChange({ target: { value: optValue, name } });
      } else {
        throw err;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`base-select ${isOpen ? 'is-open' : ''} ${error ? 'has-error' : ''} ${className}`.trim()}
    >
      {label && <label htmlFor={name} className="base-select-label">{label}</label>}

      <input type="hidden" name={name} value={value ?? ''} />

      <button
        type="button"
        id={name}
        className="base-select-trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        {...rest}
      >
        <span className={`base-select-value ${isPlaceholder ? 'is-placeholder' : ''}`}>
          {displayLabel}
        </span>
        <span className="base-select-chevron" aria-hidden="true">
          <ChevronDown size={15} strokeWidth={2.2} />
        </span>
      </button>

      {isOpen && (
        <div className="base-select-menu" role="listbox" aria-label={label || placeholder}>
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value ?? '');
            return (
              <button
                key={String(opt.value)}
                type="button"
                className={`base-select-option ${isSelected ? 'is-selected' : ''}`}
                onClick={(e) => handleSelect(opt.value, e)}
                role="option"
                aria-selected={isSelected}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="base-select-check" aria-hidden="true">
                    <Check size={14} strokeWidth={2.4} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && <span className="base-select-error">{error}</span>}
      {helperText && !error && <span className="base-select-helper">{helperText}</span>}
    </div>
  );
};

export default BaseSelect;