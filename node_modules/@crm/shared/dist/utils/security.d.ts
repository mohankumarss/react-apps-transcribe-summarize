/**
 * Security utilities for input sanitization and validation
 */
/**
 * Sanitize HTML content to prevent XSS attacks
 */
export declare const sanitizeHtml: (input: string) => string;
/**
 * Sanitize user input for safe display
 */
export declare const sanitizeInput: (input: string) => string;
/**
 * Validate and sanitize URL to prevent malicious redirects
 */
export declare const sanitizeUrl: (url: string) => string;
/**
 * Generate a secure random string for tokens/IDs
 */
export declare const generateSecureId: (length?: number) => string;
/**
 * Validate Content Security Policy compliance
 */
export declare const validateCSP: (content: string) => boolean;
/**
 * Mask sensitive data for logging
 */
export declare const maskSensitiveData: (data: any) => any;
/**
 * Validate file upload security
 */
export interface FileValidationOptions {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
}
export declare const validateFileUpload: (file: File, options?: FileValidationOptions) => {
    isValid: boolean;
    errors: string[];
};
/**
 * Rate limiting utility for API calls
 */
export declare class RateLimiter {
    private maxRequests;
    private windowMs;
    private requests;
    constructor(maxRequests?: number, windowMs?: number);
    isAllowed(identifier: string): boolean;
    getRemainingRequests(identifier: string): number;
    reset(identifier?: string): void;
}
/**
 * Secure session storage wrapper
 */
export declare class SecureStorage {
    private static encrypt;
    private static decrypt;
    static setItem(key: string, value: string, encryptionKey?: string): void;
    static getItem(key: string, encryptionKey?: string): string | null;
    static removeItem(key: string): void;
    static clear(): void;
}
/**
 * Environment variable validation
 */
export declare const validateEnvironment: () => {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=security.d.ts.map