/**
 * India-locale formatting utilities.
 * Currency: INR (₹), locale: en-IN, phone prefix: +91
 */

const currencyFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as Indian Rupees.
 * e.g. formatCurrency(100000) → "₹1,00,000.00"
 */
export function formatCurrency(amount) {
  return currencyFmt.format(parseFloat(amount) || 0);
}

/**
 * Format a date string using Indian locale.
 * @param {string|Date} dateStr
 * @param {'short'|'medium'|'long'|'full'} dateStyle
 */
export function formatDate(dateStr, dateStyle = 'medium') {
  return new Date(dateStr).toLocaleDateString('en-IN', { dateStyle });
}

/** Default placeholder for Indian phone numbers */
export const PHONE_PLACEHOLDER = '+91 98765 43210';

/**
 * Format a month key "YYYY-MM" to a short display label.
 * e.g. "2026-01" → "Jan '26"
 */
export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}
