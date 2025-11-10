/**
 * Platform detection utilities
 *
 * These functions work in both web and native environments.
 * When Capacitor is not available, they return sensible defaults.
 */

/**
 * Check if Capacitor is available and enabled
 */
export const isCapacitorEnabled = (): boolean => {
  // First check if Capacitor is actually present (runtime check)
  try {
    // @ts-ignore - Capacitor might not be available
    if (window.Capacitor) {
      return true;
    }
  } catch {
    // Fall through to environment variable check
  }

  // Fallback to environment variable
  return import.meta.env.VITE_CAPACITOR_ENABLED === 'true';
};

/**
 * Check if the app is running as a native app (iOS or Android)
 * Returns false in web builds
 */
export const isNativePlatform = (): boolean => {
  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    if (Capacitor?.isNativePlatform) {
      return Capacitor.isNativePlatform();
    }
  } catch {
    // Capacitor not available
  }

  // If Capacitor check fails, fall back to environment variable check
  if (!isCapacitorEnabled()) return false;

  return false;
};

/**
 * Check if the app is running on iOS
 * Returns false in web builds
 */
export const isIOS = (): boolean => {
  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    if (Capacitor?.getPlatform) {
      return Capacitor.getPlatform() === 'ios';
    }
  } catch {
    return false;
  }

  return false;
};

/**
 * Check if the app is running on Android
 * Returns false in web builds
 */
export const isAndroid = (): boolean => {
  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    if (Capacitor?.getPlatform) {
      return Capacitor.getPlatform() === 'android';
    }
  } catch {
    return false;
  }

  return false;
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
  try {
    // @ts-ignore - Capacitor might not be available
    const { Capacitor } = window;
    if (Capacitor?.getPlatform) {
      return Capacitor.getPlatform();
    }
  } catch {
    return 'web';
  }

  return 'web';
};