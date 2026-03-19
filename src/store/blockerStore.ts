import { create } from "zustand";

export type BlockedApp =
  | "instagram"
  | "tiktok"
  | "twitter"
  | "reddit"
  | "youtube"
  | "facebook"
  | "snapchat"
  | "discord";

export interface BlockSchedule {
  id: string;
  label: string;
  startHour: number; // 0-23
  endHour: number;
  days: number[]; // 0=Sun, 6=Sat
  isActive: boolean;
}

export interface BlockerState {
  blockedApps: BlockedApp[];
  schedules: BlockSchedule[];
  frictionModeEnabled: boolean;
  frictionDelaySeconds: number;
  strictModeEnabled: boolean;
  pornBlockingEnabled: boolean;
  emergencyLockActive: boolean;
  emergencyLockUntil: string | null;
  focusSessionActive: boolean;
  focusSessionBlockedApps: BlockedApp[];

  // Actions
  toggleApp: (app: BlockedApp) => void;
  addSchedule: (schedule: Omit<BlockSchedule, "id">) => void;
  removeSchedule: (id: string) => void;
  toggleSchedule: (id: string) => void;
  setFrictionMode: (enabled: boolean, delaySecs?: number) => void;
  setStrictMode: (enabled: boolean) => void;
  setPornBlocking: (enabled: boolean) => void;
  activateEmergencyLock: (hours?: number) => void;
  deactivateEmergencyLock: () => void;
  setFocusSession: (active: boolean, apps?: BlockedApp[]) => void;
  isCurrentlyBlocked: (app: BlockedApp) => boolean;
}

const DEFAULT_BLOCKED_APPS: BlockedApp[] = [
  "instagram",
  "tiktok",
  "twitter",
  "reddit",
];

export const useBlockerStore = create<BlockerState>((set, get) => ({
  blockedApps: DEFAULT_BLOCKED_APPS,
  schedules: [
    {
      id: "default_night",
      label: "Night Mode",
      startHour: 22,
      endHour: 7,
      days: [0, 1, 2, 3, 4, 5, 6],
      isActive: true,
    },
    {
      id: "default_work",
      label: "Work Hours",
      startHour: 9,
      endHour: 17,
      days: [1, 2, 3, 4, 5],
      isActive: false,
    },
  ],
  frictionModeEnabled: true,
  frictionDelaySeconds: 10,
  strictModeEnabled: false,
  pornBlockingEnabled: false,
  emergencyLockActive: false,
  emergencyLockUntil: null,
  focusSessionActive: false,
  focusSessionBlockedApps: [],

  toggleApp: (app: BlockedApp) => {
    set((state) => ({
      blockedApps: state.blockedApps.includes(app)
        ? state.blockedApps.filter((a) => a !== app)
        : [...state.blockedApps, app],
    }));
  },

  addSchedule: (schedule: Omit<BlockSchedule, "id">) => {
    const newSchedule: BlockSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
    };
    set((state) => ({ schedules: [...state.schedules, newSchedule] }));
  },

  removeSchedule: (id: string) => {
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    }));
  },

  toggleSchedule: (id: string) => {
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      ),
    }));
  },

  setFrictionMode: (enabled: boolean, delaySecs = 10) => {
    set({ frictionModeEnabled: enabled, frictionDelaySeconds: delaySecs });
  },

  setStrictMode: (enabled: boolean) => {
    set({ strictModeEnabled: enabled });
  },

  setPornBlocking: (enabled: boolean) => {
    set({ pornBlockingEnabled: enabled });
  },

  activateEmergencyLock: (hours = 24) => {
    const until = new Date(
      Date.now() + hours * 60 * 60 * 1000
    ).toISOString();
    set({ emergencyLockActive: true, emergencyLockUntil: until });
  },

  deactivateEmergencyLock: () => {
    set({ emergencyLockActive: false, emergencyLockUntil: null });
  },

  setFocusSession: (active: boolean, apps?: BlockedApp[]) => {
    set({
      focusSessionActive: active,
      focusSessionBlockedApps: apps ?? get().blockedApps,
    });
  },

  isCurrentlyBlocked: (app: BlockedApp): boolean => {
    const state = get();
    if (state.focusSessionActive && state.focusSessionBlockedApps.includes(app))
      return true;
    if (state.emergencyLockActive) return true;
    if (!state.blockedApps.includes(app)) return false;

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    return state.schedules.some((s) => {
      if (!s.isActive) return false;
      if (!s.days.includes(day)) return false;
      if (s.startHour <= s.endHour) {
        return hour >= s.startHour && hour < s.endHour;
      }
      // Wraps midnight
      return hour >= s.startHour || hour < s.endHour;
    });
  },
}));
