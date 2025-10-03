import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeCapacitor } from "./capacitor-init";
import { initSentry } from "./config/sentry";
import { initAnalytics } from "./config/analytics";

// Initialize Sentry FIRST (before any other code runs)
initSentry();

// Initialize PostHog analytics
initAnalytics();

// Initialize Capacitor native plugins
initializeCapacitor().catch((error) => {
  console.error("Failed to initialize Capacitor:", error);
});

createRoot(document.getElementById("root")!).render(<App />);
