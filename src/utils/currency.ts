/**
 * Format raw number to formatted currency string (default VND)
 */
export const formatCurrency = (amount: number, currencySymbol: string = '₫'): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `0 ${currencySymbol}`.trim();
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formatted} ${currencySymbol}`.trim();
};

/**
 * Clean user string input to numeric float
 */
export const parseCurrencyInput = (value: string): number => {
  const digitsOnly = value.replace(/[^0-9]/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
};
