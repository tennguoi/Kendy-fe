import { faqGroups } from './faqs.public'

export const SITE_SETTING_SLUGS = {
  banner: 'promo-banner',
  faq: 'faq-section',
  brand: 'brand-settings',
  theme: 'theme-settings',
}

const defaultFaqItems = faqGroups.flatMap((group) =>
  group.items.map((item, index) => ({
    id: `${group.title}-${index}`,
    question: item.question,
    answer: item.answer,
  })),
)

export const defaultSiteSettings = {
  banner: {
    enabled: false,
    eyebrow: 'Ưu đãi có thời hạn',
    title: 'Khuyến mãi đặc biệt',
    description: 'Áp dụng cho các dịch vụ được chọn trong thời gian chương trình.',
    ctaLabel: 'Xem ưu đãi',
    ctaUrl: '/catalog',
    backgroundColor: '#172033',
    textColor: '#ffffff',
    countdownEnabled: false,
    endsAt: '',
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Các câu hỏi thường gặp',
    items: defaultFaqItems,
  },
  brand: {
    name: 'Kendy Digital',
    tagline: 'Tài khoản, nâng cấp & quảng cáo',
    logoUrl: '',
    description:
      'Mua tài khoản Facebook, nâng cấp CapCut Pro, đăng ký dịch vụ quảng cáo và nhận hỗ trợ sau mua.',
    email: '',
    phone: '',
    address: '',
    copyright: 'Kendy Digital',
    socials: [
      { id: 'facebook', label: 'Facebook', url: '' },
      { id: 'zalo', label: 'Zalo', url: '' },
    ],
  },
  theme: {
    primaryColor: '#2563eb',
    primaryHoverColor: '#1d4ed8',
    accentColor: '#0891b2',
  },
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function parseObject(content) {
  if (!content) return null
  try {
    const parsed = JSON.parse(content)
    return parsed && !Array.isArray(parsed) && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function cleanString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

export function normalizeHexColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback
}

function normalizeFaq(data) {
  const sourceItems = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.groups)
      ? data.groups.flatMap((group) =>
          (group.items || group.questions || []).map((item) => ({
            question: item.question || item.q,
            answer: item.answer || item.a,
          })),
        )
      : []

  const items = sourceItems
    .filter((item) => item && (item.question || item.q) && (item.answer || item.a))
    .map((item, index) => ({
      id: cleanString(item.id, `faq-${index}`),
      question: cleanString(item.question || item.q).trim(),
      answer: cleanString(item.answer || item.a).trim(),
    }))

  return {
    eyebrow: cleanString(data?.eyebrow, defaultSiteSettings.faq.eyebrow),
    title: cleanString(data?.title, defaultSiteSettings.faq.title),
    items: items.length ? items : clone(defaultSiteSettings.faq.items),
  }
}

function normalizeBrand(data) {
  const socials = Array.isArray(data?.socials)
    ? data.socials
        .filter((item) => item && (item.label || item.url))
        .map((item, index) => ({
          id: cleanString(item.id, `social-${index}`),
          label: cleanString(item.label).trim(),
          url: cleanString(item.url).trim(),
        }))
    : clone(defaultSiteSettings.brand.socials)

  return {
    ...defaultSiteSettings.brand,
    ...data,
    name: cleanString(data?.name || data?.brand, defaultSiteSettings.brand.name),
    tagline: cleanString(data?.tagline, defaultSiteSettings.brand.tagline),
    logoUrl: cleanString(data?.logoUrl),
    description: cleanString(data?.description, defaultSiteSettings.brand.description),
    email: cleanString(data?.email),
    phone: cleanString(data?.phone),
    address: cleanString(data?.address),
    copyright: cleanString(data?.copyright, defaultSiteSettings.brand.copyright),
    socials,
  }
}

function normalizeBanner(data) {
  return {
    ...defaultSiteSettings.banner,
    ...data,
    enabled: Boolean(data?.enabled),
    countdownEnabled: Boolean(data?.countdownEnabled),
    eyebrow: cleanString(data?.eyebrow, defaultSiteSettings.banner.eyebrow),
    title: cleanString(data?.title, defaultSiteSettings.banner.title),
    description: cleanString(data?.description, defaultSiteSettings.banner.description),
    ctaLabel: cleanString(data?.ctaLabel, defaultSiteSettings.banner.ctaLabel),
    ctaUrl: cleanString(data?.ctaUrl, defaultSiteSettings.banner.ctaUrl),
    backgroundColor: normalizeHexColor(
      data?.backgroundColor,
      defaultSiteSettings.banner.backgroundColor,
    ),
    textColor: normalizeHexColor(data?.textColor, defaultSiteSettings.banner.textColor),
    endsAt: cleanString(data?.endsAt),
  }
}

function normalizeTheme(data) {
  return {
    primaryColor: normalizeHexColor(
      data?.primaryColor,
      defaultSiteSettings.theme.primaryColor,
    ),
    primaryHoverColor: normalizeHexColor(
      data?.primaryHoverColor,
      defaultSiteSettings.theme.primaryHoverColor,
    ),
    accentColor: normalizeHexColor(
      data?.accentColor,
      defaultSiteSettings.theme.accentColor,
    ),
  }
}

export function buildSiteSettings(items) {
  const contentBySlug = new Map(
    (Array.isArray(items) ? items : []).map((item) => [item.slug, parseObject(item.content)]),
  )

  return {
    banner: normalizeBanner(contentBySlug.get(SITE_SETTING_SLUGS.banner)),
    faq: normalizeFaq(contentBySlug.get(SITE_SETTING_SLUGS.faq)),
    brand: normalizeBrand(contentBySlug.get(SITE_SETTING_SLUGS.brand)),
    theme: normalizeTheme(contentBySlug.get(SITE_SETTING_SLUGS.theme)),
  }
}

export function applySiteTheme(theme) {
  const root = document.documentElement
  root.style.setProperty('--kd-blue', theme.primaryColor)
  root.style.setProperty('--kd-blue-hover', theme.primaryHoverColor)
  root.style.setProperty('--kd-cyan', theme.accentColor)
}

export function resetSiteTheme() {
  const root = document.documentElement
  root.style.removeProperty('--kd-blue')
  root.style.removeProperty('--kd-blue-hover')
  root.style.removeProperty('--kd-cyan')
}
