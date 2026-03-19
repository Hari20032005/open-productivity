/**
 * Done List Component
 *
 * Research insight (Claude PDF):
 * "Provide a 'done list' alongside the to-do list — each completed task triggers
 * a micro-dopamine reward, directly competing with the cheap dopamine of social media."
 *
 * "Every productive behavior should trigger a reward signal that directly competes
 * with social media's variable-ratio reinforcement." (Five Strategic Imperatives)
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useProductivityStore } from "../../store/productivityStore";

interface DoneListProps {
  onCelebrate?: () => void;
}

const CELEBRATION_MESSAGES = [
  "You crushed it! 💪",
  "Done and dusted! ✅",
  "That's real progress! 🚀",
  "Check! Brain fired some healthy dopamine! 🧠",
  "One step closer to your goals! 🎯",
  "This is what momentum feels like! ⚡",
];

export function DoneList({ onCelebrate }: DoneListProps) {
  const { tasks, pomodorosCompletedToday, habits, isHabitCompletedToday } =
    useProductivityStore();

  const today = new Date().toDateString();
  const completedToday = tasks.filter(
    (t) =>
      t.status === "completed" &&
      t.completedAt &&
      new Date(t.completedAt).toDateString() === today
  );

  const habitsToday = habits.filter((h) => isHabitCompletedToday(h.id));
  const totalWins = completedToday.length + habitsToday.length + pomodorosCompletedToday;

  const randomMessage =
    CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];

  if (totalWins === 0) return null;

  return (
    <View
      style={{
        backgroundColor: "#14532d",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#22c55e33",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={{ color: "#22c55e", fontSize: 16, fontWeight: "800" }}>
            ✅ Done List
          </Text>
          <Text style={{ color: "#16a34a", fontSize: 12 }}>
            {totalWins} wins today · {randomMessage}
          </Text>
        </View>
        <Text style={{ color: "#22c55e", fontSize: 28, fontWeight: "800" }}>
          {totalWins}
        </Text>
      </View>

      <View style={{ gap: 6 }}>
        {completedToday.slice(0, 5).map((task) => (
          <View
            key={task.id}
            style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#22c55e", fontSize: 12 }}>✓</Text>
            <Text style={{ color: "#a7f3d0", fontSize: 13, flex: 1 }} numberOfLines={1}>
              {task.title}
            </Text>
          </View>
        ))}

        {habitsToday.slice(0, 3).map((habit) => (
          <View
            key={habit.id}
            style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
          >
            <Text style={{ fontSize: 12 }}>{habit.icon}</Text>
            <Text style={{ color: "#a7f3d0", fontSize: 13, flex: 1 }} numberOfLines={1}>
              {habit.title}
            </Text>
          </View>
        ))}

        {pomodorosCompletedToday > 0 && (
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Text style={{ fontSize: 12 }}>🍅</Text>
            <Text style={{ color: "#a7f3d0", fontSize: 13 }}>
              {pomodorosCompletedToday} focus session
              {pomodorosCompletedToday !== 1 ? "s" : ""} completed
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
