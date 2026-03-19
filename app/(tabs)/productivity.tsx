import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
} from "react-native";
import { useProductivityStore, Priority, Task } from "../../src/store/productivityStore";
import { useUserStore } from "../../src/store/userStore";
import { TaskItem } from "../../src/components/productivity/TaskItem";
import { PomodoroTimer } from "../../src/components/productivity/PomodoroTimer";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";

type Tab = "focus" | "tasks" | "habits";

const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];
const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: "🔴 Urgent",
  high: "🟠 High",
  medium: "🔵 Medium",
  low: "🟢 Low",
};

export default function Productivity() {
  const {
    tasks,
    habits,
    addTask,
    completeTask,
    deleteTask,
    getTodayTasks,
    completeHabit,
    isHabitCompletedToday,
    pomodorosCompletedToday,
    focusSessions,
    activePomodoroDuration,
    activeBreakDuration,
    setPomodoroSettings,
  } = useProductivityStore();
  const { addXP } = useUserStore();

  const [activeTab, setActiveTab] = useState<Tab>("focus");
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [showCompleted, setShowCompleted] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [workDuration, setWorkDuration] = useState(String(activePomodoroDuration));
  const [breakDuration, setBreakDuration] = useState(String(activeBreakDuration));

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const displayTasks = showCompleted ? [...pendingTasks, ...completedTasks] : pendingTasks;

  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.completedPomodoros * activePomodoroDuration, 0);
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusMins = totalFocusMinutes % 60;

  function handleAddTask() {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      status: "pending",
      tags: [],
      isRecurring: false,
    });
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setAddTaskModal(false);
    addXP(10);
  }

  function handleCompleteTask(id: string) {
    completeTask(id);
    addXP(25);
  }

  function handleCompleteHabit(id: string) {
    if (!isHabitCompletedToday(id)) {
      completeHabit(id);
      addXP(30);
    }
  }

  function handleSaveSettings() {
    const work = parseInt(workDuration) || 25;
    const brk = parseInt(breakDuration) || 5;
    setPomodoroSettings(work, brk);
    setSettingsModal(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <View style={{ padding: 20, paddingBottom: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: "#f1f5f9", fontSize: 26, fontWeight: "800" }}>⚡ Focus</Text>
          <Text style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Build deep work habits</Text>
        </View>
        <TouchableOpacity
          onPress={() => setSettingsModal(true)}
          style={{ backgroundColor: "#1e293b", borderRadius: 10, padding: 10 }}
        >
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", padding: 16, gap: 8 }}>
        {(["focus", "tasks", "habits"] as Tab[]).map((tab) => (
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
        {/* FOCUS TAB */}
        {activeTab === "focus" && (
          <View style={{ gap: 20 }}>
            {/* Stats */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Card style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ color: "#f59e0b", fontSize: 26, fontWeight: "800" }}>
                  🍅 {pomodorosCompletedToday}
                </Text>
                <Text style={{ color: "#64748b", fontSize: 11 }}>today</Text>
              </Card>
              <Card style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ color: "#22c55e", fontSize: 26, fontWeight: "800" }}>
                  {focusHours}h {focusMins}m
                </Text>
                <Text style={{ color: "#64748b", fontSize: 11 }}>total focused</Text>
              </Card>
            </View>

            <PomodoroTimer
              onSessionComplete={(pomodoros) => {
                addXP(pomodoros * 40);
              }}
            />

            {/* Recent sessions */}
            {focusSessions.length > 0 && (
              <View>
                <Text style={{ color: "#94a3b8", fontSize: 14, fontWeight: "600", marginBottom: 10 }}>
                  Recent Sessions
                </Text>
                {focusSessions.slice(0, 5).map((session) => (
                  <View
                    key={session.id}
                    style={{
                      backgroundColor: "#1e293b",
                      borderRadius: 10,
                      padding: 12,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: "#cbd5e1", fontSize: 13 }}>
                      🍅 ×{session.completedPomodoros} focus session
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 12 }}>
                      {new Date(session.startTime).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#94a3b8", fontSize: 14 }}>
                {pendingTasks.length} pending · {completedTasks.length} done
              </Text>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Text style={{ color: "#64748b", fontSize: 12 }}>Show done</Text>
                <Switch
                  value={showCompleted}
                  onValueChange={setShowCompleted}
                  trackColor={{ false: "#334155", true: "#4f46e5" }}
                  thumbColor={showCompleted ? "#818cf8" : "#64748b"}
                />
              </View>
            </View>

            <Button
              label="+ Add Task"
              variant="secondary"
              onPress={() => setAddTaskModal(true)}
              style={{ marginBottom: 16 }}
            />

            {displayTasks.length === 0 ? (
              <Card style={{ alignItems: "center", padding: 40 }}>
                <Text style={{ fontSize: 40 }}>📋</Text>
                <Text style={{ color: "#64748b", marginTop: 12, textAlign: "center" }}>
                  No tasks yet. Add your first task to get started.
                </Text>
              </Card>
            ) : (
              displayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))
            )}
          </View>
        )}

        {/* HABITS TAB */}
        {activeTab === "habits" && (
          <View style={{ gap: 10 }}>
            <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>
              Replace bad habits with good ones. Tap to mark done.
            </Text>
            {habits.map((habit) => {
              const done = isHabitCompletedToday(habit.id);
              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => handleCompleteHabit(habit.id)}
                  style={{
                    backgroundColor: done ? "#14532d" : "#1e293b",
                    borderRadius: 14,
                    padding: 16,
                    flexDirection: "row",
                    gap: 14,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: done ? "#22c55e33" : "transparent",
                    opacity: done ? 0.8 : 1,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{habit.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: done ? "#22c55e" : "#f1f5f9", fontSize: 15, fontWeight: "600" }}>
                      {habit.title}
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 12 }}>{habit.description}</Text>
                    <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                      <Text style={{ color: "#f59e0b", fontSize: 11 }}>🔥 {habit.streak} day streak</Text>
                      <Text style={{ color: "#64748b", fontSize: 11 }}>Best: {habit.longestStreak}</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: done ? "#22c55e" : "#334155",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {done && <Text style={{ fontSize: 14 }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={addTaskModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#1e293b", borderRadius: 24, padding: 24, gap: 16 }}>
            <Text style={{ color: "#f1f5f9", fontSize: 20, fontWeight: "800" }}>New Task</Text>

            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Task title..."
              placeholderTextColor="#475569"
              style={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                padding: 14,
                color: "#f1f5f9",
                fontSize: 16,
              }}
              autoFocus
            />

            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Description (optional)"
              placeholderTextColor="#475569"
              style={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                padding: 14,
                color: "#f1f5f9",
                fontSize: 14,
              }}
            />

            <View>
              <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Priority</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setNewPriority(p)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: newPriority === p ? "#312e81" : "#0f172a",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: newPriority === p ? "#6366f1" : "transparent",
                    }}
                  >
                    <Text style={{ fontSize: 11, color: newPriority === p ? "#a5b4fc" : "#64748b" }}>
                      {PRIORITY_LABELS[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button label="Add Task (+10 XP)" onPress={handleAddTask} disabled={!newTitle.trim()} />
            <Button label="Cancel" variant="ghost" onPress={() => setAddTaskModal(false)} />
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={settingsModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#1e293b", borderRadius: 24, padding: 24, gap: 16 }}>
            <Text style={{ color: "#f1f5f9", fontSize: 20, fontWeight: "800" }}>Pomodoro Settings</Text>
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Work duration (minutes)</Text>
                <TextInput
                  value={workDuration}
                  onChangeText={setWorkDuration}
                  keyboardType="numeric"
                  style={{ backgroundColor: "#0f172a", borderRadius: 10, padding: 12, color: "#f1f5f9", fontSize: 16 }}
                />
              </View>
              <View>
                <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 6 }}>Break duration (minutes)</Text>
                <TextInput
                  value={breakDuration}
                  onChangeText={setBreakDuration}
                  keyboardType="numeric"
                  style={{ backgroundColor: "#0f172a", borderRadius: 10, padding: 12, color: "#f1f5f9", fontSize: 16 }}
                />
              </View>
            </View>
            <Button label="Save" onPress={handleSaveSettings} />
            <Button label="Cancel" variant="ghost" onPress={() => setSettingsModal(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
