import { Platform, Linking, Alert } from "react-native";
import { BlockedApp } from "../../store/blockerStore";

// Platform-specific blocking note:
// Android: Uses Accessibility Services + Usage Stats API + VPN-based DNS filtering
// iOS: Uses Screen Time API (ScreenTimeKit) + Network Extension for DNS

export const APP_BUNDLE_IDS: Record<BlockedApp, { android: string; ios: string; label: string; icon: string; color: string }> = {
  instagram: { android: "com.instagram.android", ios: "com.burbn.instagram", label: "Instagram", icon: "📸", color: "#E1306C" },
  tiktok: { android: "com.zhiliaoapp.musically", ios: "com.zhiliaoapp.musically", label: "TikTok", icon: "🎵", color: "#010101" },
  twitter: { android: "com.twitter.android", ios: "com.atebits.Tweetie2", label: "X (Twitter)", icon: "🐦", color: "#1DA1F2" },
  reddit: { android: "com.reddit.frontpage", ios: "com.reddit.Reddit", label: "Reddit", icon: "🤖", color: "#FF4500" },
  youtube: { android: "com.google.android.youtube", ios: "com.google.ios.youtube", label: "YouTube", icon: "▶️", color: "#FF0000" },
  facebook: { android: "com.facebook.katana", ios: "com.facebook.Facebook", label: "Facebook", icon: "👍", color: "#1877F2" },
  snapchat: { android: "com.snapchat.android", ios: "com.toyopagroup.picaboo", label: "Snapchat", icon: "👻", color: "#FFFC00" },
  discord: { android: "com.discord", ios: "com.hammerandchisel.discord", label: "Discord", icon: "🎮", color: "#5865F2" },
};

// DNS blocklist for adult content (common approach)
export const PORN_DNS_BLOCKLIST = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "redtube.com",
  "xhamster.com",
  "youporn.com",
  "tube8.com",
  "spankbang.com",
  "eporner.com",
  "xtube.com",
];

export interface BlockAttempt {
  app: BlockedApp | "porn";
  timestamp: string;
  wasBlocked: boolean;
  frictionPassed?: boolean;
}

let blockAttemptLog: BlockAttempt[] = [];

export function logBlockAttempt(attempt: BlockAttempt) {
  blockAttemptLog = [attempt, ...blockAttemptLog.slice(0, 99)];
}

export function getBlockAttemptLog(): BlockAttempt[] {
  return blockAttemptLog;
}

export function getAppInfo(app: BlockedApp) {
  return APP_BUNDLE_IDS[app];
}

export function getAllApps(): Array<{ key: BlockedApp } & typeof APP_BUNDLE_IDS[BlockedApp]> {
  return (Object.keys(APP_BUNDLE_IDS) as BlockedApp[]).map((key) => ({
    key,
    ...APP_BUNDLE_IDS[key],
  }));
}

/**
 * Request accessibility service permission on Android.
 * On iOS, this redirects to Screen Time settings.
 */
export async function requestBlockingPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Linking.openSettings();
    return true;
  } else if (Platform.OS === "ios") {
    Alert.alert(
      "Screen Time Required",
      "FreeFlow uses Screen Time to block apps. Please enable Screen Time and set FreeFlow as a Screen Time manager in Settings.",
      [
        { text: "Open Settings", onPress: () => Linking.openSettings() },
        { text: "Later", style: "cancel" },
      ]
    );
    return false;
  }
  return false;
}

/**
 * Calculate current streak of blocked days from attempt log
 */
export function calculateBlockingStreak(log: BlockAttempt[]): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayStr = day.toDateString();

    const dayAttempts = log.filter(
      (a) => new Date(a.timestamp).toDateString() === dayStr
    );

    // Day counts as "clean" if no successful bypasses
    const hadBypass = dayAttempts.some((a) => !a.wasBlocked);
    if (hadBypass) break;
    streak++;
  }

  return streak;
}

export function getWeeklyStats(log: BlockAttempt[]) {
  const stats: Array<{ day: string; blocked: number; bypassed: number }> = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayStr = day.toDateString();
    const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" });

    const dayAttempts = log.filter(
      (a) => new Date(a.timestamp).toDateString() === dayStr
    );
    stats.push({
      day: dayLabel,
      blocked: dayAttempts.filter((a) => a.wasBlocked).length,
      bypassed: dayAttempts.filter((a) => !a.wasBlocked).length,
    });
  }

  return stats;
}
