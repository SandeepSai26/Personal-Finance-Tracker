/**
 * Utility functions for Indian currency, date, and percentage formatting
 */

export const parseYearMonthDay = (dateString: string): { year: number; month: number; day: number } => {
  if (!dateString) return { year: 1970, month: 1, day: 1 };
  const clean = dateString.split('T')[0];
  const parts = clean.split('-').map(Number);
  if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  }
  const date = new Date(dateString);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
};

export const parseLocalDate = (dateString: string): Date => {
  const { year, month, day } = parseYearMonthDay(dateString);
  return new Date(year, month - 1, day);
};

export const formatCurrency = (amount: number): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatPercentage = (val: number): string => {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
};

export const getMonthName = (month: number): string => {
  const date = new Date(2026, month - 1, 1);
  return new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(date);
};
