import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useRecoveryStore, JournalEntry } from "../../src/store/recoveryStore";
import { useUserStore } from "../../src/store/userStore";
import { StreakCard } from "../../src/components/recovery/StreakCard";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";

const MILESTONES_INFO = [
  { days: 1, emoji: "🌱", label: "First Step" },
  { days: 3, emoji: "🌿", label: "72 Hours" },
  { days: 7, emoji: "🌳", label: "One Week" },
  { days: 14, emoji: "⚡", label: "Two Weeks" },
  { days: 30, emoji: "🌕", label: "One Month" },
  { days: 60, emoji: "💪", label: "Two Months" },
  { days: 90, emoji: "🏆", label: "90 Days" },
  { days: 180, emoji: "🦅", label: "6 Months" },
  { days: 365, emoji: "👑", label: "One Year" },
];

type Tab = "streaks" | "journal" | "milestones";

export default function Recovery() {
  const { streaks, journalEntries, addJournalEntry, getMilestones, getTodayEntry } = useRecoveryStore();
  const { addXP, unlockBadge } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>("streaks");
  const [relapseModalId, setRelapseModalId] = useState<string | null>(null);
  const [relapseNote, setRelapseNote] = useState("");
  const [journalModal, setJournalModal] = useState(false);
  const [journalMood, setJournalMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [journalUrge, setJournalUrge] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [journalNote, setJournalNote] = useState("");
  const [journalWins, setJournalWins] = useState("");

  const { logRelapse } = useRecoveryStore();
  const todayEntry = getTodayEntry();

  function handleRelapse(id: string) {
    if (!relapseNote.trim()) return;
    logRelapse(id, relapseNote);
    setRelapseModalId(null);
    setRelapseNote("");
    Alert.alert(
      "Relapse logged 💙",
      "Remember: every relapse is data, not failure. You start again stronger. Your streak resets, but your progress doesn't.",
      [{ text: "Start again" }]
    );
  }

  function handleSaveJournal() {
    addJournalEntry({
      date: new Date().toISOString(),
      mood: journalMood,
      urgeIntensity: journalUrge,
      note: journalNote,
      triggers: [],
      wins: journalWins,
    });
    addXP(50);
    setJournalModal(false);
    setJournalNote("");
    setJournalWins("");
    setJournalMood(3);
    setJournalUrge(1);
  }

  const moodEmojis = ["", "😔", "😕", "😐", "🙂", "😄"];
  const urgeEmojis = ["", "😌", "😤", "😰", "😱", "🔥"];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ color: "#f1f5f9", fontSize: 26, fontWeight: "800" }}>🔥 Recovery</Text>
        <Text style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
          Track your progress day by day
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", padding: 16, gap: 8 }}>
        {(["streaks", "journal", "milestones"] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: activeTab === tab ? "#6366f1" : "#1e293b",
              alignItems: "center",
            }}
          >
            <Text style={{ color: activeTab === tab ? "#fff" : "#64748b", fontSize: 13, fontWeight: "600", textTransform: "capitalize" }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* STREAKS TAB */}
        {activeTab === "streaks" && (
          <View>
            {streaks.length === 0 ? (
              <Card style={{ alignItems: "center", padding: 40 }}>
                <Text style={{ fontSize: 48 }}>🌱</Text>
                <Text style={{ color: "#f1f5f9", fontSize: 18, fontWeight: "700", marginTop: 16 }}>
                  No streaks yet
                </Text>
                <Text style={{ color: "#64748b", textAlign: "center", marginTop: 8 }}>
                  Complete onboarding to set up your recovery tracking
                </Text>
              </Card>
            ) : (
              streaks.map((streak) => (
                <StreakCard
                  key={streak.id}
                  streak={streak}
                  onLogRelapse={() => setRelapseModalId(streak.id)}
                />
              ))
            )}

            {/* Emergency mode */}
            <TouchableOpacity
              onPress={() => router.push("/urge")}
              style={{
                backgroundColor: "#7c3aed22",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#7c3aed55",
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 24 }}>🆘</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#c084fc", fontSize: 15, fontWeight: "700" }}>
                  Emergency Urge Help
                </Text>
                <Text style={{ color: "#7c3aed", fontSize: 12 }}>
                  Immediate support & distraction
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* JOURNAL TAB */}
        {activeTab === "journal" && (
          <View>
            {!todayEntry ? (
              <TouchableOpacity
                onPress={() => setJournalModal(true)}
                style={{
                  backgroundColor: "#1a1f3a",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "#6366f133",
                  borderStyle: "dashed",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 32 }}>✍️</Text>
                <Text style={{ color: "#a5b4fc", fontSize: 16, fontWeight: "700", marginTop: 8 }}>
                  Log today's check-in
                </Text>
                <Text style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                  Track your mood, urges, and wins
                </Text>
              </TouchableOpacity>
            ) : (
              <Card style={{ marginBottom: 16, borderColor: "#22c55e33", borderWidth: 1 }}>
                <Text style={{ color: "#22c55e", fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
                  ✅ Today's check-in logged
                </Text>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                    Mood: {moodEmojis[todayEntry.mood]}
                  </Text>
                  <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                    Urge: {urgeEmojis[todayEntry.urgeIntensity]}
                  </Text>
                </View>
                {todayEntry.wins && (
                  <Text style={{ color: "#cbd5e1", fontSize: 13, marginTop: 8 }}>
                    🏆 {todayEntry.wins}
                  </Text>
                )}
              </Card>
            )}

            {journalEntries.length === 0 ? (
              <Card style={{ alignItems: "center", padding: 32 }}>
                <Text style={{ color: "#64748b", textAlign: "center" }}>
                  No journal entries yet. Start logging daily check-ins to see your patterns.
                </Text>
              </Card>
            ) : (
              journalEntries.map((entry) => (
                <Card key={entry.id} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <Text style={{ fontSize: 16 }}>{moodEmojis[entry.mood]}</Text>
                      <Text style={{ fontSize: 16 }}>{urgeEmojis[entry.urgeIntensity]}</Text>
                    </View>
                  </View>
                  {entry.note ? (
                    <Text style={{ color: "#cbd5e1", fontSize: 13, marginBottom: 4 }}>{entry.note}</Text>
                  ) : null}
                  {entry.wins ? (
                    <Text style={{ color: "#22c55e", fontSize: 13 }}>🏆 {entry.wins}</Text>
                  ) : null}
                </Card>
              ))
            )}
          </View>
        )}

        {/* MILESTONES TAB */}
        {activeTab === "milestones" && (
          <View>
            {streaks.map((streak) => {
              const milestones = getMilestones(streak.id);
              return (
                <View key={streak.id} style={{ marginBottom: 24 }}>
                  <Text style={{ color: "#f1f5f9", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
                    {streak.label} — Day {streak.currentDays}
                  </Text>
                  {milestones.map((m, i) => (
                    <View
                      key={m.days}
                      style={{
                        flexDirection: "row",
                        gap: 14,
                        marginBottom: 10,
                        alignItems: "center",
                        opacity: m.unlocked ? 1 : 0.4,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: m.unlocked ? "#312e81" : "#1e293b",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 2,
                          borderColor: m.unlocked ? "#6366f1" : "#334155",
                        }}
                      >
                        <Text style={{ fontSize: 18 }}>{MILESTONES_INFO[i]?.emoji ?? "⭐"}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: m.unlocked ? "#f1f5f9" : "#64748b", fontSize: 14, fontWeight: "600" }}>
                          {m.label} ({m.days} days)
                        </Text>
                        <Text style={{ color: "#64748b", fontSize: 12 }}>{m.description}</Text>
                      </View>
                      {m.unlocked && <Text style={{ color: "#6366f1" }}>✓</Text>}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Relapse modal */}
      <Modal visible={!!relapseModalId} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#1e293b", borderRadius: 24, padding: 24, gap: 16 }}>
            <Text style={{ color: "#f1f5f9", fontSize: 20, fontWeight: "800" }}>
              Log a relapse 💙
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 14, lineHeight: 20 }}>
              This takes courage. Relapses are part of recovery — they're not the end of your journey.
            </Text>
            <TextInput
              value={relapseNote}
              onChangeText={setRelapseNote}
              placeholder="What happened? What will you do differently? (required)"
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                padding: 14,
                color: "#f1f5f9",
                fontSize: 14,
                minHeight: 100,
                textAlignVertical: "top",
              }}
            />
            <Button
              label="Log Relapse & Start Again"
              variant="danger"
              onPress={() => relapseModalId && handleRelapse(relapseModalId)}
              disabled={!relapseNote.trim()}
            />
            <Button
              label="Cancel"
              variant="ghost"
              onPress={() => {
                setRelapseModalId(null);
                setRelapseNote("");
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Journal modal */}
      <Modal visible={journalModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <ScrollView>
            <View style={{ backgroundColor: "#1e293b", borderRadius: 24, padding: 24, gap: 16, marginTop: 60 }}>
              <Text style={{ color: "#f1f5f9", fontSize: 20, fontWeight: "800" }}>Daily Check-in ✍️</Text>

              {/* Mood */}
              <View>
                <Text style={{ color: "#94a3b8", fontSize: 14, marginBottom: 10 }}>How are you feeling?</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {([1, 2, 3, 4, 5] as const).map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setJournalMood(m)}
                      style={{
                        flex: 1,
                        backgroundColor: journalMood === m ? "#312e81" : "#0f172a",
                        borderRadius: 12,
                        padding: 10,
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: journalMood === m ? "#6366f1" : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{moodEmojis[m]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Urge intensity */}
              <View>
                <Text style={{ color: "#94a3b8", fontSize: 14, marginBottom: 10 }}>Urge intensity today?</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {([1, 2, 3, 4, 5] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setJournalUrge(u)}
                      style={{
                        flex: 1,
                        backgroundColor: journalUrge === u ? "#2d1b4e" : "#0f172a",
                        borderRadius: 12,
                        padding: 10,
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: journalUrge === u ? "#7c3aed" : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{urgeEmojis[u]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Note */}
              <TextInput
                value={journalNote}
                onChangeText={setJournalNote}
                placeholder="How was your day? Any triggers? (optional)"
                placeholderTextColor="#475569"
                multiline
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: 12,
                  padding: 14,
                  color: "#f1f5f9",
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
              />

              {/* Wins */}
              <TextInput
                value={journalWins}
                onChangeText={setJournalWins}
                placeholder="What did you do well today? 🏆"
                placeholderTextColor="#475569"
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: 12,
                  padding: 14,
                  color: "#f1f5f9",
                  fontSize: 14,
                }}
              />

              <Button label="Save Check-in (+50 XP)" onPress={handleSaveJournal} />
              <Button label="Cancel" variant="ghost" onPress={() => setJournalModal(false)} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
