export const EMAIL_TEMPLATE_DEFINITIONS = [
  {
    slug: 'email_verification',
    label: 'Xác minh email',
    description: 'Gửi sau khi người dùng đăng ký tài khoản.',
    type: 'link',
    defaults: {
      subject: 'Xác minh địa chỉ email Kendy Digital',
      heading: 'Xác minh địa chỉ email',
      intro: 'Chào {{name}}, cảm ơn bạn đã đăng ký tài khoản. Hãy xác minh địa chỉ email để hoàn tất thiết lập tài khoản.',
      actionLabel: 'Xác minh email',
      detail: 'Liên kết xác minh sẽ hết hạn vào {{expiresAt}}.',
      securityNote: 'Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email.',
      footer: 'Đây là email tự động từ Kendy Digital. Vui lòng không trả lời email này.',
    },
  },
  {
    slug: 'password_reset',
    label: 'Đặt lại mật khẩu',
    description: 'Gửi khi người dùng yêu cầu khôi phục mật khẩu.',
    type: 'code',
    defaults: {
      subject: 'Đặt lại mật khẩu Kendy Digital',
      heading: 'Đặt lại mật khẩu',
      intro: 'Chào {{name}}, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Sử dụng mã xác nhận bên dưới để tiếp tục.',
      codeLabel: 'Mã xác nhận',
      actionLabel: 'Đặt lại mật khẩu',
      detail: 'Mã xác nhận sẽ hết hạn vào {{expiresAt}}.',
      securityNote: 'Nếu bạn không gửi yêu cầu này, hãy bỏ qua email và kiểm tra lại bảo mật tài khoản.',
      footer: 'Đây là email tự động từ Kendy Digital. Vui lòng không trả lời email này.',
    },
  },
  {
    slug: 'two_factor',
    label: 'Mã xác thực 2FA',
    description: 'Gửi mã bảo mật khi đăng nhập hoặc bật xác thực hai bước.',
    type: 'code',
    defaults: {
      subject: 'Mã xác thực Kendy Digital của bạn',
      heading: 'Mã xác thực hai bước',
      intro: 'Chào {{name}}, sử dụng mã bên dưới để hoàn tất yêu cầu bảo mật của bạn.',
      codeLabel: 'Mã xác thực',
      detail: 'Mã này sẽ hết hạn vào {{expiresAt}}.',
      securityNote: 'Không chia sẻ mã này với bất kỳ ai. Kendy Digital sẽ không bao giờ hỏi mã qua điện thoại hoặc tin nhắn.',
      footer: 'Đây là email tự động từ Kendy Digital. Vui lòng không trả lời email này.',
    },
  },
]

const sampleVariables = {
  '{{name}}': 'Nguyễn Văn A',
  '{{email}}': 'nguyenvana@example.com',
  '{{link}}': 'https://kendydigital.com/verify-email?token=sample',
  '{{code}}': '482913',
  '{{expiresAt}}': '18:30, 30/06/2026',
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function parseTextConfig(summary) {
  if (!summary) return null
  try {
    const parsed = JSON.parse(summary)
    return parsed && !Array.isArray(parsed) && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function text(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function escapeHtml(value) {
  return text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function textToHtml(value) {
  return escapeHtml(value).replaceAll('\n', '<br>')
}

export function buildEmailTemplateDrafts(items) {
  const records = new Map((Array.isArray(items) ? items : []).map((item) => [item.slug, item]))

  return Object.fromEntries(
    EMAIL_TEMPLATE_DEFINITIONS.map((definition) => {
      const record = records.get(definition.slug)
      const stored = parseTextConfig(record?.summary)
      const defaults = clone(definition.defaults)
      const draft = Object.fromEntries(
        Object.entries(defaults).map(([key, fallback]) => [key, text(stored?.[key], fallback)]),
      )
      draft.subject = text(record?.title, draft.subject)
      return [definition.slug, draft]
    }),
  )
}

export function renderTransactionalEmail(definition, config, brand) {
  const brandName = escapeHtml(brand?.name || 'Kendy Digital')
  const logoUrl = text(brand?.logoUrl).trim()
  const safeLogoUrl = /^https?:\/\//i.test(logoUrl) ? escapeHtml(logoUrl) : ''
  const codeBlock = definition.type === 'code' ? `
      <tr>
        <td style="padding:8px 40px 24px;">
          <div style="font-size:12px;font-weight:600;color:#57606a;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">${textToHtml(config.codeLabel)}</div>
          <div style="padding:18px 20px;border:1px solid #d0d7de;border-radius:6px;background:#f6f8fa;color:#24292f;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;">{{code}}</div>
        </td>
      </tr>` : ''

  const linkBlock = definition.type === 'link' || definition.slug === 'password_reset' ? `
      <tr>
        <td style="padding:8px 40px 24px;text-align:center;">
          <a href="{{link}}" style="display:inline-block;padding:11px 22px;border:1px solid rgba(27,31,36,.15);border-radius:6px;color:#ffffff;background:#1f883d;font-size:14px;font-weight:600;line-height:20px;text-decoration:none;">${textToHtml(config.actionLabel || '')}</a>
        </td>
      </tr>` : ''

  const actionBlock = codeBlock + linkBlock

  const logoBlock = safeLogoUrl
    ? `<img src="${safeLogoUrl}" width="44" height="44" alt="${brandName}" style="display:block;width:44px;height:44px;margin:0 auto 12px;border-radius:8px;object-fit:contain;">`
    : `<div style="width:44px;height:44px;margin:0 auto 12px;border-radius:50%;color:#ffffff;background:#24292f;font-size:17px;font-weight:700;line-height:44px;text-align:center;">KD</div>`

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(config.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f8fa;color:#24292f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f6f8fa;">
    <tr>
      <td style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:544px;margin:0 auto;">
          <tr>
            <td style="padding:0 0 20px;text-align:center;">
              ${logoBlock}
              <strong style="color:#24292f;font-size:16px;">${brandName}</strong>
            </td>
          </tr>
          <tr>
            <td style="overflow:hidden;border:1px solid #d0d7de;border-radius:6px;background:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:36px 40px 12px;">
                    <h1 style="margin:0;color:#24292f;font-size:24px;font-weight:600;line-height:1.25;text-align:center;">${textToHtml(config.heading)}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 40px 20px;color:#57606a;font-size:15px;line-height:1.6;">${textToHtml(config.intro)}</td>
                </tr>
                ${actionBlock}
                <tr>
                  <td style="padding:0 40px 22px;color:#57606a;font-size:13px;line-height:1.6;text-align:center;">${textToHtml(config.detail)}</td>
                </tr>
                <tr>
                  <td style="padding:0 40px 36px;">
                    <div style="padding:16px;border:1px solid #d8dee4;border-radius:6px;color:#57606a;background:#f6f8fa;font-size:12px;line-height:1.55;">${textToHtml(config.securityNote)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 0;color:#6e7781;font-size:11px;line-height:1.55;text-align:center;">${textToHtml(config.footer)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function renderEmailPreview(definition, config, brand) {
  let html = renderTransactionalEmail(definition, config, brand)
  for (const [variable, value] of Object.entries(sampleVariables)) {
    html = html.replaceAll(variable, value)
  }
  return html
}
