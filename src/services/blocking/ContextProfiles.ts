/**
 * Context-Aware Blocking Profiles
 *
 * Research insight (Claude PDF):
 * "Users need different rules for 'deep coding' (block everything except documentation),
 * 'admin tasks' (allow email and Slack), 'evening relaxation', and 'weekend' (more permissive).
 * Most apps force a single blocking configuration."
 *
 * This is a significant technical differentiator.
 */
import { BlockedApp } from "../../store/blockerStore";

export type ProfileType =
  | "deep_work"
  | "admin"
  | "creative"
  | "evening"
  | "weekend"
  | "recovery"
  | "custom";

export interface BlockingProfile {
  id: string;
  type: ProfileType;
  label: string;
  emoji: string;
  description: string;
  blockedApps: BlockedApp[];
  allowedApps: BlockedApp[]; // allowlist-first: only these are allowed
  blockEverythingExcept: boolean; // true = allowlist mode, false = blocklist mode
  autoActivateHours?: Array<{ start: number; end: number; days: number[] }>;
  frictionEnabled: boolean;
  frictionDelay: number;
}

export const DEFAULT_PROFILES: BlockingProfile[] = [
  {
    id: "profile_deep_work",
    type: "deep_work",
    label: "Deep Work",
    emoji: "🎯",
    description: "Block all distractions. Only productivity apps allowed.",
    blockedApps: [
      "instagram",
      "tiktok",
      "twitter",
      "reddit",
      "youtube",
      "facebook",
      "snapchat",
      "discord",
    ],
    allowedApps: [],
    blockEverythingExcept: true, // Allowlist-first: define productive apps, block everything else
    autoActivateHours: [
      { start: 9, end: 12, days: [1, 2, 3, 4, 5] }, // Mon-Fri morning
    ],
    frictionEnabled: false, // No second chances in deep work
    frictionDelay: 0,
  },
  {
    id: "profile_admin",
    type: "admin",
    label: "Admin Mode",
    emoji: "📧",
    description: "Email & messaging allowed. Social media blocked.",
    blockedApps: ["instagram", "tiktok", "twitter", "reddit", "youtube", "facebook", "snapchat"],
    allowedApps: ["discord"],
    blockEverythingExcept: false,
    frictionEnabled: true,
    frictionDelay: 10,
  },
  {
    id: "profile_creative",
    type: "creative",
    label: "Creative Flow",
    emoji: "🎨",
    description: "YouTube allowed for inspiration. Social feeds blocked.",
    blockedApps: ["instagram", "tiktok", "twitter", "reddit", "facebook", "snapchat"],
    allowedApps: ["youtube"],
    blockEverythingExcept: false,
    frictionEnabled: true,
    frictionDelay: 15,
  },
  {
    id: "profile_evening",
    type: "evening",
    label: "Evening Wind-down",
    emoji: "🌙",
    description: "Gentle limits. Block doom-scrolling, allow entertainment.",
    blockedApps: ["twitter", "reddit", "facebook"],
    allowedApps: ["youtube", "discord"],
    blockEverythingExcept: false,
    autoActivateHours: [
      { start: 20, end: 23, days: [0, 1, 2, 3, 4, 5, 6] },
    ],
    frictionEnabled: true,
    frictionDelay: 30, // 30s friction in evenings
  },
  {
    id: "profile_recovery",
    type: "recovery",
    label: "Recovery Mode",
    emoji: "🛡️",
    description: "Maximum protection. All social media and adult content blocked.",
    blockedApps: [
      "instagram",
      "tiktok",
      "twitter",
      "reddit",
      "youtube",
      "facebook",
      "snapchat",
      "discord",
    ],
    allowedApps: [],
    blockEverythingExcept: true,
    frictionEnabled: false,
    frictionDelay: 0,
  },
];

/**
 * Check if a profile should auto-activate based on current time
 */
export function shouldProfileAutoActivate(profile: BlockingProfile): boolean {
  if (!profile.autoActivateHours) return false;

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  return profile.autoActivateHours.some(({ start, end, days }) => {
    if (!days.includes(day)) return false;
    if (start <= end) return hour >= start && hour < end;
    return hour >= start || hour < end; // wraps midnight
  });
}

/**
 * Get profile recommendation based on time of day and day of week
 */
export function getRecommendedProfile(
  profiles: BlockingProfile[]
): BlockingProfile | null {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;

  if (!isWeekend && hour >= 9 && hour < 12) {
    return profiles.find((p) => p.type === "deep_work") ?? null;
  }
  if (!isWeekend && hour >= 13 && hour < 17) {
    return profiles.find((p) => p.type === "admin") ?? null;
  }
  if (hour >= 20 || hour < 7) {
    return profiles.find((p) => p.type === "evening") ?? null;
  }
  return null;
}
