/**
 * RevenueCat Utilities - Environment-aware exports
 *
 * This module conditionally exports RevenueCat functions based on the environment.
 * In web builds, it returns stub implementations.
 * In native builds, it uses the full RevenueCat SDK.
 */

import { isNativePlatform, isIOS, isAndroid } from './platform';

// Check if we're in a Capacitor-enabled build (runtime check)
const isCapacitorEnabled = () => {
  try {
    // @ts-ignore
    return !!window.Capacitor;
  } catch {
    return false;
  }
};

/**
 * Initialize RevenueCat SDK
 * No-op in web builds
 */
export async function initRevenueCat(): Promise<boolean> {
  if (!isCapacitorEnabled() || !isNativePlatform()) {
    console.log('[RevenueCat] Web mode - skipping initialization');
    return false;
  }

  try {
    // Dynamic import only when needed
    const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
    const { REVENUECAT_CONFIG } = await import('@/config/revenuecat');

    Purchases.setLogLevel({ level: LOG_LEVEL.INFO });

    const apiKey = isIOS() ? REVENUECAT_CONFIG.ios : REVENUECAT_CONFIG.android;
    await Purchases.configure({ apiKey, appUserID: undefined });

    console.log('[RevenueCat] Successfully initialized');
    return true;
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);
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
    console.log('[RevenueCat] User identified:', userId);
  } catch (error) {
    console.error('[RevenueCat] Failed to identify user:', error);
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
    console.log('[RevenueCat] User logged out');
  } catch (error) {
    console.error('[RevenueCat] Failed to logout user:', error);
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
    console.error('[RevenueCat] Failed to get offerings:', error);
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
    console.error('[RevenueCat] Purchase failed:', error);
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
    return result;
  } catch (error) {
    console.error('[RevenueCat] Restore failed:', error);
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
    console.error('[RevenueCat] Failed to check entitlements:', error);
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
    window.open('https://peacefulkids.app/account/subscription', '_blank');
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
    console.error('[RevenueCat] Failed to open subscription management:', error);
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
    console.error('[RevenueCat] Failed to get customer info:', error);
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
    console.error('[RevenueCat] Failed to get highest tier:', error);
    return null;
  }
}