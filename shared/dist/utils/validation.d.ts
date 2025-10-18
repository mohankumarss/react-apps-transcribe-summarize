/**
 * Validation utilities for form inputs and data
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Email validation
 */
export declare const validateEmail: (email: string) => ValidationResult;
/**
 * Password validation
 */
export declare const validatePassword: (password: string) => ValidationResult;
/**
 * Phone number validation (US format)
 */
export declare const validatePhoneNumber: (phone: string) => ValidationResult;
/**
 * Required field validation
 */
export declare const validateRequired: (value: any, fieldName: string) => ValidationResult;
/**
 * String length validation
 */
export declare const validateLength: (value: string, min: number, max: number, fieldName: string) => ValidationResult;
/**
 * Number range validation
 */
export declare const validateNumberRange: (value: number, min: number, max: number, fieldName: string) => ValidationResult;
/**
 * URL validation
 */
export declare const validateUrl: (url: string) => ValidationResult;
/**
 * Combine multiple validation results
 */
export declare const combineValidationResults: (...results: ValidationResult[]) => ValidationResult;
/**
 * Validate an object against a schema
 */
export type ValidationSchema<T> = {
    [K in keyof T]: (value: T[K]) => ValidationResult;
};
export declare const validateObject: <T extends Record<string, any>>(obj: T, schema: ValidationSchema<T>) => ValidationResult;
//# sourceMappingURL=validation.d.ts.map