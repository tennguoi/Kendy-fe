export const mockServices = [
  {
    id: 1,
    name: 'AI API Credit',
    type: 'API',
    price: 250000,
    time: 'Tự động',
    status: 'ACTIVE',
    description: 'Gói credit dùng cho model AI, theo dõi usage và lịch sử trừ ví.',
  },
  {
    id: 2,
    name: 'Digital Growth Pack',
    type: 'Manual',
    price: 490000,
    time: '2-4 giờ',
    status: 'ACTIVE',
    description: 'Gói triển khai nội dung, tài khoản và tài nguyên vận hành số.',
  },
  {
    id: 3,
    name: 'Automation Setup',
    type: 'Service',
    price: 890000,
    time: 'Trong ngày',
    status: 'MAINTENANCE',
    description: 'Thiết lập workflow tự động, webhook và dashboard theo dõi.',
  },
]

export const mockOrders = [
  {
    code: 'OD9K7Q2P4A',
    service: 'AI API Credit',
    amount: 250000,
    status: 'PROCESSING',
    createdAt: '03/06/2026 01:40',
  },
  {
    code: 'OD6F2M8T1C',
    service: 'Digital Growth Pack',
    amount: 490000,
    status: 'COMPLETED',
    createdAt: '02/06/2026 22:12',
  },
  {
    code: 'OD3Q7N6L8V',
    service: 'Automation Setup',
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
    note: 'SePay deposit KD8F4N2L6Q',
  },
  {
    code: 'WT7C4D9K1R',
    type: 'PURCHASE',
    direction: 'DEBIT',
    amount: 250000,
    balance: 325000,
    note: 'Purchase order OD9K7Q2P4A',
  },
  {
    code: 'WT4H8P2Q6M',
    type: 'REFUND',
    direction: 'CREDIT',
    amount: 890000,
    balance: 575000,
    note: 'Refund order OD3Q7N6L8V',
  },
]
