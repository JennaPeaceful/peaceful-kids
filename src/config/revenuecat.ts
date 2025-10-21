/**
 * RevenueCat Configuration
 *
 * ⚠️ CRITICAL: This configuration MUST match RevenueCat dashboard settings.
 *
 * Reference: /docs/03-integrations/REVENUECAT-SETUP.md
 *
 * Dashboard Configuration:
 * - Entitlements: premium_meditations, premium_all
 * - Products: peaceful_meditations_monthly, peaceful_all_monthly
 * - Packages: meditations_monthly, all_monthly
 * - Offering: default (Set as "Current" in dashboard)
 *
 * DO NOT change these values without updating BOTH dashboard AND documentation.
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
  PREMIUM_MEDITATIONS: 'premium_meditations', // Peace Plan ($5.99/mo) - All Kids & Adults meditations
  PREMIUM_ALL: 'premium_all',                 // Peace Plus Plan ($9.99/mo) - Everything + Courses
};

/**
 * Product IDs
 * These must match your App Store Connect and Google Play Console products
 */
export const PRODUCT_IDS = {
  // Peace Plan Monthly ($5.99)
  PEACE_PLAN_MONTHLY: 'peaceful_meditations_monthly',

  // Peace Plus Plan Monthly ($9.99)
  PEACE_PLUS_MONTHLY: 'peaceful_all_monthly',
};

/**
 * Package IDs
 * These must match your RevenueCat dashboard package identifiers
 */
export const PACKAGE_IDS = {
  MEDITATIONS_MONTHLY: 'meditations_monthly',  // Peace Plan package
  ALL_MONTHLY: 'all_monthly',                  // Peace Plus Plan package
};

/**
 * Offering IDs
 * These must match your RevenueCat dashboard offerings
 */
export const OFFERING_IDS = {
  DEFAULT: 'default',
};

/**
 * Default offering to display if no specific offering is requested
 */
export const DEFAULT_OFFERING_ID = OFFERING_IDS.DEFAULT;