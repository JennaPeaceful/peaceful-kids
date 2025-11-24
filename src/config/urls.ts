/**
 * Centralized URL Configuration
 *
 * All external URLs should be defined here for easy maintenance.
 * This ensures consistency across the app and makes updates easier.
 */

export const APP_URLS = {
  // Legal Pages
  privacy: 'https://support.peacefulmeditationapp.com/privacy',
  terms: 'https://support.peacefulmeditationapp.com/terms',
  support: 'https://support.peacefulmeditationapp.com/support',

  // Account Management
  subscription: 'https://support.peacefulmeditationapp.com/subscription',
  accountDeletion: 'https://support.peacefulmeditationapp.com/account-deletion',

  // Support Contact
  supportEmail: 'support@peacefulmeditationapp.com',

  // Developer Contact (for error messages)
  developerEmail: 'dev@peacefulmeditationapp.com',

  // Reviewer Account (for App Store)
  reviewerEmail: 'reviewer@peaceful.app',

  // CDN (kept on old domain for stability)
  cdnBase: 'https://cdn.peacefulkids.app',

  // Main Website
  website: 'https://peacefulmeditationapp.com',

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