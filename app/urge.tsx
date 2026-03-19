/**
 * URGE SCREEN — Emergency support modal
 *
 * Based on research:
 * - HALT framework (Hungry, Angry, Lonely, Tired) — Gemini PDF
 * - Urge surfing: urges peak and subside within 30 minutes — Claude PDF
 * - ACT-based acceptance techniques — Claude PDF
 * - Replacement activity suggestions when blocking activates — Claude PDF
 * - One Sec-style breathing pause reduces opens by 57% — PNAS/Claude PDF
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useRecoveryStore } from "../src/store/recoveryStore";
import { useUserStore } from "../src/store/userStore";
import { useBlockerStore } from "../src/store/blockerStore";
import { getUrgeResponse } from "../src/services/ai/RecoveryCoach";

type HALTType = "hungry" | "angry" | "lonely" | "tired" | "bored" | "stressed";

const HALT_OPTIONS: Array<{
  key: HALTType;
  emoji: string;
  label: string;
  tip: string;
}> = [
  {
    key: "hungry",
    emoji: "🍎",
    label: "Hungry",
    tip: "Eat something. Low blood sugar triggers impulsive behavior. Your brain needs fuel.",
  },
  {
    key: "angry",
    emoji: "😤",
    label: "Angry",
    tip: "Name the anger. What happened? Write it down. Anger-scrolling or porn use won't fix what upset you.",
  },
  {
    key: "lonely",
    emoji: "💙",
    label: "Lonely",
    tip: "Call or text someone real. Even a 5-minute conversation resets your nervous system.",
  },
  {
    key: "tired",
    emoji: "😴",
    label: "Tired",
    tip: "You're more impulsive when fatigued. Take a 20-min nap or go to bed. The urge will pass.",
  },
  {
    key: "bored",
    emoji: "😐",
    label: "Bored",
    tip: "Boredom is discomfort your brain is trying to escape. Sit with it for 5 minutes — it will transform into creativity.",
  },
  {
    key: "stressed",
    emoji: "😰",
    label: "Stressed",
    tip: "Stress is the #1 trigger. Box breathing (4-4-4-4) activates your parasympathetic system in 2 minutes.",
  },
];

const IMMEDIATE_ACTIONS = [
  { emoji: "🏃", label: "Go for a walk", time: "5-10 min" },
  { emoji: "💪", label: "Do 20 push-ups", time: "2 min" },
  { emoji: "🚿", label: "Cold shower", time: "5 min" },
  { emoji: "📞", label: "Call a friend", time: "10 min" },
  { emoji: "📖", label: "Read 5 pages", time: "10 min" },
  { emoji: "🧘", label: "Box breathing", time: "3 min" },
  { emoji: "✍️", label: "Write what you feel", time: "5 min" },
  { emoji: "🎵", label: "Listen to music", time: "10 min" },
];

const BREATHING_PHASES = ["Inhale", "Hold", "Exhale", "Hold"];

export default function UrgeScreen() {
  const { streaks } = useRecoveryStore();
  const { profile } = useUserStore();
  const { activateEmergencyLock } = useBlockerStore();
  const [selectedHALT, setSelectedHALT] = useState<HALTType | null>(null);
  const [aiMessage, setAiMessage] = useState("");
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhaseIndex, setBreathingPhaseIndex] = useState(0);
  const [breathingCount, setBreathingCount] = useState(4);
  const [scale] = useState(new Animated.Value(1));

  useEffect(() => {
    loadAIResponse();
  }, []);

  async function loadAIResponse() {
    if (!profile || streaks.length === 0) return;
    try {
      const msg = await getUrgeResponse(
        {
          userName: profile.name,
          addictionTypes: streaks.map((s) => s.label),
          currentStreaks: streaks.map((s) => ({ label: s.label, days: s.currentDays })),
          motivationReasons: [],
        },
        3
      );
      setAiMessage(msg);
    } catch {
      setAiMessage(
        "This urge is temporary. It will peak and fade within 30 minutes — every urge does. Your streak is worth more than this moment. Take one action right now: stand up and move your body."
      );
    }
  }

  function startBreathing() {
    setBreathingActive(true);
    setBreathingPhaseIndex(0);
    setBreathingCount(4);
    animateBreath(0, 4);
  }

  function animateBreath(phase: number, count: number) {
    if (count <= 0) {
      const nextPhase = (phase + 1) % 4;
      setBreathingPhaseIndex(nextPhase);
      animateBreath(nextPhase, 4);
    } else {
      setTimeout(() => {
        setBreathingCount((c) => c - 1);
        if (count - 1 <= 0) {
          const nextPhase = (phase + 1) % 4;
          setBreathingPhaseIndex(nextPhase);
          if (nextPhase === 0 && phase === 3) {
            // Full cycle complete
            setBreathingActive(false);
          } else {
            animateBreath(nextPhase, 4);
          }
        } else {
          animateBreath(phase, count - 1);
        }
      }, 1000);
    }
  }

  function handleEmergencyLock() {
    activateEmergencyLock(24);
    router.back();
  }

  const haltSelected = selectedHALT
    ? HALT_OPTIONS.find((h) => h.key === selectedHALT)
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          paddingBottom: 8,
        }}
      >
        <View>
          <Text style={{ color: "#c084fc", fontSize: 22, fontWeight: "800" }}>
            🆘 Urge Support
          </Text>
          <Text style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
            This feeling will pass. You've got this.
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#475569", fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Science reminder */}
        <View
          style={{
            backgroundColor: "#1a1f3a",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#6366f133",
          }}
        >
          <Text style={{ color: "#a5b4fc", fontSize: 13, fontWeight: "700", marginBottom: 6 }}>
            🧠 What's happening in your brain
          </Text>
          <Text style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 20 }}>
            Your dopamine system is seeking a shortcut. This urge will{" "}
            <Text style={{ color: "#f59e0b", fontWeight: "700" }}>peak and fade within 30 minutes</Text>
            {" "}— every single time. You don't need to fight it. Just wait it out.
          </Text>
        </View>

        {/* AI message */}
        {aiMessage ? (
          <View
            style={{
              backgroundColor: "#1e293b",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 24 }}>🤖</Text>
            <Text style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 21, flex: 1 }}>
              {aiMessage}
            </Text>
          </View>
        ) : null}

        {/* HALT Check */}
        <View>
          <Text style={{ color: "#f1f5f9", fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
            HALT — What's driving this?
          </Text>
          <Text style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
            Urges are often symptoms of something else. Identify it.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {HALT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() =>
                  setSelectedHALT(selectedHALT === opt.key ? null : opt.key)
                }
                style={{
                  backgroundColor:
                    selectedHALT === opt.key ? "#312e81" : "#1e293b",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor:
                    selectedHALT === opt.key ? "#6366f1" : "transparent",
                }}
              >
                <Text style={{ fontSize: 18 }}>{opt.emoji}</Text>
                <Text
                  style={{
                    color:
                      selectedHALT === opt.key ? "#a5b4fc" : "#94a3b8",
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {haltSelected && (
            <View
              style={{
                backgroundColor: "#1e3a5f",
                borderRadius: 12,
                padding: 14,
                marginTop: 12,
                borderWidth: 1,
                borderColor: "#3b82f633",
              }}
            >
              <Text style={{ color: "#60a5fa", fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
                {haltSelected.emoji} Because you're {haltSelected.label.toLowerCase()}:
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 20 }}>
                {haltSelected.tip}
              </Text>
            </View>
          )}
        </View>

        {/* Box breathing */}
        <View>
          <Text style={{ color: "#f1f5f9", fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
            Box Breathing (4-4-4-4)
          </Text>
          <Text style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
            Activates your parasympathetic nervous system in 2 minutes
          </Text>

          {breathingActive ? (
            <View
              style={{
                backgroundColor: "#1e293b",
                borderRadius: 16,
                padding: 32,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#a5b4fc", fontSize: 24, fontWeight: "800" }}>
                {BREATHING_PHASES[breathingPhaseIndex]}
              </Text>
              <Text style={{ color: "#f1f5f9", fontSize: 64, fontWeight: "800", marginVertical: 8 }}>
                {breathingCount}
              </Text>
              <Text style={{ color: "#64748b", fontSize: 12 }}>
                {breathingPhaseIndex === 0
                  ? "Breathe in slowly..."
                  : breathingPhaseIndex === 1
                  ? "Hold still..."
                  : breathingPhaseIndex === 2
                  ? "Breathe out slowly..."
                  : "Stay still..."}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={startBreathing}
              style={{
                backgroundColor: "#1a1f3a",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#6366f133",
              }}
            >
              <Text style={{ fontSize: 40 }}>🫁</Text>
              <Text
                style={{
                  color: "#a5b4fc",
                  fontSize: 15,
                  fontWeight: "700",
                  marginTop: 8,
                }}
              >
                Start Breathing Exercise
              </Text>
              <Text style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                Takes 2 minutes · Proven to reduce urges
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Immediate actions */}
        <View>
          <Text style={{ color: "#f1f5f9", fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
            Do something right now
          </Text>
          <Text style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
            Physical movement is the fastest dopamine reset
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {IMMEDIATE_ACTIONS.map((action) => (
              <View
                key={action.label}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: 12,
                  padding: 12,
                  width: "47%",
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 22 }}>{action.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#e2e8f0", fontSize: 13, fontWeight: "600" }}>
                    {action.label}
                  </Text>
                  <Text style={{ color: "#475569", fontSize: 11 }}>
                    {action.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ACT: Identity reframe */}
        <View
          style={{
            backgroundColor: "#14532d",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#22c55e33",
          }}
        >
          <Text style={{ color: "#22c55e", fontSize: 14, fontWeight: "700", marginBottom: 8 }}>
            💚 Identity reminder
          </Text>
          <Text style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 22, fontStyle: "italic" }}>
            "I am not someone who is trying to stop — I am someone who has already chosen differently. This urge is just old wiring, not who I am now."
          </Text>
        </View>

        {/* Emergency lock */}
        <TouchableOpacity
          onPress={handleEmergencyLock}
          style={{
            backgroundColor: "#7f1d1d",
            borderRadius: 16,
            padding: 18,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#ef4444",
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 22 }}>🔒</Text>
          <View>
            <Text style={{ color: "#fca5a5", fontSize: 15, fontWeight: "700" }}>
              Emergency Lock (24h)
            </Text>
            <Text style={{ color: "#ef4444", fontSize: 12 }}>
              Locks all blocked apps immediately
            </Text>
          </View>
        </TouchableOpacity>

        {/* Streak reminder */}
        {streaks.length > 0 && streaks[0].currentDays > 0 && (
          <View
            style={{
              backgroundColor: "#1e293b",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#f59e0b", fontSize: 36, fontWeight: "800" }}>
              🔥 {streaks[0].currentDays}
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
              days of progress on the line
            </Text>
            <Text style={{ color: "#64748b", fontSize: 12, marginTop: 4, textAlign: "center" }}>
              You worked hard for every single one of these days.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
