// Error types and interfaces for the application
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface NetworkError extends AppError {
  status?: number;
  endpoint?: string;
  retryable: boolean;
}

export interface ValidationError extends AppError {
  field?: string;
  value?: any;
  rule?: string;
}

export interface DatabaseError extends AppError {
  query?: string;
  table?: string;
  operation?: 'select' | 'insert' | 'update' | 'delete';
}

export type ErrorType = 'network' | 'validation' | 'database' | 'auth' | 'permission' | 'system' | 'offline';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
  retryableErrors: string[];
}