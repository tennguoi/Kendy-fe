import i18n from '../../i18n'

/**
 * Resolves an API error or exception into a clear, user-friendly localized message.
 * Prevents technical jargon, raw exception classes, and vague "invalid" or "Bad Request" strings.
 *
 * @param {any} err - The error object (ApiError, Error, or string)
 * @param {string} fallback - The fallback message (e.g. translated string)
 * @returns {string} User-friendly localized message
 */
export function resolveAdminError(err, fallback = '') {
  if (!err) return fallback

  const t = i18n.t.bind(i18n)

  // 1. If error has an error code in errorCodes dictionary, use the localized translation!
  if (err?.code) {
    const codeKey = `errorCodes.${err.code}`
    const translated = t(codeKey)
    if (translated && translated !== codeKey) {
      return translated
    }
  }

  const rawMsg = typeof err === 'string' ? err : (err?.message || '')
  const msg = typeof rawMsg === 'string' ? rawMsg.trim() : ''
  const lower = msg.toLowerCase()

  // 2. Semantic matching for backend exception messages
  // Admin & Auth
  if (lower.includes('confirmation password required') || lower.includes('confirmation password')) {
    return t('admin.errors.confirmationPasswordRequired', {
      defaultValue: 'Cần mật khẩu xác nhận của quản trị viên hoặc mật khẩu không chính xác.',
    })
  }
  if (lower.includes('current password is incorrect') || lower.includes('password is incorrect')) {
    return t('errorCodes.AUTH_OLD_PASSWORD_INCORRECT', { defaultValue: 'Mật khẩu hiện tại không đúng.' })
  }
  if (lower.includes('new password must be different')) {
    return t('errorCodes.AUTH_NEW_PASSWORD_SAME', { defaultValue: 'Mật khẩu mới phải khác mật khẩu hiện tại.' })
  }
  if (lower.includes('invalid verification code') || lower.includes('invalid 2fa code')) {
    return t('errorCodes.AUTH_TWO_FACTOR_INVALID', { defaultValue: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' })
  }
  if (lower.includes('2fa is already enabled')) {
    return t('admin.errors.twoFactorAlreadyEnabled', { defaultValue: 'Xác thực 2 bước đã được kích hoạt trước đó.' })
  }
  if (lower.includes('2fa is not enabled')) {
    return t('admin.errors.twoFactorNotEnabled', { defaultValue: 'Xác thực 2 bước chưa được kích hoạt.' })
  }
  if (lower.includes('admin cannot change own role')) {
    return t('errorCodes.ADMIN_CANNOT_MODIFY_SELF', { defaultValue: 'Không thể tự thay đổi quyền của chính mình.' })
  }
  if (lower.includes('cannot modify system role')) {
    return t('admin.errors.cannotModifySystemRole', { defaultValue: 'Không thể chỉnh sửa vai trò mặc định của hệ thống.' })
  }
  if (lower.includes('cannot delete system role')) {
    return t('admin.errors.cannotDeleteSystemRole', { defaultValue: 'Không thể xóa vai trò mặc định của hệ thống.' })
  }
  if (lower.includes('role is still assigned to users')) {
    return t('admin.errors.roleAssignedToUsers', { defaultValue: 'Vai trò vẫn đang được gán cho người dùng, không thể xóa.' })
  }
  if (lower.includes('role name already exists')) {
    return t('admin.errors.roleNameExists', { defaultValue: 'Tên vai trò đã tồn tại.' })
  }
  if (lower.includes('admin role required')) {
    return t('errorCodes.ADMIN_PERMISSION_DENIED', { defaultValue: 'Bạn không có quyền thực hiện hành động này.' })
  }
  if (lower.includes('admin role cannot be user')) {
    return t('admin.errors.adminRoleCannotBeUser', { defaultValue: 'Không thể gán quyền người dùng thông thường cho quản trị viên.' })
  }
  if (lower.includes('user is not an admin')) {
    return t('admin.errors.userNotAdmin', { defaultValue: 'Người dùng không phải là quản trị viên.' })
  }
  if (lower.includes('user not found')) {
    return t('admin.errors.userNotFound', { defaultValue: 'Không tìm thấy người dùng.' })
  }
  if (lower.includes('admin not found')) {
    return t('errorCodes.ADMIN_NOT_FOUND', { defaultValue: 'Không tìm thấy quản trị viên.' })
  }
  if (lower.includes('user is not active')) {
    return t('errorCodes.AUTH_ACCOUNT_LOCKED', { defaultValue: 'Tài khoản người dùng đang bị khóa hoặc chưa kích hoạt.' })
  }

  // Categories & Services
  if (lower.includes('category slug already exists')) {
    return t('admin.errors.categorySlugExists', { defaultValue: 'Đường dẫn slug của danh mục đã tồn tại.' })
  }
  if (lower.includes('category cannot be its own parent')) {
    return t('admin.errors.categorySelfParent', { defaultValue: 'Danh mục không thể là danh mục cha của chính nó.' })
  }
  if (lower.includes('category still has child categories')) {
    return t('admin.errors.categoryHasChildren', { defaultValue: 'Danh mục vẫn còn các danh mục con, không thể xóa.' })
  }
  if (lower.includes('category is still used by services')) {
    return t('admin.errors.categoryUsedByServices', { defaultValue: 'Danh mục vẫn đang được gắn với dịch vụ, không thể xóa.' })
  }
  if (lower.includes('category not found')) {
    return t('admin.errors.categoryNotFound', { defaultValue: 'Không tìm thấy danh mục dịch vụ.' })
  }
  if (lower.includes('service slug already exists')) {
    return t('admin.errors.serviceSlugExists', { defaultValue: 'Đường dẫn slug của dịch vụ đã tồn tại.' })
  }
  if (lower.includes('service not found')) {
    return t('errorCodes.SERVICE_NOT_FOUND', { defaultValue: 'Không tìm thấy dịch vụ.' })
  }
  if (lower.includes('slug is required')) {
    return t('admin.errors.slugRequired', { defaultValue: 'Vui lòng nhập đường dẫn slug.' })
  }
  if (lower.includes('slug already exists')) {
    return t('admin.errors.slugAlreadyExists', { defaultValue: 'Đường dẫn slug đã tồn tại.' })
  }

  // Coupons & Entitlements
  if (lower.includes('coupon code already exists')) {
    return t('admin.errors.couponCodeExists', { defaultValue: 'Mã giảm giá đã tồn tại.' })
  }
  if (lower.includes('coupon code is required')) {
    return t('admin.errors.couponCodeRequired', { defaultValue: 'Vui lòng nhập mã giảm giá.' })
  }
  if (lower.includes('a renewal request is already pending')) {
    return t('admin.errors.renewalPending', { defaultValue: 'Yêu cầu gia hạn cho quyền này đang được xử lý.' })
  }
  if (lower.includes('this access cannot be renewed')) {
    return t('admin.errors.accessCannotBeRenewed', { defaultValue: 'Quyền truy cập này không thể gia hạn.' })
  }
  if (lower.includes('extenddays is required')) {
    return t('admin.errors.extendDaysRequired', { defaultValue: 'Vui lòng nhập số ngày gia hạn.' })
  }

  // Warranty
  if (lower.includes('warranty request not found')) {
    return t('admin.errors.warrantyNotFound', { defaultValue: 'Không tìm thấy yêu cầu bảo hành.' })
  }
  if (lower.includes('warranty request is already resolved')) {
    return t('admin.errors.warrantyAlreadyResolved', { defaultValue: 'Yêu cầu bảo hành đã được xử lý xong trước đó.' })
  }
  if (lower.includes('cannot move warranty back to open')) {
    return t('admin.errors.warrantyCannotReopen', { defaultValue: 'Không thể chuyển trạng thái bảo hành về Mở.' })
  }
  if (lower.includes('this order has no delivered credential to replace')) {
    return t('admin.errors.warrantyNoCredential', { defaultValue: 'Đơn hàng không có tài khoản đã bàn giao để bảo hành đổi mới.' })
  }
  if (lower.includes('only completed orders can request warranty')) {
    return t('admin.errors.warrantyOnlyCompletedOrders', { defaultValue: 'Chỉ các đơn hàng đã hoàn thành mới có thể yêu cầu bảo hành.' })
  }
  if (lower.includes('warranty period has expired')) {
    return t('admin.errors.warrantyExpired', { defaultValue: 'Đã hết thời hạn bảo hành cho đơn hàng này.' })
  }

  // Wallet & Finance & Bank & Deposit
  if (lower.includes('insufficient wallet balance')) {
    return t('errorCodes.WALLET_INSUFFICIENT', { defaultValue: 'Số dư ví không đủ.' })
  }
  if (lower.includes('amount must be greater than zero')) {
    return t('validation.positiveNumber', { defaultValue: 'Số tiền phải lớn hơn 0.' })
  }
  if (lower.includes('unsupported wallet adjustment direction')) {
    return t('admin.errors.unsupportedDirection', { defaultValue: 'Hướng điều chỉnh ví không hợp lệ.' })
  }
  if (lower.includes('deposit request not found') || lower.includes('deposit not found')) {
    return t('admin.errors.depositNotFound', { defaultValue: 'Không tìm thấy yêu cầu nạp tiền.' })
  }
  if (lower.includes('cancelled deposit cannot be extended')) {
    return t('admin.errors.depositCancelledCannotExtend', { defaultValue: 'Yêu cầu nạp tiền đã hủy không thể gia hạn thêm thời gian.' })
  }
  if (lower.includes('cancelled deposit cannot be credited')) {
    return t('admin.errors.depositCancelledCannotCredit', { defaultValue: 'Yêu cầu nạp tiền đã hủy không thể cộng tiền.' })
  }
  if (lower.includes('deposit code is required')) {
    return t('admin.errors.depositCodeRequired', { defaultValue: 'Vui lòng nhập mã giao dịch nạp tiền.' })
  }
  if (lower.includes('bank transaction not found')) {
    return t('admin.errors.bankTxNotFound', { defaultValue: 'Không tìm thấy giao dịch ngân hàng.' })
  }
  if (lower.includes('bank transaction amount is invalid')) {
    return t('admin.errors.bankTxAmountInvalid', { defaultValue: 'Số tiền giao dịch ngân hàng không hợp lệ.' })
  }
  if (lower.includes('deposit request belongs to another user')) {
    return t('admin.errors.depositBelongsToOtherUser', { defaultValue: 'Yêu cầu nạp tiền này thuộc về người dùng khác.' })
  }
  if (lower.includes('deposit request has already been completed') || lower.includes('deposit has already been completed')) {
    return t('admin.errors.depositAlreadyCompleted', { defaultValue: 'Yêu cầu nạp tiền đã hoàn thành trước đó.' })
  }
  if (lower.includes('deposit request has been cancelled') || lower.includes('deposit has been cancelled')) {
    return t('admin.errors.depositAlreadyCancelled', { defaultValue: 'Yêu cầu nạp tiền đã bị hủy bỏ trước đó.' })
  }
  if (lower.includes('bank transaction has already been credited')) {
    return t('admin.errors.bankTxAlreadyCredited', { defaultValue: 'Giao dịch ngân hàng này đã được cộng tiền vào ví trước đó.' })
  }
  if (lower.includes('duplicate bank transaction cannot be reprocessed')) {
    return t('admin.errors.bankTxDuplicate', { defaultValue: 'Giao dịch ngân hàng trùng lặp, không thể xử lý lại.' })
  }
  if (lower.includes('only incoming bank transactions can be credited')) {
    return t('admin.errors.bankTxOnlyIncoming', { defaultValue: 'Chỉ giao dịch nhận tiền (tiền vào) mới có thể cộng tiền.' })
  }
  if (lower.includes('deposit request has already been credited')) {
    return t('admin.errors.depositAlreadyCredited', { defaultValue: 'Yêu cầu nạp tiền này đã được cộng tiền trước đó.' })
  }
  if (lower.includes('deposit is under manual review')) {
    return t('admin.errors.depositUnderReview', { defaultValue: 'Yêu cầu nạp tiền đang trong quá trình xét duyệt thủ công.' })
  }
  if (lower.includes('completed deposit cannot be cancelled')) {
    return t('admin.errors.depositCompletedCannotCancel', { defaultValue: 'Yêu cầu nạp tiền đã hoàn thành không thể hủy.' })
  }

  // 3. Filter out raw technical / generic strings
  const isGeneric = !msg ||
    lower === 'invalid' ||
    lower === 'bad request' ||
    lower === 'forbidden' ||
    lower === 'unauthorized' ||
    lower === 'not found' ||
    lower === 'internal server error' ||
    lower.startsWith('yêu cầu thất bại (') ||
    lower.includes('request failed with status code') ||
    lower.includes('com.example.') ||
    lower.includes('nullpointerexception') ||
    lower.includes('runtimeexception') ||
    lower.includes('exception') ||
    lower.includes('validation failed')

  if (!isGeneric && msg) {
    // If msg is purely ASCII English and current language is Vietnamese, and a localized fallback is provided, use fallback!
    const isAsciiOnly = /^[\x00-\x7F]*$/.test(msg)
    if (isAsciiOnly && i18n.language === 'vi' && fallback) {
      return fallback
    }
    return msg
  }

  return fallback || t('common.error', { defaultValue: 'Đã có lỗi xảy ra.' })
}
