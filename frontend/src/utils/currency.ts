/**
 * Centralized Currency Formatting Utility for BizFlow
 * Handles dynamic business-configured currencies (USD, INR, EUR, GBP, CAD, AUD, etc.)
 */

export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_CURRENCY_SYMBOL = '$';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  RS: '₹',
  RUPEE: '₹',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  AED: 'AED ',
  SAR: 'SAR ',
  SGD: 'S$',
  NZD: 'NZ$',
  CHF: 'CHF ',
  CNY: '¥',
};

/**
 * Returns the standard display symbol for a given currency code.
 */
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  if (!currency) return DEFAULT_CURRENCY_SYMBOL;
  const upper = currency.trim().toUpperCase();
  if (CURRENCY_SYMBOLS[upper]) {
    return CURRENCY_SYMBOLS[upper];
  }
  return `${upper} `;
}

/**
 * Formats a numeric amount according to the configured business currency.
 * Examples:
 *   formatCurrency(24850, 'INR') -> "₹24,850.00"
 *   formatCurrency(24850, 'USD') -> "$24,850.00"
 *   formatCurrency(24850, 'EUR') -> "€24,850.00"
 *   formatCurrency(24850, 'GBP') -> "£24,850.00"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  options?: {
    decimals?: number;
    showSymbol?: boolean;
    compact?: boolean;
  }
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  const decimals = options?.decimals ?? 2;
  const showSymbol = options?.showSymbol !== false;
  const symbol = getCurrencySymbol(currency);

  if (isNaN(num)) {
    return `${showSymbol ? symbol : ''}0.00`;
  }

  try {
    const upper = (currency || DEFAULT_CURRENCY).trim().toUpperCase();
    let locale = 'en-US';
    if (upper === 'INR' || upper === 'RS') {
      locale = 'en-IN';
    } else if (upper === 'EUR') {
      locale = 'de-DE';
    } else if (upper === 'GBP') {
      locale = 'en-GB';
    } else if (upper === 'JPY') {
      locale = 'ja-JP';
    }

    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: upper === 'JPY' ? 0 : decimals,
      maximumFractionDigits: upper === 'JPY' ? 0 : decimals,
      notation: options?.compact ? 'compact' : 'standard',
    }).format(num);

    return showSymbol ? `${symbol}${formatted}` : formatted;
  } catch {
    const fixed = num.toFixed(decimals);
    return showSymbol ? `${symbol}${fixed}` : fixed;
  }
}
