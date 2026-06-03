export function createPreviewDepositCode(amount) {
  const encodedAmount = Math.max(amount, 10000).toString(36).toUpperCase()
  return `KD${encodedAmount.padStart(8, '0')}Q7`
}
