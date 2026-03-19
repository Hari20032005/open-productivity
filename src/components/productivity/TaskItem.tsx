import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Task, Priority } from "../../store/productivityStore";

interface TaskItemProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onPress?: () => void;
}

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string; dot: string }> = {
  urgent: { color: "#ef4444", label: "Urgent", dot: "🔴" },
  high: { color: "#f59e0b", label: "High", dot: "🟠" },
  medium: { color: "#6366f1", label: "Medium", dot: "🔵" },
  low: { color: "#22c55e", label: "Low", dot: "🟢" },
};

export function TaskItem({ task, onComplete, onDelete, onPress }: TaskItemProps) {
  const pConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = task.status === "completed";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: "#1e293b",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: isCompleted ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      {/* Checkbox */}
      <TouchableOpacity
        onPress={onComplete}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isCompleted ? "#22c55e" : pConfig.color,
          backgroundColor: isCompleted ? "#22c55e" : "transparent",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isCompleted && <Text style={{ fontSize: 12 }}>✓</Text>}
      </TouchableOpacity>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: isCompleted ? "#64748b" : "#f1f5f9",
            fontSize: 15,
            fontWeight: "600",
            textDecorationLine: isCompleted ? "line-through" : "none",
          }}
        >
          {task.title}
        </Text>
        {task.description && (
          <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
            {task.description}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: pConfig.color, fontWeight: "600" }}>
            {pConfig.dot} {pConfig.label}
          </Text>
          {task.dueDate && (
            <Text style={{ fontSize: 10, color: "#64748b" }}>
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          )}
          {task.project && (
            <Text style={{ fontSize: 10, color: "#a855f7" }}>📁 {task.project}</Text>
          )}
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
        <Text style={{ color: "#475569", fontSize: 16 }}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
