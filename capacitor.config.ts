import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lumatrip.app',
  appName: 'LumaTrip',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#667eea",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      backgroundColor: "#667eea",
      style: "light"
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true
    },
    App: {
      launchUrl: "lumatrip://",
      iosScheme: "lumatrip"
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // 优化Android性能
    appendUserAgent: " LumaTrip/1.0.0",
    backgroundColor: "#667eea"
  },
  ios: {
    contentInset: "automatic",
    // iOS特定优化
    backgroundColor: "#667eea",
    scheme: "LumaTrip"
  }
};

export default config;
