export function formatPrice(price: string): string {
  const value = Number(price)
  if (Number.isNaN(value)) return price
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}
