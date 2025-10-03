/**
 * Sentry Error Tracking Configuration - Environment-aware
 *
 * This module initializes Sentry for error tracking in production.
 * In web builds without Capacitor, Sentry is disabled.
 */

// Check if we're in a Capacitor-enabled build
const isCapacitorEnabled = () => import.meta.env.VITE_CAPACITOR_ENABLED === 'true';

/**
 * Initialize Sentry error tracking
 * No-op in web builds
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

  try {
    // Dynamic import of Sentry when in native mode
    import('@sentry/capacitor').then((Sentry) => {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE || 'development',
        integrations: [
          // Add any Capacitor-specific integrations here
        ],
        tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
        debug: import.meta.env.MODE !== 'production',
        beforeSend(event, hint) {
          // Filter out non-critical errors in production
          if (import.meta.env.MODE === 'production') {
            // Don't send network errors
            if (hint.originalException?.message?.includes('Network')) {
              return null;
            }
          }
          return event;
        },
      });

      console.log('[Sentry] Initialized for', import.meta.env.MODE);
    }).catch((error) => {
      console.log('[Sentry] Failed to initialize:', error);
    });
  } catch (error) {
    console.log('[Sentry] Failed to initialize:', error);
  }
}