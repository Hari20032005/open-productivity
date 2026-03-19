import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useUserStore } from "../../src/store/userStore";
import { useRecoveryStore } from "../../src/store/recoveryStore";
import { useProductivityStore } from "../../src/store/productivityStore";
import { useBlockerStore } from "../../src/store/blockerStore";
import { Card } from "../../src/components/ui/Card";
import { getDailyCheckIn } from "../../src/services/ai/RecoveryCoach";

export default function Dashboard() {
  const { profile } = useUserStore();
  const { streaks } = useRecoveryStore();
  const { getTopPriorityTasks, pomodorosCompletedToday, habits, isHabitCompletedToday } = useProductivityStore();
  const { blockedApps, pornBlockingEnabled } = useBlockerStore();
  const [coachMessage, setCoachMessage] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const topTasks = getTopPriorityTasks(3);
  const todayHabits = habits.slice(0, 4);
  const habitsCompletedToday = habits.filter((h) => isHabitCompletedToday(h.id)).length;
  const bestStreak = streaks.reduce((max, s) => Math.max(max, s.currentDays), 0);

  async function loadCheckIn() {
    if (!profile || streaks.length === 0) return;
    try {
      const msg = await getDailyCheckIn({
        userName: profile.name,
        addictionTypes: streaks.map((s) => s.label),
        currentStreaks: streaks.map((s) => ({ label: s.label, days: s.currentDays })),
        motivationReasons: [],
      });
      setCoachMessage(msg);
    } catch {
      setCoachMessage(`Good ${getTimeOfDay()}, ${profile?.name}! How are you feeling today? 💙`);
    }
  }

  function getTimeOfDay() {
    const h = new Date().getHours();
    return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  }

  useEffect(() => {
    loadCheckIn();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadCheckIn();
    setRefreshing(false);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <View>
            <Text style={{ color: "#64748b", fontSize: 14 }}>{greeting}</Text>
            <Text style={{ color: "#f1f5f9", fontSize: 24, fontWeight: "800" }}>
              {profile?.name ?? "Friend"} {profile?.avatar}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/coach")}
            style={{
              backgroundColor: "#6366f1",
              borderRadius: 40,
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14 }}>🤖</Text>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>AI Coach</Text>
          </TouchableOpacity>
        </View>

        {/* XP / Level bar */}
        {profile && (
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: "#a5b4fc", fontWeight: "700" }}>Level {profile.level}</Text>
              <Text style={{ color: "#64748b", fontSize: 12 }}>
                {profile.xp} / {profile.xpToNextLevel} XP
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: "#1e293b", borderRadius: 3 }}>
              <View
                style={{
                  height: 6,
                  width: `${(profile.xp / profile.xpToNextLevel) * 100}%`,
                  backgroundColor: "#6366f1",
                  borderRadius: 3,
                }}
              />
            </View>
          </Card>
        )}

        {/* AI Coach message */}
        {coachMessage ? (
          <TouchableOpacity
            onPress={() => router.push("/coach")}
            style={{
              backgroundColor: "#1a1f3a",
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#6366f133",
              flexDirection: "row",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 28 }}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#a5b4fc", fontSize: 12, fontWeight: "600", marginBottom: 4 }}>
                AI Coach
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 20 }} numberOfLines={3}>
                {coachMessage}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#f59e0b", fontSize: 28, fontWeight: "800" }}>{bestStreak}</Text>
            <Text style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Best streak</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#22c55e", fontSize: 28, fontWeight: "800" }}>🍅 {pomodorosCompletedToday}</Text>
            <Text style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Pomodoros today</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "#a855f7", fontSize: 28, fontWeight: "800" }}>{habitsCompletedToday}/{habits.length}</Text>
            <Text style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Habits done</Text>
          </Card>
        </View>

        {/* Streaks */}
        {streaks.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#f1f5f9", fontSize: 18, fontWeight: "700" }}>🔥 Streaks</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/recovery")}>
                <Text style={{ color: "#6366f1", fontSize: 13 }}>View all →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {streaks.map((streak) => (
                  <View
                    key={streak.id}
                    style={{
                      backgroundColor: "#1e293b",
                      borderRadius: 16,
                      padding: 16,
                      width: 130,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: streak.currentDays > 0 ? "#6366f133" : "#334155",
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>
                      {streak.type === "social_media" ? "📱" : streak.type === "porn" ? "🔒" : streak.type === "gaming" ? "🎮" : "🧠"}
                    </Text>
                    <Text style={{ color: "#f59e0b", fontSize: 28, fontWeight: "800" }}>
                      {streak.currentDays}
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 11 }}>days</Text>
                    <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4, textAlign: "center" }}>
                      {streak.label}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Today's top tasks */}
        {topTasks.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#f1f5f9", fontSize: 18, fontWeight: "700" }}>⚡ Top Tasks</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/productivity")}>
                <Text style={{ color: "#6366f1", fontSize: 13 }}>Manage →</Text>
              </TouchableOpacity>
            </View>
            {topTasks.map((task) => (
              <View
                key={task.id}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: task.priority === "urgent" ? "#ef4444" : task.priority === "high" ? "#f59e0b" : "#6366f1",
                    flexShrink: 0,
                  }}
                />
                <Text style={{ color: "#e2e8f0", fontSize: 14, flex: 1 }}>{task.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Today's habits */}
        {todayHabits.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#f1f5f9", fontSize: 18, fontWeight: "700" }}>🌿 Habits</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/productivity")}>
                <Text style={{ color: "#6366f1", fontSize: 13 }}>View all →</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {todayHabits.map((habit) => {
                const done = isHabitCompletedToday(habit.id);
                return (
                  <View
                    key={habit.id}
                    style={{
                      backgroundColor: done ? "#14532d" : "#1e293b",
                      borderRadius: 12,
                      padding: 14,
                      width: "47%",
                      borderWidth: 1,
                      borderColor: done ? "#22c55e33" : "#334155",
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{habit.icon}</Text>
                    <Text style={{ color: done ? "#22c55e" : "#e2e8f0", fontSize: 13, fontWeight: "600", marginTop: 4 }}>
                      {habit.title}
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>
                      🔥 {habit.streak} day streak
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Emergency urge button */}
        <TouchableOpacity
          onPress={() => router.push("/urge")}
          style={{
            backgroundColor: "#7c3aed22",
            borderRadius: 16,
            padding: 18,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#7c3aed55",
            flexDirection: "row",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 24 }}>🆘</Text>
          <View>
            <Text style={{ color: "#c084fc", fontSize: 15, fontWeight: "700" }}>
              Feeling an urge?
            </Text>
            <Text style={{ color: "#7c3aed", fontSize: 12 }}>Tap for immediate help</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
