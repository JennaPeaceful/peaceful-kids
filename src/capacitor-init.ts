/**
 * Capacitor Native Plugin Initialization
 *
 * This file initializes all Capacitor plugins and configures native functionality.
 * Import and call initializeCapacitor() in your main.tsx entry point.
 */

import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { isNativePlatform, isAndroid } from './utils/platform';
import { initRevenueCat } from './utils/revenuecat';

/**
 * Initialize Capacitor plugins and native functionality
 */
export async function initializeCapacitor(): Promise<void> {
  // Only run native initialization on mobile platforms
  if (!isNativePlatform()) {
    console.log('[Capacitor] Running in web mode - skipping native initialization');
    return;
  }

  console.log('[Capacitor] Initializing native plugins...');

  try {
    // Configure Status Bar
    await configureStatusBar();

    // Configure Android Back Button
    if (isAndroid()) {
      configureAndroidBackButton();
    }

    // Configure Keyboard
    configureKeyboard();

    // Initialize RevenueCat SDK
    // This must happen before any purchase UI is shown
    await initRevenueCat();

    // Note: SplashScreen.hide() is called in App.tsx as soon as the web app loads
    // This ensures the splash screen is hidden promptly, while native init continues in background

    console.log('[Capacitor] Native plugins initialized successfully');
  } catch (error) {
    console.error('[Capacitor] Error initializing native plugins:', error);
  }
}

/**
 * Configure status bar appearance
 */
async function configureStatusBar(): Promise<void> {
  try {
    // Set status bar style to light (dark text on light background)
    await StatusBar.setStyle({ style: Style.Light });

    // Set background color to white
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    // Make status bar overlay content (for immersive experiences)
    await StatusBar.setOverlaysWebView({ overlay: false });

    console.log('[StatusBar] Configured successfully');
  } catch (error) {
    console.error('[StatusBar] Configuration failed:', error);
  }
}

/**
 * Configure Android back button behavior
 */
function configureAndroidBackButton(): void {
  // Handle Android hardware back button
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      // If we can go back in browser history, do it
      window.history.back();
    } else {
      // Otherwise, minimize the app (don't exit)
      App.minimizeApp();
    }
  });

  console.log('[App] Android back button configured');
}

/**
 * Configure keyboard behavior
 */
function configureKeyboard(): void {
  // Keyboard configuration can be customized here if needed
  // For now, we'll use default behavior
  console.log('[Keyboard] Using default configuration');
}

/**
 * Show status bar (useful for screens where it was hidden)
 */
export async function showStatusBar(): Promise<void> {
  if (isNativePlatform()) {
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('[StatusBar] Failed to show:', error);
    }
  }
}

/**
 * Hide status bar (useful for fullscreen experiences like media player)
 */
export async function hideStatusBar(): Promise<void> {
  if (isNativePlatform()) {
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('[StatusBar] Failed to hide:', error);
    }
  }
}
