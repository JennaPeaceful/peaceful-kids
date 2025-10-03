/**
 * Platform detection utilities
 *
 * These functions work in both web and native environments.
 * When Capacitor is not available, they return sensible defaults.
 */

/**
 * Check if Capacitor is available and enabled
 */
const isCapacitorEnabled = (): boolean => {
  return import.meta.env.VITE_CAPACITOR_ENABLED === 'true';
};

/**
 * Check if the app is running as a native app (iOS or Android)
 * Returns false in web builds
 */
export const isNativePlatform = (): boolean => {
  if (!isCapacitorEnabled()) return false;

  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    return Capacitor?.isNativePlatform?.() || false;
  } catch {
    return false;
  }
};

/**
 * Check if the app is running on iOS
 * Returns false in web builds
 */
export const isIOS = (): boolean => {
  if (!isCapacitorEnabled()) return false;

  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    return Capacitor?.getPlatform?.() === 'ios';
  } catch {
    return false;
  }
};

/**
 * Check if the app is running on Android
 * Returns false in web builds
 */
export const isAndroid = (): boolean => {
  if (!isCapacitorEnabled()) return false;

  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    return Capacitor?.getPlatform?.() === 'android';
  } catch {
    return false;
  }
};

/**
 * Check if the app is running in a web browser
 * Returns true when Capacitor is not available
 */
export const isWeb = (): boolean => {
  if (!isCapacitorEnabled()) return true;

  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    return Capacitor?.getPlatform?.() === 'web' || !Capacitor;
  } catch {
    return true;
  }
};

/**
 * Get the current platform name
 * @returns 'ios' | 'android' | 'web'
 */
export const getPlatform = (): string => {
  if (!isCapacitorEnabled()) return 'web';

  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    return Capacitor?.getPlatform?.() || 'web';
  } catch {
    return 'web';
  }
};