/**
 * Returns month key formatted as "YYYY-MM"
 */
export const getMonthKey = (dateInput: Date | string = new Date()): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const validDate = isNaN(date.getTime()) ? new Date() : date;
  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Format "YYYY-MM" into readable Vietnamese header, e.g. "Tháng 07, 2026"
 */
export const formatMonthDisplay = (monthKey: string): string => {
  if (!monthKey || !monthKey.includes('-')) return '';
  const [year, month] = monthKey.split('-');
  return `Tháng ${month}, ${year}`;
};

/**
 * Get adjacent month key e.g. addMonths("2026-07", -1) -> "2026-06"
 */
export const offsetMonthKey = (monthKey: string, offset: number): string => {
  const [yearStr, monthStr] = monthKey.split('-');
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + offset, 1);
  return getMonthKey(date);
};

/**
 * Format ISO date string to "DD/MM/YYYY"
 */
export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
