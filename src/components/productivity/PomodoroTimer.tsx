import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Vibration } from "react-native";
import { useProductivityStore } from "../../store/productivityStore";
import { useBlockerStore } from "../../store/blockerStore";

type TimerPhase = "work" | "break" | "idle";

interface PomodoroTimerProps {
  taskId?: string;
  onSessionComplete?: (pomodoros: number) => void;
}

export function PomodoroTimer({ taskId, onSessionComplete }: PomodoroTimerProps) {
  const { activePomodoroDuration, activeBreakDuration, startFocusSession, endFocusSession } =
    useProductivityStore();
  const { setFocusSession } = useBlockerStore();

  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(activePomodoroDuration * 60);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds =
    phase === "work" || phase === "idle"
      ? activePomodoroDuration * 60
      : activeBreakDuration * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase]);

  function handlePhaseComplete() {
    Vibration.vibrate([0, 300, 100, 300]);
    if (phase === "work") {
      const newCount = pomodorosCompleted + 1;
      setPomodorosCompleted(newCount);
      setPhase("break");
      setSecondsLeft(activeBreakDuration * 60);
    } else {
      setPhase("work");
      setSecondsLeft(activePomodoroDuration * 60);
    }
  }

  function handleStart() {
    if (phase === "idle") {
      setPhase("work");
      setSecondsLeft(activePomodoroDuration * 60);
      startFocusSession(taskId);
      setFocusSession(true);
    }
    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
  }

  function handleStop() {
    setIsRunning(false);
    setPhase("idle");
    setSecondsLeft(activePomodoroDuration * 60);
    endFocusSession(pomodorosCompleted);
    setFocusSession(false);
    onSessionComplete?.(pomodorosCompleted);
    setPomodorosCompleted(0);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const phaseColors = {
    idle: { ring: "#4f46e5", bg: "#1e293b", label: "Ready to focus?" },
    work: { ring: "#6366f1", bg: "#1a1f3a", label: "Deep Work" },
    break: { ring: "#22c55e", bg: "#0f2e1a", label: "Take a Break" },
  };

  const colors = phaseColors[phase];

  // Simple SVG-like circle using a View trick
  const RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={{ alignItems: "center" }}>
      {/* Timer ring using nested views */}
      <View
        style={{
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: colors.bg,
          borderWidth: 8,
          borderColor: colors.ring,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          shadowColor: colors.ring,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>
          {phaseColors[phase].label}
        </Text>
        <Text style={{ color: "#f1f5f9", fontSize: 52, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
          {timeStr}
        </Text>
        <Text style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
          🍅 ×{pomodorosCompleted}
        </Text>
      </View>

      {/* Controls */}
      <View style={{ flexDirection: "row", gap: 16 }}>
        {!isRunning ? (
          <TouchableOpacity
            onPress={handleStart}
            style={{
              backgroundColor: "#6366f1",
              paddingVertical: 14,
              paddingHorizontal: 36,
              borderRadius: 40,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              {phase === "idle" ? "Start Focus" : "Resume"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePause}
            style={{
              backgroundColor: "#334155",
              paddingVertical: 14,
              paddingHorizontal: 36,
              borderRadius: 40,
            }}
          >
            <Text style={{ color: "#e2e8f0", fontSize: 16, fontWeight: "700" }}>Pause</Text>
          </TouchableOpacity>
        )}

        {phase !== "idle" && (
          <TouchableOpacity
            onPress={handleStop}
            style={{
              backgroundColor: "#1e293b",
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 40,
              borderWidth: 1,
              borderColor: "#475569",
            }}
          >
            <Text style={{ color: "#94a3b8", fontSize: 16, fontWeight: "600" }}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      {phase === "work" && isRunning && (
        <Text style={{ color: "#64748b", fontSize: 12, marginTop: 16, textAlign: "center" }}>
          📵 Distracting apps are blocked during focus
        </Text>
      )}
    </View>
  );
}
