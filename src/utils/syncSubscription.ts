/**
 * Subscription Sync Utility
 *
 * Syncs subscription status between RevenueCat and Supabase.
 * This ensures the app's backend database reflects the user's actual purchase status.
 *
 * CALL THIS:
 * 1. After successful purchase
 * 2. After restoring purchases
 * 3. On app launch (to catch any subscription changes that happened elsewhere)
 */

import { supabase } from '@/integrations/supabase/client';
import { isNativePlatform } from './platform';
import { useUserStore } from '@/stores/userStore';

// Check if we're in a Capacitor-enabled build
const isCapacitorEnabled = () => import.meta.env.VITE_CAPACITOR_ENABLED === 'true';

export interface SyncResult {
  success: boolean;
  planType: 'free' | 'peace_plan' | 'peace_plus_plan';
  isActive: boolean;
  error?: string;
}

/**
 * Sync subscription status from RevenueCat to Supabase
 *
 * @param userId - The user's ID from Supabase auth
 * @returns SyncResult - Result of the sync operation
 */
export async function syncSubscriptionStatus(userId: string): Promise<SyncResult> {
  console.log('[SubscriptionSync] Starting sync for user:', userId);

  try {
    let planType: 'free' | 'peace_plan' | 'peace_plus_plan' = 'free';
    let isActive = false;

    // Only check RevenueCat on native platforms with Capacitor enabled
    if (isCapacitorEnabled() && isNativePlatform()) {
      console.log('[SubscriptionSync] Checking RevenueCat entitlements...');

      // Dynamic import of RevenueCat functions
      const { getCustomerInfo, getHighestTierEntitlement } = await import('./revenuecat');

      const customerInfo = await getCustomerInfo();

      if (customerInfo) {
        const activeEntitlements = Object.keys(customerInfo.entitlements.active);
        console.log('[SubscriptionSync] Active entitlements:', activeEntitlements);

        if (activeEntitlements.length > 0) {
          isActive = true;
          const highestTier = await getHighestTierEntitlement();
          planType = (highestTier as 'peace_plan' | 'peace_plus_plan') || 'peace_plan'; // Default to peace_plan if we can't determine
        }
      }
    } else {
      console.log('[SubscriptionSync] Web platform - checking Supabase only');
      // On web, just read the existing subscription status from Supabase
      // This handles web payments (e.g., Stripe) that are managed separately
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('plan_type, is_active')
        .eq('user_id', userId)
        .single();

      if (existingSub) {
        planType = existingSub.plan_type as 'free' | 'peace_plan' | 'peace_plus_plan';
        isActive = existingSub.is_active;
        console.log('[SubscriptionSync] Existing web subscription:', planType, isActive);
      }
    }

    // Update Supabase with the current status
    console.log('[SubscriptionSync] Updating Supabase:', { planType, isActive });

    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: userId,
          plan_type: planType,
          is_active: isActive,
        },
        {
          onConflict: 'user_id',
        }
      );

    if (upsertError) {
      console.error('[SubscriptionSync] Failed to update Supabase:', upsertError);
      return {
        success: false,
        planType,
        isActive,
        error: upsertError.message,
      };
    }

    // Update the Zustand store
    const { setSubscription } = useUserStore.getState();
    setSubscription({
      id: userId, // Using userId as subscription ID
      user_id: userId,
      plan_type: planType,
      is_active: isActive,
    });

    console.log('[SubscriptionSync] Sync completed successfully');
    return {
      success: true,
      planType,
      isActive,
    };
  } catch (error: any) {
    console.error('[SubscriptionSync] Sync failed:', error);
    return {
      success: false,
      planType: 'free',
      isActive: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Sync subscription on app launch
 * Call this in your app initialization code
 *
 * @param userId - The user's ID from Supabase auth
 */
export async function syncOnAppLaunch(userId: string): Promise<void> {
  if (!userId) {
    console.log('[SubscriptionSync] No user ID - skipping launch sync');
    return;
  }

  console.log('[SubscriptionSync] Running launch sync...');

  try {
    const result = await syncSubscriptionStatus(userId);

    if (result.success) {
      console.log('[SubscriptionSync] Launch sync successful');
      console.log('[SubscriptionSync] Plan:', result.planType, 'Active:', result.isActive);
    } else {
      console.warn('[SubscriptionSync] Launch sync failed:', result.error);
    }
  } catch (error) {
    console.error('[SubscriptionSync] Launch sync error:', error);
  }
}

/**
 * Force a subscription refresh from RevenueCat
 * Use this when you know a purchase was just completed
 *
 * @param userId - The user's ID from Supabase auth
 * @param onSuccess - Optional callback on successful sync
 * @param onError - Optional callback on sync error
 */
export async function forceRefreshSubscription(
  userId: string,
  onSuccess?: (result: SyncResult) => void,
  onError?: (error: string) => void
): Promise<void> {
  console.log('[SubscriptionSync] Force refreshing subscription...');

  try {
    // Small delay to ensure RevenueCat backend has processed the purchase
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = await syncSubscriptionStatus(userId);

    if (result.success) {
      console.log('[SubscriptionSync] Force refresh successful');
      onSuccess?.(result);
    } else {
      console.error('[SubscriptionSync] Force refresh failed:', result.error);
      onError?.(result.error || 'Sync failed');
    }
  } catch (error: any) {
    console.error('[SubscriptionSync] Force refresh error:', error);
    onError?.(error.message || 'Unknown error');
  }
}
