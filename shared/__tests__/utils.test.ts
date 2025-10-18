/**
 * Utility Function Tests
 * 
 * Tests for shared utility functions
 */

import { formatDate } from '../utils/formatDate';
import { logger } from '../utils/logger';
import { validateEmail, validateRequired, validateLength } from '../utils/validation';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    test('formats date with default options', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date);
      
      expect(formatted).toBe('12/25/2023');
    });

    test('formats date with custom format', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date, 'yyyy-MM-dd');
      
      expect(formatted).toBe('2023-12-25');
    });

    test('formats date with time', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date, 'MM/dd/yyyy HH:mm');
      
      expect(formatted).toBe('12/25/2023 10:30');
    });

    test('handles invalid date', () => {
      const invalidDate = new Date('invalid');
      const formatted = formatDate(invalidDate);
      
      expect(formatted).toBe('Invalid Date');
    });

    test('handles null/undefined input', () => {
      expect(formatDate(null as any)).toBe('');
      expect(formatDate(undefined as any)).toBe('');
    });

    test('formats date string input', () => {
      const dateString = '2023-12-25';
      const formatted = formatDate(dateString);
      
      expect(formatted).toBe('12/25/2023');
    });

    test('formats timestamp input', () => {
      const timestamp = 1703505000000; // 2023-12-25T10:30:00Z
      const formatted = formatDate(timestamp);
      
      expect(formatted).toBe('12/25/2023');
    });

    test('respects locale settings', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date, 'PP', { locale: 'en-US' });
      
      expect(formatted).toMatch(/Dec 25, 2023/);
    });
  });

  describe('logger', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('logs info messages', () => {
      logger.info('Test info message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test info message'
      );
    });

    test('logs error messages', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      logger.error('Test error message');
      
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Test error message'
      );
      
      errorSpy.mockRestore();
    });

    test('logs warning messages', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      logger.warn('Test warning message');
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'Test warning message'
      );
      
      warnSpy.mockRestore();
    });

    test('logs debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      logger.debug('Test debug message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Test debug message'
      );
      
      process.env.NODE_ENV = originalEnv;
    });

    test('suppresses debug messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      logger.debug('Test debug message');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('includes timestamp in log messages', () => {
      logger.info('Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        'Test message'
      );
    });

    test('handles object logging', () => {
      const testObject = { key: 'value', number: 42 };
      logger.info('Test object:', testObject);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test object:',
        testObject
      );
    });
  });

  describe('validation', () => {
    describe('validateEmail', () => {
      test('validates correct email addresses', () => {
        expect(validateEmail('test@example.com').isValid).toBe(true);
        expect(validateEmail('user.name@domain.co.uk').isValid).toBe(true);
        expect(validateEmail('test+tag@example.org').isValid).toBe(true);
      });

      test('rejects invalid email addresses', () => {
        expect(validateEmail('invalid-email').isValid).toBe(false);
        expect(validateEmail('test@').isValid).toBe(false);
        expect(validateEmail('@example.com').isValid).toBe(false);
        expect(validateEmail('').isValid).toBe(false);
      });

      test('returns error messages for invalid emails', () => {
        const result = validateEmail('invalid-email');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Please enter a valid email address');
      });

      test('returns error for empty email', () => {
        const result = validateEmail('');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Email is required');
      });
    });

    describe('validateRequired', () => {
      test('validates non-empty values', () => {
        expect(validateRequired('test', 'Field').isValid).toBe(true);
        expect(validateRequired('0', 'Field').isValid).toBe(true);
        expect(validateRequired(0, 'Field').isValid).toBe(true);
        expect(validateRequired(false, 'Field').isValid).toBe(true);
      });

      test('rejects empty values', () => {
        expect(validateRequired('', 'Field').isValid).toBe(false);
        expect(validateRequired(null, 'Field').isValid).toBe(false);
        expect(validateRequired(undefined, 'Field').isValid).toBe(false);
      });

      test('returns error messages for empty values', () => {
        const result = validateRequired('', 'Username');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Username is required');
      });
    });

    describe('validateLength', () => {
      test('validates strings within length range', () => {
        expect(validateLength('hello', 3, 10, 'Field').isValid).toBe(true);
        expect(validateLength('test', 4, 4, 'Field').isValid).toBe(true);
        expect(validateLength('ab', 1, 5, 'Field').isValid).toBe(true);
      });

      test('rejects strings outside length range', () => {
        expect(validateLength('hi', 3, 10, 'Field').isValid).toBe(false);
        expect(validateLength('verylongstring', 1, 5, 'Field').isValid).toBe(false);
      });

      test('returns error messages for invalid lengths', () => {
        const result = validateLength('hi', 3, 10, 'Password');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be between 3 and 10 characters long');
      });
    });
  });

  describe('Integration Tests', () => {
    test('utilities work together', () => {
      const email = 'test@example.com';
      const date = new Date();
      
      // Validate email and format current date
      const isValidEmail = validateEmail(email);
      const formattedDate = formatDate(date);
      
      expect(isValidEmail).toBe(true);
      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      
      // Log the results
      logger.info(`Email ${email} is valid: ${isValidEmail}`);
      logger.info(`Current date: ${formattedDate}`);
    });

    test('error handling across utilities', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Test error scenarios
      const invalidDate = formatDate('invalid-date');
      const invalidEmail = validateEmail('invalid');
      
      expect(invalidDate).toBe('Invalid Date');
      expect(invalidEmail).toBe(false);
      
      // Log errors
      logger.error('Invalid date provided');
      logger.error('Invalid email provided');
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
    });
  });
});
