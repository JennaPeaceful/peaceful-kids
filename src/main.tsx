import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize app with conditional Capacitor support
async function initializeApp() {
  // Only load Capacitor/native features if enabled via environment variable
  if (import.meta.env.VITE_CAPACITOR_ENABLED === 'true') {
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
  }

  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
}

initializeApp();
