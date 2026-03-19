import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AddictionType = "social_media" | "porn" | "gaming" | "general";

export interface Streak {
  id: string;
  type: AddictionType;
  label: string;
  startDate: string; // ISO string
  currentDays: number;
  longestDays: number;
  totalRelapses: number;
  isActive: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  urgeIntensity: 1 | 2 | 3 | 4 | 5;
  note: string;
  triggers: string[];
  wins: string;
}

export interface Milestone {
  days: number;
  label: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface RecoveryState {
  streaks: Streak[];
  journalEntries: JournalEntry[];
  goals: string[];
  addictionTypes: AddictionType[];

  // Actions
  initStreaks: (types: AddictionType[]) => void;
  incrementStreak: (id: string) => void;
  logRelapse: (id: string, note: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  setGoals: (goals: string[]) => void;
  getMilestones: (streakId: string) => Milestone[];
  getTodayEntry: () => JournalEntry | undefined;
}

const MILESTONES: Array<{ days: number; label: string; description: string }> =
  [
    { days: 1, label: "First Step", description: "One full day clean. It begins." },
    { days: 3, label: "72 Hours", description: "72 hours — dopamine starts resetting." },
    { days: 7, label: "One Week", description: "Brain fog starts lifting. Energy returns." },
    { days: 14, label: "Two Weeks", description: "Sleep improving, mood stabilizing." },
    { days: 30, label: "One Month", description: "30 days — confidence surges." },
    { days: 60, label: "Two Months", description: "New neural pathways forming." },
    { days: 90, label: "90 Days", description: "The classic milestone. Real change." },
    { days: 180, label: "6 Months", description: "Half a year of freedom." },
    { days: 365, label: "One Year", description: "365 days. You are transformed." },
  ];

export const useRecoveryStore = create<RecoveryState>((set, get) => ({
  streaks: [],
  journalEntries: [],
  goals: [],
  addictionTypes: [],

  initStreaks: (types: AddictionType[]) => {
    const labelMap: Record<AddictionType, string> = {
      social_media: "Social Media",
      porn: "Porn",
      gaming: "Gaming",
      general: "Phone Addiction",
    };
    const now = new Date().toISOString();
    const streaks: Streak[] = types.map((type) => ({
      id: `streak_${type}`,
      type,
      label: labelMap[type],
      startDate: now,
      currentDays: 0,
      longestDays: 0,
      totalRelapses: 0,
      isActive: true,
    }));
    set({ streaks, addictionTypes: types });
  },

  incrementStreak: (id: string) => {
    set((state) => ({
      streaks: state.streaks.map((s) =>
        s.id === id
          ? {
              ...s,
              currentDays: s.currentDays + 1,
              longestDays: Math.max(s.longestDays, s.currentDays + 1),
            }
          : s
      ),
    }));
  },

  logRelapse: (id: string, note: string) => {
    set((state) => ({
      streaks: state.streaks.map((s) =>
        s.id === id
          ? {
              ...s,
              currentDays: 0,
              totalRelapses: s.totalRelapses + 1,
              startDate: new Date().toISOString(),
            }
          : s
      ),
    }));
  },

  addJournalEntry: (entry: Omit<JournalEntry, "id">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `journal_${Date.now()}`,
    };
    set((state) => ({
      journalEntries: [newEntry, ...state.journalEntries],
    }));
  },

  setGoals: (goals: string[]) => set({ goals }),

  getMilestones: (streakId: string): Milestone[] => {
    const streak = get().streaks.find((s) => s.id === streakId);
    if (!streak) return [];
    return MILESTONES.map((m) => ({
      ...m,
      unlocked: streak.currentDays >= m.days,
      unlockedAt:
        streak.currentDays >= m.days
          ? new Date(
              new Date(streak.startDate).getTime() +
                m.days * 24 * 60 * 60 * 1000
            ).toISOString()
          : undefined,
    }));
  },

  getTodayEntry: (): JournalEntry | undefined => {
    const today = new Date().toDateString();
    return get().journalEntries.find(
      (e) => new Date(e.date).toDateString() === today
    );
  },
}));
