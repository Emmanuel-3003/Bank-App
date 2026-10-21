// The backend has no currency field, so amounts are shown in Indian rupees.
// Change these two constants to switch the whole UI to another currency.
const CURRENCY = 'INR'
const LOCALE = 'en-IN'

export function formatMoney(value) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY }).format(
    Number(value ?? 0)
  )
}

// Formats a plain "YYYY-MM-DD" date such as the backend's dateOfOpening.
export function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = String(value).split('-').map(Number)
  if (!year || !month || !day) return String(value)
  return new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(year, month - 1, day)
  )
}

// SAVINGS -> Savings
export function titleCase(text) {
  if (!text) return '—'
  const lower = String(text).toLowerCase().replace(/_/g, ' ')
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}