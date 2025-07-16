import { AppError, ErrorType, ErrorContext, NetworkError, ValidationError, DatabaseError } from '../types/errors';

export class ErrorService {
  private static instance: ErrorService;
  private errorQueue: AppError[] = [];
  private isOnline = navigator.onLine;

  private constructor() {
    this.setupOnlineListener();
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  // Setup online/offline detection
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.logError({
        code: 'UNHANDLED_PROMISE_REJECTION',
        message: event.reason?.message || 'Unhandled promise rejection',
        details: event.reason,
        timestamp: new Date(),
        severity: 'high',
        context: 'global'
      });
    });

    // JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.logError({
        code: 'JAVASCRIPT_ERROR',
        message: event.error?.message || 'JavaScript error',
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        },
        timestamp: new Date(),
        severity: 'high',
        context: 'global'
      });
    });
  }

  // Create different types of errors
  createNetworkError(message: string, status?: number, endpoint?: string): NetworkError {
    return {
      code: `NETWORK_ERROR_${status || 'UNKNOWN'}`,
      message,
      status,
      endpoint,
      retryable: this.isRetryableNetworkError(status),
      timestamp: new Date(),
      severity: status && status >= 500 ? 'high' : 'medium'
    };
  }

  createValidationError(message: string, field?: string, value?: any): ValidationError {
    return {
      code: 'VALIDATION_ERROR',
      message,
      field,
      value,
      timestamp: new Date(),
      severity: 'low'
    };
  }

  createDatabaseError(message: string, operation?: string, table?: string): DatabaseError {
    return {
      code: 'DATABASE_ERROR',
      message,
      operation,
      table,
      timestamp: new Date(),
      severity: 'high'
    };
  }

  // Check if network error is retryable
  private isRetryableNetworkError(status?: number): boolean {
    if (!status) return true; // Network timeout, connection issues
    return status >= 500 || status === 408 || status === 429;
  }

  // Log error with context
  logError(error: AppError, context?: ErrorContext) {
    const enrichedError = {
      ...error,
      context: context || this.getCurrentContext(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Console logging with appropriate level
    switch (error.severity) {
      case 'critical':
        console.error('🚨 CRITICAL ERROR:', enrichedError);
        break;
      case 'high':
        console.error('❌ HIGH SEVERITY ERROR:', enrichedError);
        break;
      case 'medium':
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', enrichedError);
        break;
      case 'low':
        console.info('ℹ️ LOW SEVERITY ERROR:', enrichedError);
        break;
    }

    // Store in local storage for offline scenarios
    this.storeErrorLocally(enrichedError);

    // Send to server if online
    if (this.isOnline) {
      this.sendErrorToServer(enrichedError);
    } else {
      this.errorQueue.push(enrichedError);
    }
  }

  // Get current context
  private getCurrentContext(): ErrorContext {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };
  }

  // Store error locally
  private storeErrorLocally(error: AppError) {
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(error);
      
      // Keep only last 100 errors
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error locally:', e);
    }
  }

  // Send error to server
  private async sendErrorToServer(error: AppError) {
    try {
      // In a real app, this would send to your error tracking service
      // For now, we'll just simulate it
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error)
      });
    } catch (e) {
      console.error('Failed to send error to server:', e);
      this.errorQueue.push(error);
    }
  }

  // Flush error queue when back online
  private async flushErrorQueue() {
    while (this.errorQueue.length > 0) {
      const error = this.errorQueue.shift();
      if (error) {
        await this.sendErrorToServer(error);
      }
    }
  }

  // Get stored errors for debugging
  getStoredErrors(): AppError[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored errors
  clearStoredErrors() {
    localStorage.removeItem('app_errors');
  }
}

export const errorService = ErrorService.getInstance();