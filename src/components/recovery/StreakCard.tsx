import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Streak } from "../../store/recoveryStore";

interface StreakCardProps {
  streak: Streak;
  onPress?: () => void;
  onLogRelapse?: () => void;
}

const TYPE_COLORS: Record<string, { bg: string; accent: string; emoji: string }> = {
  social_media: { bg: "#1e3a5f", accent: "#60a5fa", emoji: "📱" },
  porn: { bg: "#3b1f3b", accent: "#c084fc", emoji: "🔒" },
  gaming: { bg: "#1f3b2b", accent: "#4ade80", emoji: "🎮" },
  general: { bg: "#2d2015", accent: "#fb923c", emoji: "🧠" },
};

function formatDuration(days: number): string {
  if (days < 1) return "Day 0";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w ${days % 7}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo ${days % 30}d`;
  return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}mo`;
}

function getMotivationalLine(days: number): string {
  if (days === 0) return "Every journey starts with day 1.";
  if (days < 3) return "The hardest part is starting. You did it.";
  if (days < 7) return "Your brain is already rewiring. Keep going.";
  if (days < 14) return "One week strong. You're building new pathways.";
  if (days < 30) return "Two weeks! Your focus is sharpening.";
  if (days < 60) return "One month clean. Real change is happening.";
  if (days < 90) return "Two months! You're not the same person.";
  if (days < 365) return "90 days+ — you've reclaimed your mind.";
  return "One year. You are an inspiration.";
}

export function StreakCard({ streak, onPress, onLogRelapse }: StreakCardProps) {
  const colors = TYPE_COLORS[streak.type] ?? TYPE_COLORS.general;
  const nextMilestone = [1, 3, 7, 14, 30, 60, 90, 180, 365].find(
    (m) => m > streak.currentDays
  );
  const progressToNext = nextMilestone
    ? (streak.currentDays / nextMilestone) * 100
    : 100;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: colors.bg,
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.accent + "33",
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 28 }}>{colors.emoji}</Text>
          <View>
            <Text style={{ color: "#f1f5f9", fontSize: 16, fontWeight: "700" }}>
              {streak.label}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 12 }}>
              {streak.totalRelapses > 0 ? `${streak.totalRelapses} relapses logged` : "Clean slate"}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colors.accent, fontSize: 36, fontWeight: "800" }}>
            {streak.currentDays}
          </Text>
          <Text style={{ color: "#94a3b8", fontSize: 12 }}>days</Text>
        </View>
      </View>

      {/* Motivational line */}
      <Text style={{ color: "#cbd5e1", fontSize: 13, marginBottom: 14, fontStyle: "italic" }}>
        "{getMotivationalLine(streak.currentDays)}"
      </Text>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: "#94a3b8", fontSize: 11 }}>
              Next milestone: {nextMilestone} days
            </Text>
            <Text style={{ color: colors.accent, fontSize: 11 }}>
              {nextMilestone - streak.currentDays} days to go
            </Text>
          </View>
          <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
            <View
              style={{
                height: 4,
                width: `${progressToNext}%`,
                backgroundColor: colors.accent,
                borderRadius: 2,
              }}
            />
          </View>
        </View>
      )}

      {/* Best streak */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: "#64748b", fontSize: 12 }}>
          Best: {formatDuration(streak.longestDays)}
        </Text>
        {onLogRelapse && (
          <TouchableOpacity onPress={onLogRelapse}>
            <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "500" }}>
              Log relapse
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
