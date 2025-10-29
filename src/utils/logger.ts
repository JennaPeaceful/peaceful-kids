/**
 * Conditional logging utility for production/development environments
 * Only logs in development mode to avoid exposing internal logic in production
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// For critical errors that should always be logged (e.g., for Sentry)
export const logError = (error: Error | unknown, context?: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Always log critical errors
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, errorMessage);
  if (errorStack && isDevelopment) {
    console.error('Stack trace:', errorStack);
  }

  // In production, you might want to send this to Sentry or another error tracking service
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { extra: { context } });
  // }
};