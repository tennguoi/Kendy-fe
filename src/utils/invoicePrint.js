import { money } from './currency'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function safeJsonBlock(value) {
  if (!value) return 'Không có'
  if (typeof value !== 'string') {
    return JSON.stringify(value, null, 2)
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function buildInvoiceHtml({ customer = {}, order = {} }) {
  const orderCode = order.orderCode || order.code || `INV-${Date.now()}`
  const serviceName = order.serviceName || order.service || 'Dịch vụ'
  const amount = Number(order.amount || 0)
  const vatAmount = 0
  const totalAmount = amount + vatAmount
  const buyerName = customer.name || order.customerName || 'Khách hàng'
  const buyerEmail = customer.email || order.customerEmail || ''
  const buyerPhone = customer.phone || order.customerPhone || ''
  const invoiceUrl = `${window.location.origin}/orders?invoice=${encodeURIComponent(orderCode)}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(invoiceUrl)}`

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Hoa don ${escapeHtml(orderCode)}</title>
  <style>
    @font-face {
      font-family: 'KendyInvoice';
      src: url('/fonts/invoice.ttf') format('truetype');
      font-weight: 400 900;
      font-style: normal;
      font-display: swap;
    }

    @page {
      size: 80mm auto;
      margin: 0;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f1f5f9;
      color: #111827;
      font-family: 'KendyInvoice', 'Courier New', 'Consolas', monospace;
      font-size: 11px;
      line-height: 1.35;
    }
    .receipt {
      width: 80mm;
      margin: 0 auto;
      padding: 6mm 5mm 8mm;
      background: #ffffff;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
    }
    .receipt-no {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      width: 100%;
      margin-bottom: 8px;
      font-size: 15px;
    }
    .receipt-no strong {
      font-size: 19px;
      font-weight: 900;
    }
    .brand {
      text-align: center;
      text-transform: uppercase;
    }
    .brand h1 {
      margin: 2px 0 6px;
      font-size: 12px;
      letter-spacing: 0.04em;
    }
    .brand p {
      margin: 2px 0;
    }
    .line {
      margin: 9px 0;
      border-top: 1px dashed #111827;
    }
    .info-row,
    .money-row,
    .item-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin: 3px 0;
    }
    .info-row span:first-child,
    .money-row span:first-child {
      flex: 0 0 auto;
    }
    .info-row strong,
    .money-row strong {
      min-width: 0;
      text-align: right;
      overflow-wrap: anywhere;
    }
    .section-title {
      margin: 8px 0 5px;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
    }
    .item-head {
      display: grid;
      grid-template-columns: 1fr 50px;
      gap: 8px;
      margin-bottom: 5px;
      font-weight: 900;
    }
    .item-row {
      align-items: flex-start;
    }
    .item-name {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .item-price {
      flex: 0 0 74px;
      text-align: right;
    }
    .subline {
      padding-left: 12px;
      color: #374151;
    }
    .total-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 10px;
      margin: 8px 0;
      font-size: 22px;
      font-weight: 900;
    }
    .total-row strong {
      text-align: right;
    }
    .payment-row {
      display: flex;
      justify-content: flex-end;
      gap: 18px;
      margin: 2px 0;
      font-weight: 800;
    }
    .note {
      margin-top: 12px;
      text-align: center;
      font-size: 10px;
    }
    .qr {
      display: grid;
      place-items: center;
      margin-top: 8px;
    }
    .qr img {
      width: 34mm;
      height: 34mm;
      image-rendering: pixelated;
    }
    .link {
      margin-top: 8px;
      overflow-wrap: anywhere;
      text-align: center;
      font-size: 10px;
    }
    .tiny {
      color: #374151;
      font-size: 10px;
    }
    .actions {
      position: sticky;
      top: 0;
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 12px;
      background: #0f172a;
    }
    .actions button {
      min-height: 38px;
      padding: 0 16px;
      border: 0;
      border-radius: 8px;
      background: #2563eb;
      color: #ffffff;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }
    @media print {
      body { background: #ffffff; }
      .receipt { width: 80mm; margin: 0; padding: 4mm; box-shadow: none; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">In / Lưu PDF</button>
    <button onclick="window.close()">Đóng</button>
  </div>
  <main class="receipt">
    <section class="receipt-no">
      <span>${escapeHtml(orderCode).slice(-6) || '000000'}</span>
      <strong>21</strong>
    </section>

    <section class="brand">
      <h1>KENDY DIGITAL</h1>
      <p>Dịch vụ tài khoản & quảng cáo</p>
      <p>Tel: 0221 000 0000</p>
      <p>OrderID: ${escapeHtml(orderCode)}</p>
      <p>Invoice: HD-${escapeHtml(orderCode)}</p>
    </section>

    <div class="line"></div>

    <section>
      <div class="info-row"><span>Check:</span><strong>${escapeHtml(orderCode)}</strong></div>
      <div class="info-row"><span>Khách:</span><strong>${escapeHtml(buyerName)}</strong></div>
      <div class="info-row"><span>Email:</span><strong>${escapeHtml(buyerEmail || '-')}</strong></div>
      <div class="info-row"><span>SĐT:</span><strong>${escapeHtml(buyerPhone || '-')}</strong></div>
      <div class="info-row"><span>Staff:</span><strong>Kendy/${formatDate(new Date())}</strong></div>
      <div class="info-row"><span>Status:</span><strong>${escapeHtml(order.status || 'ORDER')}</strong></div>
    </section>

    <div class="line"></div>

    <section>
      <div class="item-head">
        <span>ITEM</span>
        <span style="text-align:right">AMOUNT</span>
      </div>
      <div class="item-row">
        <span class="item-name">1 ${escapeHtml(serviceName)}</span>
        <span class="item-price">${escapeHtml(money.format(amount))}</span>
      </div>
      ${order.userNote ? `<div class="subline">${escapeHtml(order.userNote)}</div>` : ''}
    </section>

    <div class="line"></div>

    <section>
      <div class="money-row"><span>Sub-Total</span><strong>${escapeHtml(money.format(amount))}</strong></div>
      <div class="money-row"><span>VAT</span><strong>${escapeHtml(money.format(vatAmount))}</strong></div>
      <div class="total-row"><span>Total</span><strong>${escapeHtml(money.format(totalAmount))}</strong></div>
      <div class="payment-row"><span>WALLET/QR</span><strong>${escapeHtml(money.format(totalAmount))}</strong></div>
    </section>

    <div class="line"></div>

    <section class="note">
      <p>*Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi*</p>
      <p>Quý khách có nhu cầu xuất hóa đơn điện tử vui lòng giữ lại hóa đơn và liên hệ trong vòng 03 giờ kể từ lúc mua hàng.</p>
      <p>Quét mã QR để xem lại hóa đơn</p>
    </section>

    <section class="qr">
      <img src="${qrUrl}" alt="QR hóa đơn ${escapeHtml(orderCode)}" />
    </section>

    <section class="link">
      <p>Hoặc truy cập:</p>
      <p>${escapeHtml(invoiceUrl)}</p>
    </section>

    <div class="line"></div>

    <section class="tiny">
      <p><strong>Input:</strong> ${escapeHtml(safeJsonBlock(order.inputData)).slice(0, 260)}</p>
      <p><strong>Kết quả:</strong> ${escapeHtml(safeJsonBlock(order.resultData)).slice(0, 260)}</p>
    </section>
  </main>
</body>
</html>`
}

export function printOrderInvoice(order, options = {}) {
  if (!order) return
  const invoiceWindow = window.open('', '_blank', 'width=920,height=1080')
  if (!invoiceWindow) return
  invoiceWindow.document.open()
  invoiceWindow.document.write(buildInvoiceHtml({ ...options, order }))
  invoiceWindow.document.close()
}
