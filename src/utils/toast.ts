/**
 * Utility functions for toast notifications
 */

import { toast } from '@/hooks/use-toast';

export type ToastVariant = 'default' | 'destructive';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

/**
 * Show an error toast notification
 * @param message - Error message to display
 * @param title - Optional title (defaults to "Error")
 */
export const showErrorToast = (message: string, title: string = 'Error') => {
  toast({
    title,
    description: message,
    variant: 'destructive'
  });
};

/**
 * Show a success toast notification
 * @param message - Success message to display
 * @param title - Optional title (defaults to "Success")
 */
export const showSuccessToast = (message: string, title: string = 'Success') => {
  toast({
    title,
    description: message
  });
};

/**
 * Show an info toast notification
 * @param message - Info message to display
 * @param title - Optional title
 */
export const showInfoToast = (message: string, title?: string) => {
  toast({
    title: title || 'Info',
    description: message
  });
};

/**
 * Show a warning toast notification
 * @param message - Warning message to display
 * @param title - Optional title (defaults to "Warning")
 */
export const showWarningToast = (message: string, title: string = 'Warning') => {
  toast({
    title,
    description: message,
    variant: 'destructive'
  });
};

/**
 * Show a custom toast notification with full control
 * @param options - Toast options
 */
export const showToast = (options: ToastOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: options.variant,
    duration: options.duration
  });
};

/**
 * Show a loading toast that can be updated later
 * @param message - Loading message
 * @returns ID that can be used to update the toast
 */
export const showLoadingToast = (message: string = 'Loading...') => {
  return toast({
    title: message,
    description: 'Please wait...'
  });
};