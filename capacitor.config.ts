import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.peacefulkids.app',
  appName: 'Peaceful',
  webDir: 'dist',
  server: {
    // Enable this during development for live reload
    // Replace with your local machine's IP address when testing on physical devices
    // For simulators/emulators, localhost works fine
    url: process.env.CAP_SERVER_URL || undefined,
    cleartext: true, // Allow HTTP connections (required for local dev)
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true, // Allow HTTP in development
  },
};

export default config;
