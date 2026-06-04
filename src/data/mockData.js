export const mockServices = [
  {
    id: 1,
    name: 'CapCut Pro 12 tháng',
    type: 'Nâng cấp',
    price: 250000,
    time: '5-30 phút',
    status: 'ACTIVE',
    description: 'Nâng cấp tài khoản CapCut Pro, có hỗ trợ đăng nhập và điều kiện bảo hành rõ ràng.',
  },
  {
    id: 2,
    name: 'Tài khoản Facebook Ads',
    type: 'Facebook',
    price: 490000,
    time: 'Trong ngày',
    status: 'ACTIVE',
    description: 'Tài khoản phục vụ nhu cầu quảng cáo Facebook, tư vấn điều kiện trước khi mua.',
  },
  {
    id: 3,
    name: 'Setup chiến dịch Facebook',
    type: 'Quảng cáo',
    price: 890000,
    time: 'Trong ngày',
    status: 'MAINTENANCE',
    description: 'Hỗ trợ setup chiến dịch, tư vấn ngân sách và theo dõi xử lý qua ticket.',
  },
]

export const mockOrders = [
  {
    code: 'OD9K7Q2P4A',
    service: 'CapCut Pro 12 tháng',
    amount: 250000,
    status: 'PROCESSING',
    createdAt: '03/06/2026 01:40',
  },
  {
    code: 'OD6F2M8T1C',
    service: 'Tài khoản Facebook Ads',
    amount: 490000,
    status: 'COMPLETED',
    createdAt: '02/06/2026 22:12',
  },
  {
    code: 'OD3Q7N6L8V',
    service: 'Setup chiến dịch Facebook',
    amount: 890000,
    status: 'REFUNDED',
    createdAt: '01/06/2026 14:05',
  },
]

export const mockTransactions = [
  {
    code: 'WT9M2L4S8N',
    type: 'DEPOSIT',
    direction: 'CREDIT',
    amount: 1000000,
    balance: 1325000,
    note: 'Nạp ví KD8F4N2L6Q',
  },
  {
    code: 'WT7C4D9K1R',
    type: 'PURCHASE',
    direction: 'DEBIT',
    amount: 250000,
    balance: 325000,
    note: 'Mua đơn OD9K7Q2P4A',
  },
  {
    code: 'WT4H8P2Q6M',
    type: 'REFUND',
    direction: 'CREDIT',
    amount: 890000,
    balance: 575000,
    note: 'Hoàn tiền đơn OD3Q7N6L8V',
  },
]
