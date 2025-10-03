# Capacitor Mobile App Setup Guide

This document provides guidance for working with the Capacitor native wrapper for the Peaceful Kids web application.

## 📚 Documentation

**Offline Documentation Available**: Complete Capacitor documentation is available at `../../capacitor-docs/`

### Quick Links to Installed Plugins
- [App API](../../capacitor-docs/apis/app.md) - App state, back button handling
- [Status Bar API](../../capacitor-docs/apis/status-bar.md) - Status bar styling
- [Splash Screen API](../../capacitor-docs/apis/splash-screen.md) - Splash screen control
- [Keyboard API](../../capacitor-docs/apis/keyboard.md) - Keyboard behavior
- [Browser API](../../capacitor-docs/apis/browser.md) - External link handling
- [Preferences API](../../capacitor-docs/apis/preferences.md) - Native storage

### Platform-Specific Guides
- [iOS Configuration](../../capacitor-docs/main/ios/) - iOS setup and deployment
- [Android Configuration](../../capacitor-docs/main/android/) - Android setup and deployment
- [CLI Commands](../../capacitor-docs/cli/) - Complete CLI reference

**Navigation**: See `../../capacitor-docs/CAPACITOR-DOCS-INDEX.md` for complete documentation index.

## Overview

The Peaceful Kids web app is wrapped with Capacitor 7 to enable native iOS and Android deployments. The setup maintains the existing React + Vite architecture while adding essential native functionality.

## Quick Start

### Development Workflow

```bash
# Start web dev server for testing in browser
npm run dev

# Build and sync to native platforms
npm run cap:sync          # Production build + sync
npm run cap:sync:dev      # Development build + sync

# Open in native IDEs
npm run cap:open:ios      # Open in Xcode
npm run cap:open:android  # Open in Android Studio

# Build and run on devices/simulators
npm run cap:run:ios       # Build, sync, and run on iOS
npm run cap:run:android   # Build, sync, and run on Android
```

### Live Reload for Development

To enable live reload on physical devices or simulators:

1. Start the dev server: `npm run dev`
2. Find your local IP address:
   - macOS/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
3. Set the `CAP_SERVER_URL` environment variable:
   ```bash
   export CAP_SERVER_URL=http://YOUR_IP:8080
   npm run cap:sync:dev
   npm run cap:open:ios
   ```
4. For simulators only, you can use localhost:
   ```bash
   export CAP_SERVER_URL=http://localhost:8080
   ```

**Note**: After testing with live reload, remove the environment variable and rebuild for production:
```bash
unset CAP_SERVER_URL
npm run cap:sync
```

## Project Structure

```
peaceful-kids/
├── src/
│   ├── capacitor-init.ts         # Native plugin initialization
│   ├── utils/
│   │   └── platform.ts            # Platform detection utilities
│   └── main.tsx                   # Entry point (calls initializeCapacitor)
├── ios/                           # iOS native project (Xcode)
├── android/                       # Android native project (Android Studio)
├── capacitor.config.ts            # Capacitor configuration
└── dist/                          # Web build output (synced to native)
```

## Installed Plugins

### Core Plugins
- **@capacitor/app** - App state and lifecycle events, Android back button handling
- **@capacitor/status-bar** - Status bar styling and visibility
- **@capacitor/splash-screen** - Native splash screen management
- **@capacitor/keyboard** - Keyboard behavior and events
- **@capacitor/browser** - Open external links in native browser
- **@capacitor/preferences** - Native key-value storage

### Platform Detection

Use the utilities in `src/utils/platform.ts`:

```typescript
import { isNativePlatform, isIOS, isAndroid, isWeb } from '@/utils/platform';

// Check if running as native app
if (isNativePlatform()) {
  // Native-specific code
}

// Platform-specific logic
if (isIOS()) {
  // iOS-specific code
}

if (isAndroid()) {
  // Android-specific code
}

if (isWeb()) {
  // Web-only code
}
```

## Native Functionality

### Status Bar Configuration

The status bar is configured in `src/capacitor-init.ts`:
- Light style (dark text on light background)
- White background color
- Does not overlay content by default

To control the status bar dynamically:

```typescript
import { hideStatusBar, showStatusBar } from '@/capacitor-init';

// Hide for fullscreen experiences (e.g., media player)
await hideStatusBar();

// Show again when returning to normal screens
await showStatusBar();
```

### Android Back Button

The hardware back button is configured to:
1. Navigate backward in browser history if possible
2. Minimize the app (not exit) if at the root screen

This behavior is handled automatically in `src/capacitor-init.ts`.

### Splash Screen

The splash screen is configured to auto-hide after the app loads. Timing is controlled in `capacitor-init.ts`.

## Icons and Splash Screens

### Icon Requirements

**iOS**:
- App Icon: 1024x1024 PNG (no transparency, no rounded corners)
- Place in: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**Android**:
- Adaptive Icon:
  - Foreground: 1024x1024 PNG (with transparency, centered in safe zone)
  - Background: 1024x1024 PNG or solid color
- Place in: `android/app/src/main/res/drawable/`

### Splash Screen Assets

**iOS**:
- Image: 2732x2732 PNG (centered content in safe zone)
- Place in: `ios/App/App/Assets.xcassets/Splash.imageset/`

**Android**:
- Image: 2732x2732 PNG (centered content in safe zone)
- Place in: `android/app/src/main/res/drawable/`
- Configure colors in: `android/app/src/main/res/values/styles.xml`

### Automated Asset Generation

You can use Capacitor's asset generation tool:

```bash
npm install -D @capacitor/assets

# Place your source images in:
# - resources/icon.png (1024x1024, foreground)
# - resources/splash.png (2732x2732, centered content)

# Generate all assets
npx capacitor-assets generate
```

## Configuration

### App Identifiers

- **iOS Bundle ID**: `com.peacefulkids.app`
- **Android Package Name**: `com.peacefulkids.app`
- **App Name**: `Peaceful Kids`

### Build Configurations

**Production** (default):
```bash
npm run build
npm run cap:sync
```

**Development** (includes source maps):
```bash
npm run build:dev
npm run cap:sync:dev
```

## Platform-Specific Notes

### iOS

**First-time setup**:
1. Open project: `npm run cap:open:ios`
2. Xcode will prompt to install CocoaPods dependencies - accept
3. Configure signing in Xcode:
   - Select project in navigator
   - Select target "App"
   - Go to "Signing & Capabilities"
   - Select your development team
4. Run on simulator or device from Xcode

**Updating dependencies**:
```bash
cd ios/App
pod install
```

### Android

**First-time setup**:
1. Open project: `npm run cap:open:android`
2. Android Studio will sync Gradle dependencies
3. Connect device or start emulator
4. Run from Android Studio

**Gradle issues**:
If you encounter Gradle sync issues:
```bash
cd android
./gradlew clean
./gradlew build
```

## Troubleshooting

### "White screen" on app launch
- Check browser console in dev tools (Safari for iOS, Chrome for Android)
- Verify build succeeded: check `dist/` folder has content
- Run `npm run cap:sync` to ensure assets are synced

### "Cannot connect to dev server" with live reload
- Verify dev server is running: `npm run dev`
- Check firewall allows connections on port 8080
- Ensure device/simulator is on same network
- For iOS simulator, use `http://localhost:8080`
- For physical devices, use your machine's IP address

### Plugins not working
- Ensure you've run `npm run cap:sync` after installing plugins
- Check that `initializeCapacitor()` is called in `main.tsx`
- Verify plugin is listed in `capacitor.config.ts`
- For iOS, run `pod install` in `ios/App/`

### Android build fails
- Check Java version: Capacitor 7 requires Java 17
- Clear Gradle cache: `cd android && ./gradlew clean`
- Check Android SDK is up to date in Android Studio

### iOS build fails
- Check Xcode version: Capacitor 7 requires Xcode 15+
- Run `pod install` in `ios/App/`
- Clean build folder in Xcode: Product > Clean Build Folder

## Additional Resources

### Offline Documentation (Recommended)
- **Main Index**: `../../capacitor-docs/CAPACITOR-DOCS-INDEX.md`
- **Quick Reference**: `../../CAPACITOR-QUICK-REFERENCE.md`
- **API Reference**: `../../capacitor-docs/apis/`
- **iOS Guide**: `../../capacitor-docs/main/ios/`
- **Android Guide**: `../../capacitor-docs/main/android/`
- **CLI Reference**: `../../capacitor-docs/cli/`

### Online Resources
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Development Guide](https://capacitorjs.com/docs/ios)
- [Android Development Guide](https://capacitorjs.com/docs/android)
- [Plugin APIs](https://capacitorjs.com/docs/apis)

## Next Steps

This setup provides the foundation for native deployment. Future enhancements will include:

1. **RevenueCat Integration** - In-app purchases and subscription management (Day 9 of launch plan)
2. **Push Notifications** - Engagement and retention (if needed)
3. **Analytics** - Usage tracking and insights (if needed)
4. **App Store Assets** - Screenshots, descriptions, metadata
5. **Release Configuration** - Production signing and distribution
