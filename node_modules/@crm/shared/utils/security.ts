/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize user input for safe display
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Validate and sanitize URL to prevent malicious redirects
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }
    
    // Prevent javascript: and data: URLs
    if (parsedUrl.protocol === 'javascript:' || parsedUrl.protocol === 'data:') {
      return '';
    }
    
    return parsedUrl.toString();
  } catch {
    // Invalid URL
    return '';
  }
};

/**
 * Generate a secure random string for tokens/IDs
 */
export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available (browser)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
};

/**
 * Validate Content Security Policy compliance
 */
export const validateCSP = (content: string): boolean => {
  // Check for inline scripts
  if (/<script[^>]*>/.test(content)) {
    return false;
  }
  
  // Check for inline event handlers
  if (/on\w+\s*=/.test(content)) {
    return false;
  }
  
  // Check for javascript: URLs
  if (/javascript:/i.test(content)) {
    return false;
  }
  
  return true;
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitiveData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'auth',
    'credential',
    'ssn',
    'social',
    'credit',
    'card',
    'cvv',
    'pin',
  ];
  
  const masked = { ...data };
  
  Object.keys(masked).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      if (typeof masked[key] === 'string') {
        masked[key] = '*'.repeat(masked[key].length);
      } else {
        masked[key] = '[MASKED]';
      }
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  });
  
  return masked;
};

/**
 * Validate file upload security
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export const validateFileUpload = (
  file: File,
  options: FileValidationOptions = {}
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }
  
  // Check for potentially dangerous file names
  if (/[<>:"/\\|?*]/.test(file.name)) {
    errors.push('File name contains invalid characters');
  }
  
  // Check for executable extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs'];
  if (dangerousExtensions.includes(extension)) {
    errors.push('Executable files are not allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Rate limiting utility for API calls
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];
    
    // Filter out requests outside the current window
    const recentRequests = requests.filter(time => time > windowStart);
    
    // Check if under the limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requests = this.requests.get(identifier) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
  
  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

/**
 * Secure session storage wrapper
 */
export class SecureStorage {
  private static encrypt(data: string, key: string): string {
    // Simple XOR encryption (for demonstration - use proper encryption in production)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted);
  }
  
  private static decrypt(encryptedData: string, key: string): string {
    try {
      const data = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(
          data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return decrypted;
    } catch {
      return '';
    }
  }
  
  static setItem(key: string, value: string, encryptionKey?: string): void {
    try {
      const dataToStore = encryptionKey 
        ? this.encrypt(value, encryptionKey)
        : value;
      
      sessionStorage.setItem(key, dataToStore);
    } catch (error) {
      console.error('Failed to store secure data:', error);
    }
  }
  
  static getItem(key: string, encryptionKey?: string): string | null {
    try {
      const storedData = sessionStorage.getItem(key);
      if (!storedData) return null;
      
      return encryptionKey 
        ? this.decrypt(storedData, encryptionKey)
        : storedData;
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove secure data:', error);
    }
  }
  
  static clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }
  }
}

/**
 * Environment variable validation
 */
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for required environment variables
  const requiredVars = [
    'VITE_DEPLOYMENT_MODE',
  ];
  
  requiredVars.forEach(varName => {
    if (!(import.meta as any).env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Validate deployment mode
  const deploymentMode = (import.meta as any).env.VITE_DEPLOYMENT_MODE;
  const validModes = ['web_resource', 'embedded_spa', 'standalone_mfe'];
  
  if (deploymentMode && !validModes.includes(deploymentMode)) {
    errors.push(`Invalid deployment mode: ${deploymentMode}. Must be one of: ${validModes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
