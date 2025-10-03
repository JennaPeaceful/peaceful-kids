/**
 * RevenueCat Configuration
 *
 * This file contains RevenueCat configuration constants.
 * These are only used when Capacitor is enabled.
 */

// Check if we're in a Capacitor-enabled build
const isCapacitorEnabled = () => import.meta.env.VITE_CAPACITOR_ENABLED === 'true';

/**
 * RevenueCat API Keys
 * These should be set via environment variables in production
 */
export const REVENUECAT_CONFIG = {
  ios: import.meta.env.VITE_REVENUECAT_IOS_KEY || 'ios_key_placeholder',
  android: import.meta.env.VITE_REVENUECAT_ANDROID_KEY || 'android_key_placeholder',
};

/**
 * Entitlement IDs
 * These must match your RevenueCat dashboard configuration
 */
export const ENTITLEMENT_IDS = {
  PREMIUM: 'premium',           // Generic premium access (backward compatibility)
  PEACE_PLAN: 'peace_plan',      // Peace Plan tier
  PEACE_PLUS: 'peace_plus_plan', // Peace Plus Plan tier
};

/**
 * Product IDs
 * These must match your App Store Connect and Google Play Console products
 */
export const PRODUCT_IDS = {
  // Peace Plan Monthly
  PEACE_PLAN_MONTHLY_IOS: 'com.peacefulkids.peace_plan.monthly',
  PEACE_PLAN_MONTHLY_ANDROID: 'peace_plan_monthly',

  // Peace Plus Plan Monthly
  PEACE_PLUS_MONTHLY_IOS: 'com.peacefulkids.peace_plus.monthly',
  PEACE_PLUS_MONTHLY_ANDROID: 'peace_plus_monthly',
};

/**
 * Offering IDs
 * These must match your RevenueCat dashboard offerings
 */
export const OFFERING_IDS = {
  DEFAULT: 'default',
  PEACE_PLAN: 'peace_plan_offering',
  PEACE_PLUS: 'peace_plus_offering',
};

/**
 * Default offering to display if no specific offering is requested
 */
export const DEFAULT_OFFERING_ID = OFFERING_IDS.DEFAULT;