/**
 * Validation utilities for common form fields
 * Can be used with React Hook Form, Formik, or custom validation logic
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  // Simple but reasonable email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate Vietnamese phone number
 * Accepts formats: 09xxxxxxx, 012xxxxxxx, 03xxxxxxx, 07xxxxxxx, 08xxxxxxx, 05xxxxxxx, 06xxxxxxx
 * Or with country code +84
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhoneVn = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\s+/g, '');
  // Patterns: 0 followed by 9 digits, or +84 followed by 9-10 digits
  const vnitPattern = /^(0|\+84)?(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/;
  return vnitPattern.test(cleaned);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  if (!password || typeof password !== 'string') {
    errors.push('Mật khẩu là bắt buộc');
    return { isValid: false, errors };
  }
  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ hoa');
  }
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ thường');
  }
  // At least one digit
  if (!/\d/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một chữ số');
  }
  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất một ký tự đặc biệt');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate that a value is not empty (after trim)
 * @param {string} value
 * @returns {boolean}
 */
export const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate minimum length
 * Supports both minLength(value, min) and curried minLength(min)(value)
 * @param {string|number} valueOrMin
 * @param {number} [maybeMin]
 * @returns {boolean|Function}
 */
export const minLength = (valueOrMin, maybeMin) => {
  if (maybeMin !== undefined) {
    if (valueOrMin === undefined || valueOrMin === null) return false;
    return valueOrMin.toString().length >= maybeMin;
  }
  const min = valueOrMin;
  return (value) => {
    if (value === undefined || value === null) return false;
    return value.toString().length >= min;
  };
};

/**
 * Validate maximum length
 * Supports both maxLength(value, max) and curried maxLength(max)(value)
 * @param {string|number} valueOrMax
 * @param {number} [maybeMax]
 * @returns {boolean|Function}
 */
export const maxLength = (valueOrMax, maybeMax) => {
  if (maybeMax !== undefined) {
    if (valueOrMax === undefined || valueOrMax === null) return true;
    return valueOrMax.toString().length <= maybeMax;
  }
  const max = valueOrMax;
  return (value) => {
    if (value === undefined || value === null) return true;
    return value.toString().length <= max;
  };
};

/**
 * Validate numeric range
 * @param {string|number} value
 * @param {number} min
 * @param {number} max
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateNumberRange = (value, min, max) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return { isValid: false, error: 'Phải là một số' };
  }
  if (num < min) {
    return { isValid: false, error: `Giá trị phải lớn hơn hoặc bằng ${min}` };
  }
  if (num > max) {
    return { isValid: false, error: `Giá trị phải nhỏ hơn hoặc bằng ${max}` };
  }
  return { isValid: true };
};

/**
 * Validate that date is valid and optionally within range
 * @param {string|Date} dateValue
 * @param {Object} options
 * @param {Date|null} options.min - minimum date
 * @param {Date|null} options.max - maximum date
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateDate = (dateValue, options = {}) => {
  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else {
    return { isValid: false, error: 'Ngày không hợp lệ' };
  }

  if (Number.isNaN(date.getTime())) {
    return { isValid: false, error: 'Ngày không hợp lệ' };
  }

  if (options.min && date < options.min) {
    return { isValid: false, error: `Ngày phải sau ${options.min.toLocaleDateString()}` };
  }
  if (options.max && date > options.max) {
    return { isValid: false, error: `Ngày phải trước ${options.max.toLocaleDateString()}` };
  }

  return { isValid: true };
};

/**
 * Combine multiple validators
 * @param {...Function} validators - each validator receives value and returns {isValid: boolean, error?: string}
 * @returns {Function} validator function
 */
export const composeValidators = (...validators) => {
  return (value) => {
    for (const validator of validators) {
      if (typeof validator !== 'function') continue;
      const result = validator(value);
      if (typeof result === 'boolean') {
        if (!result) return { isValid: false };
      } else if (result && !result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
};

export default {
  isValidEmail,
  isValidPhoneVn,
  validatePasswordStrength,
  isRequired,
  minLength,
  maxLength,
  validateNumberRange,
  validateDate,
  composeValidators,
};