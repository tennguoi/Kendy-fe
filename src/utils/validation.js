import i18n from '../i18n';

/**
 * Helper to get localized validation message or fallback
 * @param {string} key
 * @param {string} defaultText
 * @param {Object} [options]
 * @returns {string}
 */
export const tVal = (key, defaultText, options = {}) => {
  if (i18n && typeof i18n.t === 'function') {
    return i18n.t(`validation.${key}`, { defaultValue: defaultText, ...options });
  }
  return defaultText;
};

/**
 * Get default generic invalid message in current language
 * @returns {string}
 */
export const getDefaultErrorMessage = () => {
  return tVal('defaultInvalid', 'Trường này không hợp lệ');
};

/**
 * Validate email format (boolean)
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate Vietnamese phone number (boolean)
 * Format: 0 followed by 9-10 digits (max 11 chars)
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhoneVn = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length > 11) return false;
  const vnitPattern = /^0[0-9]{9,10}$/;
  return vnitPattern.test(cleaned);
};

/**
 * Validate URL format (boolean)
 * @param {string} url
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate slug / code format (boolean)
 * @param {string} slug
 * @returns {boolean}
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
};

/**
 * Validate Hex Color format (boolean)
 * @param {string} color
 * @returns {boolean}
 */
export const isValidHexColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color.trim());
};

/**
 * Validate JSON string format (boolean)
 * @param {string} str
 * @returns {boolean}
 */
export const isValidJson = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    JSON.parse(str.trim());
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  if (!password || typeof password !== 'string') {
    errors.push(tVal('passwordRequired', 'Mật khẩu là bắt buộc'));
    return { isValid: false, errors };
  }
  if (password.length < 8) {
    errors.push(tVal('passwordMin', 'Mật khẩu phải có ít nhất 8 ký tự', { min: 8 }));
  }
  if (!/[A-Z]/.test(password)) {
    errors.push(tVal('passwordUppercase', 'Mật khẩu phải chứa ít nhất một chữ hoa'));
  }
  if (!/[a-z]/.test(password)) {
    errors.push(tVal('passwordLowercase', 'Mật khẩu phải chứa ít nhất một chữ thường'));
  }
  if (!/\d/.test(password)) {
    errors.push(tVal('passwordDigit', 'Mật khẩu phải chứa ít nhất một chữ số'));
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push(tVal('passwordSpecial', 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'));
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate that a value is not empty (after trim) (boolean)
 * @param {any} value
 * @returns {boolean}
 */
export const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate minimum length (boolean or curried validator)
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
 * Validate maximum length (boolean or curried validator)
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
 * Check if two values match (boolean)
 * @param {any} val1
 * @param {any} val2
 * @returns {boolean}
 */
export const isMatching = (val1, val2) => {
  return val1 === val2;
};

/**
 * Validate numeric range
 * @param {string|number} value
 * @param {number} min
 * @param {number} max
 * @param {string} [message]
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateNumberRange = (value, min, max, message) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return { isValid: false, error: message || tVal('number', 'Phải là một số hợp lệ') };
  }
  if (num < min) {
    return { isValid: false, error: message || tVal('numberMin', `Giá trị phải lớn hơn hoặc bằng ${min}`, { min }) };
  }
  if (num > max) {
    return { isValid: false, error: message || tVal('numberMax', `Giá trị phải nhỏ hơn hoặc bằng ${max}`, { max }) };
  }
  return { isValid: true };
};

/**
 * Validate required field for Form / BaseInput
 * @param {any} value
 * @param {string} [message]
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateRequired = (value, message) => {
  return isRequired(value)
    ? { isValid: true }
    : { isValid: false, error: message || tVal('required', 'Trường này không được để trống') };
};

/**
 * Validate email for Form / BaseInput
 * @param {string} value
 * @param {string} [message]
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateEmail = (value, message) => {
  if (!isRequired(value)) return { isValid: true };
  return isValidEmail(value)
    ? { isValid: true }
    : { isValid: false, error: message || tVal('email', 'Email không đúng định dạng') };
};

/**
 * Validate phone number for Form / BaseInput
 * @param {string} value
 * @param {string} [message]
 * @returns {{isValid: boolean, error?: string}}
 */
export const validatePhoneVn = (value, message) => {
  if (!isRequired(value)) return { isValid: true };
  return isValidPhoneVn(value)
    ? { isValid: true }
    : { isValid: false, error: message || tVal('phone', 'Số điện thoại phải từ 10-11 số và bắt đầu bằng số 0') };
};

/**
 * Validate that two values match (curried for BaseInput)
 * @param {any} targetValue
 * @param {string} [message]
 * @returns {Function}
 */
export const validateMatch = (targetValue, message) => {
  return (value) => {
    return value === targetValue
      ? { isValid: true }
      : { isValid: false, error: message || tVal('match', 'Giá trị không trùng khớp') };
  };
};

/**
 * Validate positive number (> 0)
 * @param {string|number} value
 * @param {string} [message]
 * @returns {{isValid: boolean, error?: string}}
 */
export const validatePositiveNumber = (value, message) => {
  if (value === '' || value === undefined || value === null) return { isValid: true };
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) {
    return { isValid: false, error: message || tVal('positiveNumber', 'Giá trị phải lớn hơn 0') };
  }
  return { isValid: true };
};

/**
 * Validate non-negative number (>= 0)
 * @param {string|number} value
 * @param {string} [message]
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateNonNegativeNumber = (value, message) => {
  if (value === '' || value === undefined || value === null) return { isValid: true };
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    return { isValid: false, error: message || tVal('nonNegativeNumber', 'Phải là số không âm') };
  }
  return { isValid: true };
};

/**
 * Validate positive integer (> 0 and is integer)
 * @param {string|number} value
 * @param {string} [message]
 * @returns {{isValid: boolean, error?: string}}
 */
export const validatePositiveInteger = (value, message) => {
  if (value === '' || value === undefined || value === null) return { isValid: true };
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return { isValid: false, error: message || tVal('positiveInteger', 'Phải là số nguyên dương') };
  }
  return { isValid: true };
};

/**
 * Validate file size
 * @param {File} file
 * @param {number} maxBytes
 * @param {string} [message]
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateFileSize = (file, maxBytes = 10 * 1024 * 1024, message) => {
  if (!file) return { isValid: true };
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return {
      isValid: false,
      error: message || tVal('fileSize', `Dung lượng tệp không được vượt quá ${mb}MB`, { max: mb }),
    };
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
    return { isValid: false, error: tVal('dateInvalid', 'Ngày không hợp lệ') };
  }

  if (Number.isNaN(date.getTime())) {
    return { isValid: false, error: tVal('dateInvalid', 'Ngày không hợp lệ') };
  }

  if (options.min && date < options.min) {
    const formatted = options.min.toLocaleDateString();
    return { isValid: false, error: tVal('dateAfter', `Ngày phải sau ${formatted}`, { date: formatted }) };
  }
  if (options.max && date > options.max) {
    const formatted = options.max.toLocaleDateString();
    return { isValid: false, error: tVal('dateBefore', `Ngày phải trước ${formatted}`, { date: formatted }) };
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
  tVal,
  getDefaultErrorMessage,
  isValidEmail,
  isValidPhoneVn,
  isValidUrl,
  isValidSlug,
  isValidHexColor,
  isValidJson,
  validatePasswordStrength,
  isRequired,
  minLength,
  maxLength,
  isMatching,
  validateNumberRange,
  validateRequired,
  validateEmail,
  validatePhoneVn,
  validateMatch,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validatePositiveInteger,
  validateFileSize,
  validateDate,
  composeValidators,
};