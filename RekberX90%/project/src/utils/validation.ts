import { errorService } from '../services/error.service';
import { ValidationError } from '../types/errors';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  fieldErrors: Record<string, string>;
}

export class ValidationService {
  static validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: ValidationError[] = [];
    const fieldErrors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const fieldError = this.validateField(field, value, rule);
      
      if (fieldError) {
        errors.push(fieldError);
        fieldErrors[field] = fieldError.message;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }

  private static validateField(field: string, value: any, rule: ValidationRule): ValidationError | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return errorService.createValidationError(
        rule.message || `${field} is required`,
        field,
        value
      );
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return errorService.createValidationError(
          rule.message || `${field} must be at least ${rule.minLength} characters`,
          field,
          value
        );
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return errorService.createValidationError(
          rule.message || `${field} must be no more than ${rule.maxLength} characters`,
          field,
          value
        );
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return errorService.createValidationError(
          rule.message || `${field} format is invalid`,
          field,
          value
        );
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        return errorService.createValidationError(
          typeof customResult === 'string' ? customResult : (rule.message || `${field} is invalid`),
          field,
          value
        );
      }
    }

    return null;
  }

  // Common validation schemas
  static schemas = {
    user: {
      username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      },
      password: {
        required: true,
        minLength: 6,
        message: 'Password must be at least 6 characters'
      }
    },
    message: {
      content: {
        required: true,
        maxLength: 1000,
        message: 'Message cannot be empty and must be less than 1000 characters'
      }
    },
    gameTopicSchema: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Game name must be 2-50 characters'
      },
      description: {
        required: true,
        maxLength: 200,
        message: 'Description must be less than 200 characters'
      },
      icon: {
        required: true,
        maxLength: 2,
        message: 'Icon must be 1-2 characters'
      }
    }
  };
}