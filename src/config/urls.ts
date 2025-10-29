/**
 * Centralized URL Configuration
 *
 * All external URLs should be defined here for easy maintenance.
 * This ensures consistency across the app and makes updates easier.
 */

export const APP_URLS = {
  // Legal Pages
  privacy: 'https://support.peacefulkids.app/privacy',
  terms: 'https://support.peacefulkids.app/terms',
  support: 'https://support.peacefulkids.app/support',

  // Account Management
  subscription: 'https://support.peacefulkids.app/subscription',
  accountDeletion: 'https://support.peacefulkids.app/account-deletion',

  // Support Contact
  supportEmail: 'support@peacefulkids.app',

  // Developer Contact (for error messages)
  developerEmail: 'dev@peacefulkids.app',

  // Reviewer Account (for App Store)
  reviewerEmail: 'reviewer@peaceful.app',

  // CDN
  cdnBase: 'https://cdn.peacefulkids.app',

  // Main Website
  website: 'https://peacefulkids.app',

  // App Store Links (for subscription management)
  appStore: {
    subscriptions: 'https://apps.apple.com/account/subscriptions',
    app: 'https://apps.apple.com/app/idYOUR_APP_ID', // Update with actual App ID
  },

  // Google Play Links
  googlePlay: {
    subscriptions: 'https://play.google.com/store/account/subscriptions',
    app: 'https://play.google.com/store/apps/details?id=com.peaceful.kids',
  }
};

/**
 * Get the appropriate subscription management URL based on platform
 */
export function getSubscriptionManagementUrl(platform: 'ios' | 'android' | 'web' = 'web'): string {
  switch (platform) {
    case 'ios':
      return APP_URLS.appStore.subscriptions;
    case 'android':
      return APP_URLS.googlePlay.subscriptions;
    default:
      return APP_URLS.subscription;
  }
}