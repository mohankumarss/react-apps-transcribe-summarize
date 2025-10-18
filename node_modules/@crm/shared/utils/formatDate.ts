import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';

export type DateInput = string | number | Date;

/**
 * Format a date to a readable string
 */
export const formatDate = (
  date: DateInput,
  formatString: string = 'MMM dd, yyyy'
): string => {
  try {
    const dateObj = parseDate(date);
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a date to a readable date and time string
 */
export const formatDateTime = (
  date: DateInput,
  formatString: string = 'MMM dd, yyyy h:mm a'
): string => {
  return formatDate(date, formatString);
};

/**
 * Format a date to show relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: DateInput): string => {
  try {
    const dateObj = parseDate(date);
    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a date for API requests (ISO string)
 */
export const formatDateForApi = (date: DateInput): string => {
  try {
    const dateObj = parseDate(date);
    if (!isValid(dateObj)) {
      throw new Error('Invalid date');
    }
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date for API:', error);
    throw error;
  }
};

/**
 * Parse various date inputs into a Date object
 */
export const parseDate = (date: DateInput): Date => {
  if (date instanceof Date) {
    return date;
  }
  
  if (typeof date === 'string') {
    // Try to parse ISO string first
    if (date.includes('T') || date.includes('Z')) {
      return parseISO(date);
    }
    // Otherwise, use Date constructor
    return new Date(date);
  }
  
  if (typeof date === 'number') {
    return new Date(date);
  }
  
  throw new Error('Invalid date input');
};

/**
 * Check if a date is valid
 */
export const isValidDate = (date: DateInput): boolean => {
  try {
    const dateObj = parseDate(date);
    return isValid(dateObj);
  } catch {
    return false;
  }
};

/**
 * Get the start of day for a given date
 */
export const getStartOfDay = (date: DateInput): Date => {
  const dateObj = parseDate(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Get the end of day for a given date
 */
export const getEndOfDay = (date: DateInput): Date => {
  const dateObj = parseDate(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Common date format presets
 */
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_12: 'h:mm a',
  TIME_24: 'HH:mm',
  DATETIME_SHORT: 'MM/dd/yyyy h:mm a',
  DATETIME_MEDIUM: 'MMM dd, yyyy h:mm a',
  DATETIME_LONG: 'MMMM dd, yyyy h:mm a',
} as const;
