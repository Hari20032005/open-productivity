import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "FreeFlow",
  slug: "freeflow",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "freeflow",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0f172a",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.freeflow.app",
    infoPlist: {
      NSUserTrackingUsageDescription:
        "We use this to track your app usage and help you reduce screen time.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#0f172a",
    },
    package: "com.freeflow.app",
    permissions: [
      "RECEIVE_BOOT_COMPLETED",
      "FOREGROUND_SERVICE",
      "PACKAGE_USAGE_STATS",
      "BIND_ACCESSIBILITY_SERVICE",
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#6366f1",
        sounds: ["./assets/sounds/notification.wav"],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
  },
});
