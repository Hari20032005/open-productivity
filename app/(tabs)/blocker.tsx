import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { useBlockerStore, BlockedApp } from "../../src/store/blockerStore";
import { getAllApps, requestBlockingPermissions } from "../../src/services/blocking/AppBlocker";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";

type Tab = "apps" | "schedules" | "settings";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Blocker() {
  const {
    blockedApps,
    toggleApp,
    frictionModeEnabled,
    frictionDelaySeconds,
    setFrictionMode,
    strictModeEnabled,
    setStrictMode,
    pornBlockingEnabled,
    setPornBlocking,
    emergencyLockActive,
    emergencyLockUntil,
    activateEmergencyLock,
    deactivateEmergencyLock,
    schedules,
    toggleSchedule,
    removeSchedule,
    addSchedule,
  } = useBlockerStore();

  const [activeTab, setActiveTab] = useState<Tab>("apps");
  const [addScheduleModal, setAddScheduleModal] = useState(false);
  const [newScheduleLabel, setNewScheduleLabel] = useState("Focus Block");
  const [newStartHour, setNewStartHour] = useState(9);
  const [newEndHour, setNewEndHour] = useState(17);
  const [newDays, setNewDays] = useState([1, 2, 3, 4, 5]);

  const allApps = getAllApps();

  function handleEmergencyLock() {
    if (emergencyLockActive) {
      Alert.alert(
        "Unlock Emergency Mode",
        "Are you sure? This will re-enable access to blocked apps.",
        [
          { text: "Stay locked 💪", style: "cancel" },
          { text: "Unlock", style: "destructive", onPress: deactivateEmergencyLock },
        ]
      );
    } else {
      Alert.alert(
        "🔒 Emergency Lock",
        "Lock ALL blocked apps for 24 hours. This helps during strong urges. You'll need an accountability partner to unlock early.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Lock for 24h",
            style: "destructive",
            onPress: () => activateEmergencyLock(24),
          },
        ]
      );
    }
  }

  function handleRequestPermissions() {
    Alert.alert(
      "Enable App Blocking",
      "FreeFlow needs special permissions to block apps.\n\nOn Android: Accessibility Service + Usage Stats\nOn iOS: Screen Time",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Grant Permissions", onPress: requestBlockingPermissions },
      ]
    );
  }

  function toggleDay(day: number) {
    setNewDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleAddSchedule() {
    addSchedule({
      label: newScheduleLabel,
      startHour: newStartHour,
      endHour: newEndHour,
      days: newDays,
      isActive: true,
    });
    setAddScheduleModal(false);
  }

  function formatHour(h: number) {
    if (h === 0) return "12am";
    if (h === 12) return "12pm";
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ color: "#f1f5f9", fontSize: 26, fontWeight: "800" }}>🛡️ Blocker</Text>
        <Text style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
          Control what you allow into your mind
        </Text>
      </View>

      {/* Emergency lock banner */}
      {emergencyLockActive && (
        <TouchableOpacity
          onPress={handleEmergencyLock}
          style={{
            backgroundColor: "#7f1d1d",
            padding: 14,
            marginHorizontal: 20,
            marginTop: 12,
            borderRadius: 12,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20 }}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fca5a5", fontWeight: "700" }}>Emergency Lock Active</Text>
            <Text style={{ color: "#ef4444", fontSize: 12 }}>
              Until {emergencyLockUntil ? new Date(emergencyLockUntil).toLocaleTimeString() : "..."}
            </Text>
          </View>
          <Text style={{ color: "#ef4444", fontSize: 12 }}>Tap to unlock</Text>
        </TouchableOpacity>
      )}

      {/* Tabs */}
      <View style={{ flexDirection: "row", padding: 16, gap: 8 }}>
        {(["apps", "schedules", "settings"] as Tab[]).map((tab) => (
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
        {/* APPS TAB */}
        {activeTab === "apps" && (
          <View style={{ gap: 12 }}>
            <Button
              label="Grant Blocking Permissions"
              variant="secondary"
              icon="🔑"
              onPress={handleRequestPermissions}
            />

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {allApps.map((app) => {
                const isBlocked = blockedApps.includes(app.key as BlockedApp);
                return (
                  <TouchableOpacity
                    key={app.key}
                    onPress={() => toggleApp(app.key as BlockedApp)}
                    style={{
                      width: "47%",
                      backgroundColor: isBlocked ? "#1e3a5f" : "#1e293b",
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 2,
                      borderColor: isBlocked ? "#3b82f6" : "transparent",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{app.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#f1f5f9", fontSize: 13, fontWeight: "600" }}>
                        {app.label}
                      </Text>
                      <Text style={{ color: isBlocked ? "#3b82f6" : "#475569", fontSize: 11 }}>
                        {isBlocked ? "🚫 Blocked" : "✅ Allowed"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Porn blocking */}
            <Card style={{ marginTop: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#f1f5f9", fontSize: 15, fontWeight: "700" }}>
                    🔒 Porn Blocker
                  </Text>
                  <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                    DNS-level filtering of adult content
                  </Text>
                </View>
                <Switch
                  value={pornBlockingEnabled}
                  onValueChange={setPornBlocking}
                  trackColor={{ false: "#334155", true: "#4f46e5" }}
                  thumbColor={pornBlockingEnabled ? "#818cf8" : "#64748b"}
                />
              </View>
            </Card>

            {/* Emergency lock */}
            <Button
              label={emergencyLockActive ? "🔓 Unlock Emergency Mode" : "🔒 Emergency Lock (24h)"}
              variant={emergencyLockActive ? "secondary" : "danger"}
              onPress={handleEmergencyLock}
            />
          </View>
        )}

        {/* SCHEDULES TAB */}
        {activeTab === "schedules" && (
          <View style={{ gap: 12 }}>
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#f1f5f9", fontSize: 15, fontWeight: "700" }}>
                      {schedule.label}
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                      {formatHour(schedule.startHour)} – {formatHour(schedule.endHour)}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 4, marginTop: 6 }}>
                      {DAYS.map((day, i) => (
                        <Text
                          key={day}
                          style={{
                            fontSize: 10,
                            color: schedule.days.includes(i) ? "#818cf8" : "#334155",
                            fontWeight: schedule.days.includes(i) ? "700" : "400",
                          }}
                        >
                          {day[0]}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <Switch
                      value={schedule.isActive}
                      onValueChange={() => toggleSchedule(schedule.id)}
                      trackColor={{ false: "#334155", true: "#4f46e5" }}
                      thumbColor={schedule.isActive ? "#818cf8" : "#64748b"}
                    />
                    <TouchableOpacity onPress={() => removeSchedule(schedule.id)}>
                      <Text style={{ color: "#475569", fontSize: 12 }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}

            <Button
              label="+ Add Schedule"
              variant="secondary"
              onPress={() => setAddScheduleModal(true)}
            />
          </View>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <View style={{ gap: 12 }}>
            <Card>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#f1f5f9", fontSize: 15, fontWeight: "700" }}>⏱️ Friction Mode</Text>
                  <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                    Forces a {frictionDelaySeconds}s wait before opening blocked apps
                  </Text>
                </View>
                <Switch
                  value={frictionModeEnabled}
                  onValueChange={(v) => setFrictionMode(v)}
                  trackColor={{ false: "#334155", true: "#4f46e5" }}
                  thumbColor={frictionModeEnabled ? "#818cf8" : "#64748b"}
                />
              </View>
              {frictionModeEnabled && (
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {[5, 10, 15, 30, 60].map((secs) => (
                    <TouchableOpacity
                      key={secs}
                      onPress={() => setFrictionMode(true, secs)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 14,
                        borderRadius: 20,
                        backgroundColor: frictionDelaySeconds === secs ? "#6366f1" : "#0f172a",
                      }}
                    >
                      <Text style={{ color: frictionDelaySeconds === secs ? "#fff" : "#64748b", fontSize: 13 }}>
                        {secs}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>

            <Card>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#f1f5f9", fontSize: 15, fontWeight: "700" }}>
                    🔐 Strict Mode
                  </Text>
                  <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                    Requires accountability partner to change settings
                  </Text>
                </View>
                <Switch
                  value={strictModeEnabled}
                  onValueChange={setStrictMode}
                  trackColor={{ false: "#334155", true: "#ef4444" }}
                  thumbColor={strictModeEnabled ? "#fca5a5" : "#64748b"}
                />
              </View>
            </Card>

            <Card style={{ borderColor: "#6366f133", borderWidth: 1 }}>
              <Text style={{ color: "#a5b4fc", fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
                ℹ️ How blocking works
              </Text>
              <Text style={{ color: "#64748b", fontSize: 13, lineHeight: 20 }}>
                Android: Uses Accessibility Services + VPN DNS filtering{"\n"}
                iOS: Uses Screen Time API + Network Extension{"\n\n"}
                Friction Mode adds a reflection pause before you open a blocked app — studies show this reduces usage by 45%.{"\n\n"}
                Emergency Lock is designed for high-urge moments and requires your accountability partner to unlock early.
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Add Schedule Modal */}
      <Modal visible={addScheduleModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#1e293b", borderRadius: 24, padding: 24, gap: 16 }}>
            <Text style={{ color: "#f1f5f9", fontSize: 20, fontWeight: "800" }}>Add Block Schedule</Text>

            <View>
              <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Time range</Text>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {HOURS.map((h) => (
                      <TouchableOpacity
                        key={`start-${h}`}
                        onPress={() => setNewStartHour(h)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: newStartHour === h ? "#6366f1" : "#0f172a",
                        }}
                      >
                        <Text style={{ color: newStartHour === h ? "#fff" : "#64748b", fontSize: 12 }}>
                          {formatHour(h)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <Text style={{ color: "#475569", textAlign: "center", fontSize: 12, marginVertical: 4 }}>to</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={`end-${h}`}
                      onPress={() => setNewEndHour(h)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: newEndHour === h ? "#6366f1" : "#0f172a",
                      }}
                    >
                      <Text style={{ color: newEndHour === h ? "#fff" : "#64748b", fontSize: 12 }}>
                        {formatHour(h)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View>
              <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Days</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {DAYS.map((day, i) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleDay(i)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: newDays.includes(i) ? "#6366f1" : "#0f172a",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: newDays.includes(i) ? "#fff" : "#64748b", fontSize: 11 }}>
                      {day[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button label="Add Schedule" onPress={handleAddSchedule} />
            <Button label="Cancel" variant="ghost" onPress={() => setAddScheduleModal(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
