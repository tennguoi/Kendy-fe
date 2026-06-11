export const serviceTypes = ['MANUAL', 'AUTO', 'SUBSCRIPTION', 'API_CREDIT']
export const serviceStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE', 'MAINTENANCE']
export const stockStatuses = ['AVAILABLE', 'OUT_OF_STOCK', 'CONSULTING_ONLY']
export const ctaTypes = ['BUY_NOW', 'CONTACT', 'CONSULT']
export const facebookSchema = JSON.stringify({
  properties: {
    facebookUrl: { label: 'Link Facebook', type: 'string' },
    note: { label: 'Ghi chú xử lý', type: 'string' },
  },
  required: ['facebookUrl'],
  type: 'object',
}, null, 2)
