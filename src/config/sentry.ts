/**
 * Sentry Error Tracking Configuration
 * Official setup from Sentry.io
 */

import * as Sentry from '@sentry/react';

// Check if we're in a Capacitor-enabled build
const isCapacitorEnabled = () => import.meta.env.VITE_CAPACITOR_ENABLED === 'true';
const isDevelopment = import.meta.env.MODE === 'development';

/**
 * Initialize Sentry error tracking
 * No-op in web builds without Capacitor
 */
export function initSentry(): void {
  if (!isCapacitorEnabled()) {
    console.log('[Sentry] Web mode - error tracking disabled');
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.log('[Sentry] No DSN configured - skipping initialization');
    return;
  }

  // Skip in development unless explicitly enabled
  const enableInDev = import.meta.env.VITE_SENTRY_DEV === 'true';
  if (isDevelopment && !enableInDev) {
    console.log('[Sentry] Development mode - error tracking disabled (set VITE_SENTRY_DEV=true to enable)');
    return;
  }

  try {
    Sentry.init({
      dsn: "https://e5418d47d55c8f39e3b673cb2a251ee1@o4510126941863936.ingest.us.sentry.io/4510126949400576",
      // Setting this option to true will send default PII data to Sentry.
      // For example, automatic IP address collection on events
      sendDefaultPii: true,

      // Optional: Add release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: isDevelopment ? 'development' : 'production',

      // Optional: Performance monitoring (adjust sample rate as needed)
      tracesSampleRate: isDevelopment ? 1.0 : 0.2,

      // Filter out noisy errors
      beforeSend(event, hint) {
        const error = hint.originalException as Error;
        const errorMessage = error?.message || '';

        // Filter out ResizeObserver errors (benign browser noise)
        if (errorMessage.includes('ResizeObserver')) {
          return null;
        }

        // Filter out WebKit internal errors (iOS WebView noise)
        if (errorMessage.includes('EmptyRanges') ||
            errorMessage.includes('sortedTrackListForMenu')) {
          return null;
        }

        return event;
      },
    });

    console.log('[Sentry] ✅ Initialized successfully', {
      environment: isDevelopment ? 'development' : 'production',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    });
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!isCapacitorEnabled()) return;

  try {
    Sentry.captureException(error, { extra: context });
  } catch (e) {
    console.error('[Sentry] Failed to capture exception:', e);
  }
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!isCapacitorEnabled()) return;

  try {
    Sentry.captureMessage(message, level);
  } catch (e) {
    console.error('[Sentry] Failed to capture message:', e);
  }
}

/**
 * Add breadcrumb for context
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!isCapacitorEnabled()) return;

  try {
    Sentry.addBreadcrumb(breadcrumb);
  } catch (e) {
    console.error('[Sentry] Failed to add breadcrumb:', e);
  }
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (!isCapacitorEnabled()) return;

  try {
    Sentry.setUser(user);
  } catch (e) {
    console.error('[Sentry] Failed to set user:', e);
  }
}

/**
 * Set custom context
 */
export function setContext(name: string, context: Record<string, any>): void {
  if (!isCapacitorEnabled()) return;

  try {
    Sentry.setContext(name, context);
  } catch (e) {
    console.error('[Sentry] Failed to set context:', e);
  }
}
