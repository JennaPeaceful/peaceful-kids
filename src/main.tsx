import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dynamically import Capacitor initialization only if available
// This allows the web build to work without Capacitor dependencies
const initializeApp = async () => {
  try {
    // Try to import Capacitor-specific modules (won't exist in Lovable web build)
    const { initializeCapacitor } = await import("./capacitor-init");
    const { initSentry } = await import("./config/sentry");
    const { initAnalytics } = await import("./config/analytics");

    // Initialize Sentry FIRST (before any other code runs)
    initSentry();

    // Initialize PostHog analytics
    initAnalytics();

    // Initialize Capacitor native plugins
    await initializeCapacitor();
  } catch (error) {
    // Silently ignore if modules don't exist (web-only build)
    console.log("Running in web-only mode");
  }

  // Render app
  createRoot(document.getElementById("root")!).render(<App />);
};

initializeApp();
