import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Render the app immediately
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize native features asynchronously (doesn't block render)
// Always attempt initialization - capacitor-init.ts will detect if it's native or web
(async () => {
  try {
    // Dynamically import native-only modules
    const [
      { initializeCapacitor },
      { initSentry },
      { initAnalytics }
    ] = await Promise.all([
      import('./capacitor-init'),
      import('./config/sentry'),
      import('./config/analytics')
    ]);

    // Initialize Sentry error tracking
    initSentry();

    // Initialize PostHog analytics
    initAnalytics();

    // Initialize Capacitor plugins (no-op on web)
    await initializeCapacitor();

    console.log('[Main] Initialization complete');
  } catch (error) {
    console.error('[Main] Failed to initialize:', error);
    // Continue anyway - app should work without native features
  }
})();
