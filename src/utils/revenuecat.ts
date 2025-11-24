/**
 * RevenueCat Utilities - Environment-aware exports
 *
 * This module conditionally exports RevenueCat functions based on the environment.
 * In web builds, it returns stub implementations.
 * In native builds, it uses the full RevenueCat SDK.
 */

import { isNativePlatform, isIOS, isAndroid } from './platform';
import { isCapacitorEnabled } from './capacitor';
import { logger } from './logger';
import { APP_URLS, getSubscriptionManagementUrl } from '@/config/urls';

/**
 * Initialize RevenueCat SDK
 * No-op in web builds
 */
export async function initRevenueCat(): Promise<boolean> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    logger.log('[RevenueCat] Web mode - skipping initialization');
    return false;
  }

  try {
    // Dynamic import only when needed
    const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
    const { REVENUECAT_CONFIG } = await import('@/config/revenuecat');

    Purchases.setLogLevel({ level: LOG_LEVEL.INFO });

    const apiKey = isIOS() ? REVENUECAT_CONFIG.ios : REVENUECAT_CONFIG.android;

    // Safety check: Never use placeholder keys in production
    if (apiKey.includes('placeholder')) {
      logger.error('[RevenueCat] ERROR: Placeholder API key detected! Please configure real RevenueCat keys in environment variables.');
      throw new Error('RevenueCat API key not properly configured. Please set VITE_REVENUECAT_IOS_KEY or VITE_REVENUECAT_ANDROID_KEY in your environment.');
    }

    await Purchases.configure({ apiKey, appUserID: undefined });

    logger.log('[RevenueCat] Successfully initialized');
    return true;
  } catch (error) {
    logger.error('[RevenueCat] Initialization failed:', error);
    return false;
  }
}

/**
 * Identify user with RevenueCat
 * No-op in web builds
 */
export async function identifyUser(userId: string): Promise<void> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    return;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.logIn({ appUserID: userId });
    logger.log('[RevenueCat] User identified:', userId);
  } catch (error) {
    logger.error('[RevenueCat] Failed to identify user:', error);
  }
}

/**
 * Logout user from RevenueCat
 * No-op in web builds
 */
export async function logoutUser(): Promise<void> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    return;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.logOut();
    logger.log('[RevenueCat] User logged out');
  } catch (error) {
    logger.error('[RevenueCat] Failed to logout user:', error);
  }
}

/**
 * Get available offerings
 * Returns null in web builds
 */
export async function getOfferings(): Promise<any> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    return null;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    logger.error('[RevenueCat] Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a package
 * Throws error in web builds
 */
export async function purchasePackage(pkg: any): Promise<any> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    throw new Error('Purchases are not available in web mode');
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    return result;
  } catch (error) {
    logger.error('[RevenueCat] Purchase failed:', error);
    throw error;
  }
}

/**
 * Restore purchases
 * Returns null in web builds
 */
export async function restorePurchases(): Promise<any> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    return null;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const result = await Purchases.restorePurchases();
    logger.log('[RevenueCat] Restore result:', result);
    // Return the customerInfo object directly, not the wrapper
    return result.customerInfo;
  } catch (error) {
    logger.error('[RevenueCat] Restore failed:', error);
    throw error;
  }
}

/**
 * Check entitlements
 * Returns empty map in web builds
 */
export async function checkEntitlements(): Promise<Map<string, boolean>> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    return new Map();
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { ENTITLEMENT_IDS } = await import('@/config/revenuecat');
    const customerInfo = await Purchases.getCustomerInfo();

    const entitlementMap = new Map<string, boolean>();

    // Check for Peace Plan (premium_meditations)
    entitlementMap.set(
      'peace_plan',
      customerInfo.customerInfo.entitlements.active[ENTITLEMENT_IDS.PREMIUM_MEDITATIONS] !== undefined
    );

    // Check for Peace Plus Plan (premium_all)
    entitlementMap.set(
      'peace_plus_plan',
      customerInfo.customerInfo.entitlements.active[ENTITLEMENT_IDS.PREMIUM_ALL] !== undefined
    );

    return entitlementMap;
  } catch (error) {
    logger.error('[RevenueCat] Failed to check entitlements:', error);
    return new Map();
  }
}

/**
 * Open subscription management
 * Opens web URL in web builds
 */
export async function openSubscriptionManagement(): Promise<void> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    // Open web-based subscription management
    const platform = isIOS() ? 'ios' : isAndroid() ? 'android' : 'web';
    window.open(getSubscriptionManagementUrl(platform), '_blank');
    return;
  }

  try {
    if (isIOS()) {
      // iOS - open App Store subscriptions
      window.open('https://apps.apple.com/account/subscriptions', '_blank');
    } else {
      // Android - open Play Store subscriptions
      window.open('https://play.google.com/store/account/subscriptions', '_blank');
    }
  } catch (error) {
    logger.error('[RevenueCat] Failed to open subscription management:', error);
  }
}

/**
 * Get customer info
 * Returns null in web builds
 */
export async function getCustomerInfo(): Promise<any> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    return null;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const result = await Purchases.getCustomerInfo();
    return result.customerInfo;
  } catch (error) {
    logger.error('[RevenueCat] Failed to get customer info:', error);
    return null;
  }
}

/**
 * Get highest tier entitlement
 * Returns null in web builds
 */
export async function getHighestTierEntitlement(): Promise<string | null> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    return null;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { ENTITLEMENT_IDS } = await import('@/config/revenuecat');
    const customerInfo = await Purchases.getCustomerInfo();

    const activeEntitlements = customerInfo.customerInfo.entitlements.active;

    // Check from highest to lowest tier
    // Peace Plus Plan (premium_all) - $9.99/mo - Everything + Courses
    if (activeEntitlements[ENTITLEMENT_IDS.PREMIUM_ALL]) {
      return 'peace_plus_plan';
    }
    // Peace Plan (premium_meditations) - $5.99/mo - All meditations
    else if (activeEntitlements[ENTITLEMENT_IDS.PREMIUM_MEDITATIONS]) {
      return 'peace_plan';
    }

    return null;
  } catch (error) {
    logger.error('[RevenueCat] Failed to get highest tier:', error);
    return null;
  }
}

/**
 * Get offering metadata
 * Returns null in web builds or if metadata is not available
 */
export async function getOfferingMetadata(): Promise<Record<string, any> | null> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    return null;
  }

  try {
    const offerings = await getOfferings();
    if (!offerings?.current?.metadata) {
      logger.log('[RevenueCat] No metadata found in current offering');
      return null;
    }

    // Parse metadata if it's a string, otherwise return as-is
    const metadata = typeof offerings.current.metadata === 'string'
      ? JSON.parse(offerings.current.metadata)
      : offerings.current.metadata;

    logger.log('[RevenueCat] Offering metadata:', metadata);
    return metadata;
  } catch (error) {
    logger.error('[RevenueCat] Failed to get offering metadata:', error);
    return null;
  }
}

/**
 * Get subscription icon URL from offering metadata
 * Returns null if not found or in web builds
 */
export async function getSubscriptionIcon(packageId: 'meditations_monthly' | 'all_monthly'): Promise<string | null> {
  try {
    const metadata = await getOfferingMetadata();
    if (!metadata?.subscription_icons?.[packageId]) {
      logger.log(`[RevenueCat] No icon found for package: ${packageId}`);
      return null;
    }

    return metadata.subscription_icons[packageId];
  } catch (error) {
    logger.error('[RevenueCat] Failed to get subscription icon:', error);
    return null;
  }
}

/**
 * Format trial period from introPrice object
 * Returns formatted string like "7 Days" or "14 Days"
 * Returns null if no valid trial period found
 */
export function formatTrialPeriod(introPrice: any): string | null {
  if (!introPrice) return null;

  try {
    // Check if it's a free trial (price should be 0)
    if (introPrice.price !== 0) return null;

    // Try to parse from period string (ISO 8601 format like "P1W" or "P7D")
    if (introPrice.period) {
      const period = introPrice.period.toUpperCase();

      // Match patterns like P7D (7 days), P1W (1 week), P14D (14 days)
      const daysMatch = period.match(/P(\d+)D/);
      if (daysMatch) {
        const days = parseInt(daysMatch[1], 10);
        return `${days} Day${days !== 1 ? 's' : ''}`;
      }

      const weeksMatch = period.match(/P(\d+)W/);
      if (weeksMatch) {
        const weeks = parseInt(weeksMatch[1], 10);
        const days = weeks * 7;
        return `${days} Day${days !== 1 ? 's' : ''}`;
      }
    }

    // Fallback to periodNumberOfUnits and periodUnit
    if (introPrice.periodNumberOfUnits && introPrice.periodUnit) {
      const units = introPrice.periodNumberOfUnits;
      const unit = introPrice.periodUnit.toLowerCase();

      if (unit === 'day') {
        return `${units} Day${units !== 1 ? 's' : ''}`;
      } else if (unit === 'week') {
        const days = units * 7;
        return `${days} Day${days !== 1 ? 's' : ''}`;
      } else if (unit === 'month') {
        return `${units} Month${units !== 1 ? 's' : ''}`;
      }
    }

    logger.log('[RevenueCat] Could not parse trial period from introPrice:', introPrice);
    return null;
  } catch (error) {
    logger.error('[RevenueCat] Failed to format trial period:', error);
    return null;
  }
}

/**
 * Check trial eligibility for products (iOS only)
 * Returns map of product IDs to eligibility status
 * Returns empty map for web builds or Android
 */
export async function checkTrialEligibility(
  productIds: string[]
): Promise<Record<string, any>> {
  if (!isCapacitorEnabled() || !isNativePlatform() || !isIOS()) {
    // Only available on iOS
    return {};
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const result = await Purchases.checkTrialOrIntroductoryPriceEligibility({
      productIdentifiers: productIds
    });

    logger.log('[RevenueCat] Trial eligibility check result:', result);
    return result;
  } catch (error) {
    logger.error('[RevenueCat] Failed to check trial eligibility:', error);
    return {};
  }
}

/**
 * Present native promo code redemption sheet (iOS 14.0+ only)
 * Opens Apple's built-in code redemption UI
 * No-op on web builds or Android
 */
export async function presentPromoCodeRedemption(): Promise<void> {
  if (!isCapacitorEnabled() || !isNativePlatform() || !isIOS()) {
    logger.log('[RevenueCat] Promo code redemption only available on iOS');
    return;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.presentCodeRedemptionSheet();
    logger.log('[RevenueCat] Presented code redemption sheet');
  } catch (error) {
    logger.error('[RevenueCat] Failed to present code redemption sheet:', error);
    throw error;
  }
}