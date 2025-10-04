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

  console.log('[Sentry] Capacitor mode enabled but Sentry packages not installed');
}