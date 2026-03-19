import { create } from "zustand";
import { AddictionType } from "./recoveryStore";

export interface UserProfile {
  name: string;
  avatar: string; // emoji or url
  level: number;
  xp: number;
  xpToNextLevel: number;
  joinedAt: string;
  badges: string[];
}

interface UserState {
  profile: UserProfile | null;
  onboardingComplete: boolean;
  selectedAddictions: AddictionType[];
  motivationReasons: string[];
  accountabilityPartner: string | null;

  // Actions
  completeOnboarding: (
    name: string,
    addictions: AddictionType[],
    reasons: string[]
  ) => void;
  addXP: (amount: number) => void;
  unlockBadge: (badge: string) => void;
  setPartner: (partnerEmail: string | null) => void;
}

const XP_PER_LEVEL = 500;

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  onboardingComplete: false,
  selectedAddictions: [],
  motivationReasons: [],
  accountabilityPartner: null,

  completeOnboarding: (name, addictions, reasons) => {
    const profile: UserProfile = {
      name,
      avatar: "🌱",
      level: 1,
      xp: 0,
      xpToNextLevel: XP_PER_LEVEL,
      joinedAt: new Date().toISOString(),
      badges: [],
    };
    set({
      profile,
      onboardingComplete: true,
      selectedAddictions: addictions,
      motivationReasons: reasons,
    });
  },

  addXP: (amount) => {
    set((state) => {
      if (!state.profile) return state;
      let newXP = state.profile.xp + amount;
      let level = state.profile.level;
      let xpToNext = state.profile.xpToNextLevel;

      while (newXP >= xpToNext) {
        newXP -= xpToNext;
        level += 1;
        xpToNext = XP_PER_LEVEL * level;
      }

      return {
        profile: { ...state.profile, xp: newXP, level, xpToNextLevel: xpToNext },
      };
    });
  },

  unlockBadge: (badge) => {
    set((state) => {
      if (!state.profile) return state;
      if (state.profile.badges.includes(badge)) return state;
      return {
        profile: {
          ...state.profile,
          badges: [...state.profile.badges, badge],
        },
      };
    });
  },

  setPartner: (partnerEmail) => {
    set({ accountabilityPartner: partnerEmail });
  },
}));
