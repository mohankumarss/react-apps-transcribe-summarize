export type DateInput = string | number | Date;
/**
 * Format a date to a readable string
 */
export declare const formatDate: (date: DateInput, formatString?: string) => string;
/**
 * Format a date to a readable date and time string
 */
export declare const formatDateTime: (date: DateInput, formatString?: string) => string;
/**
 * Format a date to show relative time (e.g., "2 hours ago")
 */
export declare const formatRelativeTime: (date: DateInput) => string;
/**
 * Format a date for API requests (ISO string)
 */
export declare const formatDateForApi: (date: DateInput) => string;
/**
 * Parse various date inputs into a Date object
 */
export declare const parseDate: (date: DateInput) => Date;
/**
 * Check if a date is valid
 */
export declare const isValidDate: (date: DateInput) => boolean;
/**
 * Get the start of day for a given date
 */
export declare const getStartOfDay: (date: DateInput) => Date;
/**
 * Get the end of day for a given date
 */
export declare const getEndOfDay: (date: DateInput) => Date;
/**
 * Common date format presets
 */
export declare const DATE_FORMATS: {
    readonly SHORT: "MM/dd/yyyy";
    readonly MEDIUM: "MMM dd, yyyy";
    readonly LONG: "MMMM dd, yyyy";
    readonly ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";
    readonly TIME_12: "h:mm a";
    readonly TIME_24: "HH:mm";
    readonly DATETIME_SHORT: "MM/dd/yyyy h:mm a";
    readonly DATETIME_MEDIUM: "MMM dd, yyyy h:mm a";
    readonly DATETIME_LONG: "MMMM dd, yyyy h:mm a";
};
//# sourceMappingURL=formatDate.d.ts.map