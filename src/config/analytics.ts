/**
 * Analytics Configuration - Environment-aware
 *
 * This module provides analytics tracking functions that work in both web and native environments.
 * In web builds without Capacitor, functions are no-ops.
 */

// Check if we're in a Capacitor-enabled build
const isCapacitorEnabled = () => import.meta.env.VITE_CAPACITOR_ENABLED === 'true';

let posthogInstance: any = null;

/**
 * Initialize PostHog analytics
 * No-op in web builds
 */
export function initAnalytics(): void {
  if (!isCapacitorEnabled()) {
    console.log('[Analytics] Web mode - analytics disabled');
    return;
  }

  try {
    // Dynamic import of PostHog when in native mode
    const posthog = require('posthog-js').default;
    const apiKey = import.meta.env.VITE_POSTHOG_KEY;

    if (apiKey) {
      posthogInstance = posthog.init(apiKey, {
        api_host: 'https://app.posthog.com',
        capture_pageview: false, // We'll manually track
        persistence: 'localStorage',
      });

      console.log('[Analytics] PostHog initialized');
    }
  } catch (error) {
    console.log('[Analytics] Failed to initialize:', error);
  }
}

/**
 * Identify user for analytics
 * No-op in web builds
 */
export function identifyUser(userId: string, properties?: Record<string, any>): void {
  if (!isCapacitorEnabled() || !posthogInstance) return;

  try {
    posthogInstance.identify(userId, properties);
    console.log('[Analytics] User identified:', userId);
  } catch (error) {
    console.error('[Analytics] Failed to identify user:', error);
  }
}

/**
 * Reset analytics (on logout)
 * No-op in web builds
 */
export function resetAnalytics(): void {
  if (!isCapacitorEnabled() || !posthogInstance) return;

  try {
    posthogInstance.reset();
    console.log('[Analytics] Analytics reset');
  } catch (error) {
    console.error('[Analytics] Failed to reset:', error);
  }
}

/**
 * Track event
 * No-op in web builds
 */
function trackEvent(eventName: string, properties?: Record<string, any>): void {
  if (!isCapacitorEnabled() || !posthogInstance) return;

  try {
    posthogInstance.capture(eventName, properties);
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

// Specific tracking functions
export const trackSignIn = (method: string) => trackEvent('user_signed_in', { method });
export const trackAgeGateResponse = (ageGroup: string) => trackEvent('age_gate_response', { age_group: ageGroup });
export const trackParentalGatePassed = () => trackEvent('parental_gate_passed');
export const trackMeditationPlayed = (meditationId: string, title: string) =>
  trackEvent('meditation_played', { meditation_id: meditationId, title });
export const trackMeditationCompleted = (meditationId: string, title: string, duration: number) =>
  trackEvent('meditation_completed', { meditation_id: meditationId, title, duration });
export const trackPaywallViewed = (source: string) => trackEvent('paywall_viewed', { source });
export const trackPurchaseInitiated = (productId: string) => trackEvent('purchase_initiated', { product_id: productId });
export const trackPurchaseCompleted = (productId: string, revenue: number) =>
  trackEvent('purchase_completed', { product_id: productId, revenue });