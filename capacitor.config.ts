import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.peaceful.kids',
  appName: 'Peaceful',
  webDir: 'dist',
  server: {
    // Enable this during development for live reload
    // Replace with your local machine's IP address when testing on physical devices
    // For simulators/emulators, localhost works fine
    url: process.env.CAP_SERVER_URL || undefined,
    cleartext: true, // Allow HTTP connections (required for local dev)
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#449dbd',
    },
    Keyboard: {
      resize: 'body', // Allow viewport resize when keyboard shows - enables scrolling to see covered fields
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true, // Allow HTTP in development
  },
};

export default config;
