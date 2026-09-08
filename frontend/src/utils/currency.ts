/**
 * Centralized Currency Formatting Utility for BizFlow
 * Defaults to Indian Rupee (INR / ₹)
 */

export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_CURRENCY_SYMBOL = '₹';

/**
 * Returns the standard display symbol for a given currency code.
 */
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  if (!currency) return DEFAULT_CURRENCY_SYMBOL;
  const upper = currency.toUpperCase();
  if (upper === 'INR' || upper === 'RS' || upper === 'RUPEE' || upper === 'RUPEES') {
    return '₹';
  }
  if (upper === 'USD') return '$';
  if (upper === 'EUR') return '€';
  if (upper === 'GBP') return '£';
  return upper;
}

/**
 * Formats a numeric amount with standard Indian Rupee notation (or specified currency)
 * Example: formatCurrency(1250.5) -> "₹1,250.50"
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
  if (isNaN(num)) return `${options?.showSymbol !== false ? getCurrencySymbol(currency) : ''}0.00`;

  const decimals = options?.decimals ?? 2;
  const showSymbol = options?.showSymbol !== false;
  const symbol = getCurrencySymbol(currency);

  try {
    const isINR = !currency || currency.toUpperCase() === 'INR';
    
    // For INR, use en-IN locale for correct lakh/crore commas (e.g. 1,00,000)
    const locale = isINR ? 'en-IN' : 'en-US';
    
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      notation: options?.compact ? 'compact' : 'standard',
    }).format(num);

    return showSymbol ? `${symbol}${formatted}` : formatted;
  } catch {
    const fixed = num.toFixed(decimals);
    return showSymbol ? `${symbol}${fixed}` : fixed;
  }
}

/**
 * Convenience helper specifically for standard INR formatting
 */
export function formatINR(amount: number | string | null | undefined, decimals: number = 2): string {
  return formatCurrency(amount, 'INR', { decimals, showSymbol: true });
}
