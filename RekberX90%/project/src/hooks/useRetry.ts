import { useState, useCallback } from 'react';
import { RetryConfig } from '../types/errors';

interface UseRetryOptions extends Partial<RetryConfig> {
  onRetry?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

export const useRetry = (options: UseRetryOptions = {}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry,
    onMaxAttemptsReached
  } = options;

  const calculateDelay = useCallback((attempt: number): number => {
    if (backoff === 'exponential') {
      return delay * Math.pow(2, attempt - 1);
    }
    return delay * attempt;
  }, [delay, backoff]);

  const retry = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    shouldRetry?: (error: any) => boolean
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setAttemptCount(attempt);
        
        if (attempt > 1) {
          setIsRetrying(true);
          onRetry?.(attempt);
          
          const retryDelay = calculateDelay(attempt - 1);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }

        const result = await asyncFn();
        setIsRetrying(false);
        setAttemptCount(0);
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (shouldRetry && !shouldRetry(error)) {
          break;
        }
        
        // If this is the last attempt, don't continue
        if (attempt === maxAttempts) {
          break;
        }
      }
    }

    setIsRetrying(false);
    setAttemptCount(0);
    onMaxAttemptsReached?.();
    throw lastError;
  }, [maxAttempts, calculateDelay, onRetry, onMaxAttemptsReached]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttemptCount(0);
  }, []);

  return {
    retry,
    isRetrying,
    attemptCount,
    reset
  };
};