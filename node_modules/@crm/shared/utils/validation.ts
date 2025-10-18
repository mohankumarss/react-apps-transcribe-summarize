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
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Password validation
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Phone number validation (US format)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length !== 10) {
      errors.push('Phone number must be 10 digits');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Required field validation
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * String length validation
 */
export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];
  
  if (value.length < min) {
    errors.push(`${fieldName} must be at least ${min} characters long`);
  }
  
  if (value.length > max) {
    errors.push(`${fieldName} must be no more than ${max} characters long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Number range validation
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];
  
  if (isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
  } else {
    if (value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }
    
    if (value > max) {
      errors.push(`${fieldName} must be no more than ${max}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * URL validation
 */
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('URL is required');
  } else {
    try {
      new URL(url);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Combine multiple validation results
 */
export const combineValidationResults = (...results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Validate an object against a schema
 */
export type ValidationSchema<T> = {
  [K in keyof T]: (value: T[K]) => ValidationResult;
};

export const validateObject = <T extends Record<string, any>>(
  obj: T,
  schema: ValidationSchema<T>
): ValidationResult => {
  const results = Object.keys(schema).map(key => {
    const validator = schema[key as keyof T];
    return validator(obj[key as keyof T]);
  });
  
  return combineValidationResults(...results);
};
