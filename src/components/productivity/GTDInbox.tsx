/**
 * GTD Inbox Component — Quick capture for open loops
 *
 * Research insight (Gemini PDF):
 * "The GTD framework is grounded in the reality that the human brain is optimized for processing
 * and synthesizing information rather than maintaining an exhaustive index of commitments."
 *
 * "Software like Super Productivity facilitates this by providing keyboard shortcuts for immediate
 * capture, preventing the 'context-switching cost' associated with interrupting a focused session."
 *
 * Also implements the "1-3-5 rule": 1 major + 3 medium + 5 small tasks per day.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useProductivityStore, Priority } from "../../store/productivityStore";
import { useUserStore } from "../../store/userStore";

interface GTDInboxProps {
  onClose?: () => void;
}

const CONTEXTS = ["@deepwork", "@quick", "@calls", "@errands", "@computer", "@anywhere"];

export function GTDInbox({ onClose }: GTDInboxProps) {
  const { addTask, getTodayTasks } = useProductivityStore();
  const { addXP } = useUserStore();
  const [input, setInput] = useState("");
  const [selectedContext, setSelectedContext] = useState("@anywhere");
  const [priority, setPriority] = useState<Priority>("medium");
  const [captured, setCaptured] = useState<string[]>([]);

  const todayTasks = getTodayTasks();
  const urgentCount = todayTasks.filter((t) => t.priority === "urgent" || t.priority === "high").length;
  const mediumCount = todayTasks.filter((t) => t.priority === "medium").length;
  const lowCount = todayTasks.filter((t) => t.priority === "low").length;

  // 1-3-5 rule tracking
  const rule135 = {
    major: { current: urgentCount, max: 1, label: "Major task" },
    medium: { current: mediumCount, max: 3, label: "Medium tasks" },
    small: { current: lowCount, max: 5, label: "Small tasks" },
  };

  function handleCapture() {
    if (!input.trim()) return;

    // Auto-detect priority from input
    let detectedPriority: Priority = priority;
    const lower = input.toLowerCase();
    if (lower.includes("urgent") || lower.includes("asap") || lower.includes("!!")) {
      detectedPriority = "urgent";
    } else if (lower.includes("important") || lower.includes("!")) {
      detectedPriority = "high";
    }

    // Extract context from input (e.g., "@deepwork fix the bug")
    const contextMatch = input.match(/@\w+/);
    const taskTitle = input.replace(/@\w+/, "").trim();

    addTask({
      title: taskTitle || input,
      priority: detectedPriority,
      status: "pending",
      tags: contextMatch ? [contextMatch[0]] : [selectedContext],
      isRecurring: false,
    });

    setCaptured((prev) => [input, ...prev]);
    setInput("");
    addXP(10);
  }

  return (
    <View style={{ backgroundColor: "#0f172a", borderRadius: 24, padding: 20, gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: "#f1f5f9", fontSize: 20, fontWeight: "800" }}>
            📥 GTD Inbox
          </Text>
          <Text style={{ color: "#64748b", fontSize: 12 }}>
            Capture everything. Clarify later.
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: "#475569", fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 1-3-5 Rule overview */}
      <View style={{ backgroundColor: "#1e293b", borderRadius: 12, padding: 12 }}>
        <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "600", marginBottom: 8 }}>
          Today's 1-3-5 Rule
        </Text>
        {Object.entries(rule135).map(([key, val]) => (
          <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: "#64748b", fontSize: 12 }}>{val.label}</Text>
            <Text
              style={{
                color: val.current >= val.max ? "#22c55e" : "#f59e0b",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {val.current}/{val.max}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick capture input */}
      <View>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="What's on your mind? Type and capture it..."
          placeholderTextColor="#475569"
          style={{
            backgroundColor: "#1e293b",
            borderRadius: 12,
            padding: 14,
            color: "#f1f5f9",
            fontSize: 15,
            borderWidth: 1,
            borderColor: input ? "#6366f1" : "transparent",
          }}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCapture}
        />
        <Text style={{ color: "#334155", fontSize: 10, marginTop: 4 }}>
          Tip: Type @deepwork, @quick, @calls etc. to add context
        </Text>
      </View>

      {/* Context tags */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {CONTEXTS.map((ctx) => (
            <TouchableOpacity
              key={ctx}
              onPress={() => setSelectedContext(ctx)}
              style={{
                backgroundColor: selectedContext === ctx ? "#312e81" : "#1e293b",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: selectedContext === ctx ? "#6366f1" : "transparent",
              }}
            >
              <Text style={{ color: selectedContext === ctx ? "#a5b4fc" : "#64748b", fontSize: 12 }}>
                {ctx}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Priority selector */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["urgent", "high", "medium", "low"] as Priority[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPriority(p)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: priority === p ? "#312e81" : "#1e293b",
              alignItems: "center",
              borderWidth: 1,
              borderColor: priority === p ? "#6366f1" : "transparent",
            }}
          >
            <Text style={{ color: priority === p ? "#a5b4fc" : "#475569", fontSize: 11, textTransform: "capitalize" }}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Capture button */}
      <TouchableOpacity
        onPress={handleCapture}
        disabled={!input.trim()}
        style={{
          backgroundColor: input.trim() ? "#6366f1" : "#1e293b",
          borderRadius: 12,
          padding: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
          Capture (+10 XP)
        </Text>
      </TouchableOpacity>

      {/* Captured this session */}
      {captured.length > 0 && (
        <View>
          <Text style={{ color: "#475569", fontSize: 12, marginBottom: 6 }}>
            Captured this session:
          </Text>
          {captured.map((item, i) => (
            <Text key={i} style={{ color: "#64748b", fontSize: 12 }}>
              ✓ {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
