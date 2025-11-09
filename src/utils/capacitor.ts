/**
 * Utility functions for Capacitor detection and availability
 */

/**
 * Check if Capacitor is available in the current environment
 * @returns true if Capacitor is available, false otherwise
 */
export const isCapacitorEnabled = (): boolean => {
  try {
    return !!window.Capacitor;
  } catch {
    return false;
  }
};

/**
 * Check if the app is running on a native platform (iOS or Android)
 * @returns true if running on native platform, false if web
 */
export const isNativePlatform = (): boolean => {
  return isCapacitorEnabled() && window.Capacitor.isNativePlatform();
};

/**
 * Get the current platform name
 * @returns 'ios' | 'android' | 'web'
 */
export const getPlatformName = (): 'ios' | 'android' | 'web' => {
  if (!isCapacitorEnabled()) return 'web';
  const platform = window.Capacitor.getPlatform();
  return platform as 'ios' | 'android' | 'web';
};