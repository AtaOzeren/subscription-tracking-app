/**
 * Currency Utilities
 * Handles currency formatting and symbol display for all supported currencies
 */

// Comprehensive currency symbol mapping
// Source: ISO 4217 currency codes
export const CURRENCY_SYMBOLS: Record<string, string> = {
  // Major currencies
  USD: '$',      // US Dollar
  EUR: '€',      // Euro
  GBP: '£',      // British Pound
  JPY: '¥',      // Japanese Yen
  CNY: '¥',      // Chinese Yuan
  
  // Turkish Lira
  TRY: '₺',      // Turkish Lira
  
  // Other Americas
  CAD: 'C$',     // Canadian Dollar
  MXN: 'Mex$',   // Mexican Peso
  BRL: 'R$',     // Brazilian Real
  ARS: 'AR$',    // Argentine Peso
  CLP: 'CLP$',   // Chilean Peso
  
  // Asia Pacific
  INR: '₹',      // Indian Rupee
  KRW: '₩',      // South Korean Won
  SGD: 'S$',     // Singapore Dollar
  HKD: 'HK$',    // Hong Kong Dollar
  AUD: 'A$',     // Australian Dollar
  NZD: 'NZ$',    // New Zealand Dollar
  THB: '฿',      // Thai Baht
  IDR: 'Rp',     // Indonesian Rupiah
  MYR: 'RM',     // Malaysian Ringgit
  PHP: '₱',      // Philippine Peso
  VND: '₫',      // Vietnamese Dong
  
  // Middle East & Africa
  AED: 'د.إ',    // UAE Dirham
  SAR: '﷼',      // Saudi Riyal
  ZAR: 'R',      // South African Rand
  EGP: 'E£',     // Egyptian Pound
  ILS: '₪',      // Israeli Shekel
  
  // Europe
  CHF: 'CHF',    // Swiss Franc
  SEK: 'kr',     // Swedish Krona
  NOK: 'kr',     // Norwegian Krone
  DKK: 'kr',     // Danish Krone
  PLN: 'zł',     // Polish Zloty
  CZK: 'Kč',     // Czech Koruna
  HUF: 'Ft',     // Hungarian Forint
  RON: 'lei',    // Romanian Leu
  RUB: '₽',      // Russian Ruble
  UAH: '₴',      // Ukrainian Hryvnia
  
  // Others
  PKR: '₨',      // Pakistani Rupee
  BDT: '৳',      // Bangladeshi Taka
  NGN: '₦',      // Nigerian Naira
  KES: 'KSh',    // Kenyan Shilling
};

/**
 * Format price with currency symbol
 * Uses the appropriate symbol based on currency code
 * 
 * @param price - The price amount
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR', 'TRY')
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted price string with symbol
 * 
 * @example
 * formatPrice(89.99, 'TRY') // Returns: '₺89.99'
 * formatPrice(22.99, 'USD') // Returns: '$22.99'
 * formatPrice(1234.56, 'EUR') // Returns: '€1,234.56'
 * formatPrice(100, 'XYZ') // Returns: 'XYZ 100.00' (fallback for unknown currency)
 */
export function formatPrice(
  price: number, 
  currency: string, 
  showDecimals: boolean = true
): string {
  // Get the symbol for this currency
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()];
  
  // Format the number with decimals
  const formattedNumber = showDecimals 
    ? price.toFixed(2)
    : Math.round(price).toString();
  
  // Add thousands separator for better readability
  const parts = formattedNumber.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const finalNumber = parts.join('.');
  
  // If we have a symbol, prepend it; otherwise use currency code with space
  if (symbol) {
    return `${symbol}${finalNumber}`;
  } else {
    // Fallback: Show currency code before the price
    return `${currency.toUpperCase()} ${finalNumber}`;
  }
}

/**
 * Format price using native Intl.NumberFormat API
 * This provides locale-aware formatting but may not work in all React Native environments
 * Use as alternative when Intl is available
 * 
 * @param price - The price amount
 * @param currency - ISO 4217 currency code
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted price string
 * 
 * @example
 * formatPriceIntl(89.99, 'TRY', 'tr-TR') // Returns: '₺89,99' (Turkish format)
 * formatPriceIntl(1234.56, 'EUR', 'de-DE') // Returns: '1.234,56 €' (German format)
 */
export function formatPriceIntl(
  price: number,
  currency: string,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (error) {
    // Fallback to simple format if Intl fails
    console.warn('Intl.NumberFormat failed, using simple format:', error);
    return formatPrice(price, currency);
  }
}

/**
 * Get currency symbol only
 * 
 * @param currency - ISO 4217 currency code
 * @returns Currency symbol or code if symbol not found
 * 
 * @example
 * getCurrencySymbol('USD') // Returns: '$'
 * getCurrencySymbol('TRY') // Returns: '₺'
 * getCurrencySymbol('XYZ') // Returns: 'XYZ' (fallback)
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency.toUpperCase();
}

/**
 * Check if currency code is supported (has a symbol)
 * 
 * @param currency - ISO 4217 currency code
 * @returns true if currency has a defined symbol
 */
export function isCurrencySupported(currency: string): boolean {
  return currency.toUpperCase() in CURRENCY_SYMBOLS;
}
