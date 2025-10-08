import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export type ErrorType = 'network' | 'payment' | 'auth' | 'generic';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastDuration?: number;
  onError?: (error: Error) => void;
}

interface ErrorState {
  error: Error | null;
  errorType: ErrorType | null;
  isError: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { showToast = true, toastDuration = 5000, onError } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    errorType: null,
    isError: false,
  });

  const getErrorType = (error: Error): ErrorType => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }

    if (message.includes('payment') || message.includes('purchase') || message.includes('subscription')) {
      return 'payment';
    }

    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }

    return 'generic';
  };

  const getErrorMessage = (error: Error, type: ErrorType): string => {
    switch (type) {
      case 'network':
        return 'Unable to connect. Please check your internet connection and try again.';
      case 'payment':
        return 'Payment could not be processed. Please try again or contact support.';
      case 'auth':
        return 'Please sign in to continue.';
      case 'generic':
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const handleError = useCallback(
    (error: Error) => {
      const errorType = getErrorType(error);
      const errorMessage = getErrorMessage(error, errorType);

      setErrorState({
        error,
        errorType,
        isError: true,
      });

      if (showToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
          duration: toastDuration,
        });
      }

      if (onError) {
        onError(error);
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error handled:', error);
      }
    },
    [showToast, toastDuration, onError]
  );

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      errorType: null,
      isError: false,
    });
  }, []);

  return {
    error: errorState.error,
    errorType: errorState.errorType,
    isError: errorState.isError,
    handleError,
    clearError,
  };
};

// Async wrapper that automatically handles errors
export const withErrorHandler = async <T,>(
  asyncFn: () => Promise<T>,
  handleError: (error: Error) => void
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error as Error);
    return null;
  }
};
