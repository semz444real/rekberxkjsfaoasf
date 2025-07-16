import { useState, useCallback } from 'react';
import { errorService } from '../services/error.service';
import { useToast } from './useToast';
import { AppError, ErrorType } from '../types/errors';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'Terjadi kesalahan. Silakan coba lagi.'
  } = options;

  const handleError = useCallback((error: any, context?: string) => {
    let appError: AppError;

    // Convert different error types to AppError
    if (error instanceof Error) {
      appError = {
        code: 'GENERIC_ERROR',
        message: error.message,
        details: error.stack,
        timestamp: new Date(),
        severity: 'medium',
        context
      };
    } else if (typeof error === 'string') {
      appError = {
        code: 'STRING_ERROR',
        message: error,
        timestamp: new Date(),
        severity: 'low',
        context
      };
    } else if (error?.code && error?.message) {
      appError = error as AppError;
    } else {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: fallbackMessage,
        details: error,
        timestamp: new Date(),
        severity: 'medium',
        context
      };
    }

    setError(appError);

    if (logError) {
      errorService.logError(appError, { component: context, timestamp: new Date() });
    }

    if (showToast) {
      const userMessage = getUserFriendlyMessage(appError);
      toast.error('Error', userMessage);
    }

    return appError;
  }, [showToast, logError, fallbackMessage, toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling
  };
};

// Get user-friendly error messages
function getUserFriendlyMessage(error: AppError): string {
  const errorMessages: Record<string, string> = {
    'NETWORK_ERROR_404': 'Data yang diminta tidak ditemukan.',
    'NETWORK_ERROR_401': 'Sesi Anda telah berakhir. Silakan login kembali.',
    'NETWORK_ERROR_403': 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
    'NETWORK_ERROR_500': 'Terjadi kesalahan server. Tim kami sedang memperbaikinya.',
    'NETWORK_ERROR_UNKNOWN': 'Koneksi bermasalah. Periksa koneksi internet Anda.',
    'VALIDATION_ERROR': 'Data yang dimasukkan tidak valid.',
    'DATABASE_ERROR': 'Terjadi kesalahan database. Silakan coba lagi.',
    'OFFLINE_ERROR': 'Anda sedang offline. Beberapa fitur mungkin tidak tersedia.',
    'TIMEOUT_ERROR': 'Permintaan timeout. Silakan coba lagi.',
    'GENERIC_ERROR': 'Terjadi kesalahan. Silakan coba lagi.'
  };

  return errorMessages[error.code] || error.message || 'Terjadi kesalahan yang tidak diketahui.';
}