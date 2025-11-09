/**
 * Utility functions for subscription and plan management
 */

import type { UserSubscription } from '@/types/user';

export type PlanType = 'free' | 'peace' | 'peace_plus';

/**
 * Get the effective plan type based on subscription status
 * @param subscription - User subscription object
 * @returns The effective plan type ('free', 'peace', or 'peace_plus')
 */
export const getEffectivePlanType = (subscription: UserSubscription | null): PlanType => {
  return subscription?.is_active ? subscription.plan_type : 'free';
};

/**
 * Check if a user has access to a specific plan level or higher
 * @param userPlan - User's current plan type
 * @param requiredPlan - Required plan type for access
 * @returns true if user has access, false otherwise
 */
export const hasAccessToPlan = (userPlan: PlanType, requiredPlan: PlanType): boolean => {
  const planHierarchy: Record<PlanType, number> = {
    'free': 0,
    'peace': 1,
    'peace_plus': 2
  };

  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
};

/**
 * Check if content is locked for a user based on their subscription
 * @param requiredPlan - Plan required to access the content
 * @param userSubscription - User's subscription object
 * @returns true if content is locked, false if accessible
 */
export const isContentLocked = (
  requiredPlan: PlanType | null,
  userSubscription: UserSubscription | null
): boolean => {
  if (!requiredPlan || requiredPlan === 'free') return false;

  const userPlan = getEffectivePlanType(userSubscription);
  return !hasAccessToPlan(userPlan, requiredPlan);
};

/**
 * Get display name for a plan type
 * @param planType - The plan type
 * @returns Display-friendly plan name
 */
export const getPlanDisplayName = (planType: PlanType): string => {
  const displayNames: Record<PlanType, string> = {
    'free': 'Free',
    'peace': 'Peace Plan',
    'peace_plus': 'Peace Plus'
  };

  return displayNames[planType] || 'Free';
};