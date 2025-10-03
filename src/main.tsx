import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Render the app immediately
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize native features asynchronously (doesn't block render)
if (import.meta.env.VITE_CAPACITOR_ENABLED === 'true') {
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

      // Initialize Capacitor plugins
      await initializeCapacitor();

      console.log('Native features initialized');
    } catch (error) {
      console.error('Failed to initialize native features:', error);
      // Continue anyway - app should work without native features
    }
  })();
}
