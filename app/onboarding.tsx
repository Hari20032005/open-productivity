import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useUserStore } from "../src/store/userStore";
import { useRecoveryStore } from "../src/store/recoveryStore";
import { useProductivityStore } from "../src/store/productivityStore";
import { AddictionType } from "../src/store/recoveryStore";
import { Button } from "../src/components/ui/Button";

const ADDICTION_OPTIONS: Array<{
  type: AddictionType;
  emoji: string;
  title: string;
  description: string;
}> = [
  { type: "social_media", emoji: "📱", title: "Social Media", description: "Instagram, TikTok, Twitter, Reddit" },
  { type: "porn", emoji: "🔒", title: "Porn Addiction", description: "Adult content & compulsive viewing" },
  { type: "gaming", emoji: "🎮", title: "Gaming Addiction", description: "Excessive gaming & escapism" },
  { type: "general", emoji: "🧠", title: "Phone Addiction", description: "General screen time & scrolling" },
];

const MOTIVATION_OPTIONS = [
  "Improve my productivity",
  "Better relationships",
  "Mental clarity & focus",
  "More self-confidence",
  "Better sleep",
  "Reclaim my time",
  "Physical health",
  "Be present with family",
];

const STEPS = ["welcome", "name", "addictions", "motivations", "ready"] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [selectedAddictions, setSelectedAddictions] = useState<AddictionType[]>([]);
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>([]);

  const { completeOnboarding } = useUserStore();
  const { initStreaks } = useRecoveryStore();
  const { initDefaultHabits } = useProductivityStore();

  const currentIndex = STEPS.indexOf(step);

  function goNext() {
    const next = STEPS[currentIndex + 1];
    if (next) setStep(next);
  }

  function toggleAddiction(type: AddictionType) {
    setSelectedAddictions((prev) =>
      prev.includes(type) ? prev.filter((a) => a !== type) : [...prev, type]
    );
  }

  function toggleMotivation(m: string) {
    setSelectedMotivations((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  function handleFinish() {
    const finalAddictions =
      selectedAddictions.length > 0 ? selectedAddictions : ["general" as AddictionType];
    completeOnboarding(name || "Friend", finalAddictions, selectedMotivations);
    initStreaks(finalAddictions);
    initDefaultHabits();
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Progress dots */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, paddingTop: 20, paddingBottom: 8 }}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={{
                width: i === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= currentIndex ? "#6366f1" : "#334155",
              }}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP: WELCOME */}
          {step === "welcome" && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
              <Text style={{ fontSize: 72 }}>🌱</Text>
              <Text style={{ color: "#f1f5f9", fontSize: 32, fontWeight: "800", textAlign: "center" }}>
                Welcome to{"\n"}FreeFlow
              </Text>
              <Text style={{ color: "#94a3b8", fontSize: 17, textAlign: "center", lineHeight: 26 }}>
                Reclaim your mind. Own your time.{"\n"}Break free from digital addiction and build the life you want.
              </Text>
              <View style={{ backgroundColor: "#1e293b", borderRadius: 16, padding: 20, width: "100%" }}>
                <Text style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 22 }}>
                  ✅ Block social media & adult content{"\n"}
                  📈 Track your recovery streaks{"\n"}
                  🎯 Build productive daily habits{"\n"}
                  🤖 AI coach available 24/7{"\n"}
                  🤝 Accountability community
                </Text>
              </View>
              <Button label="Get Started" size="lg" onPress={goNext} style={{ width: "100%" }} />
            </View>
          )}

          {/* STEP: NAME */}
          {step === "name" && (
            <View style={{ flex: 1, justifyContent: "center", gap: 24 }}>
              <Text style={{ color: "#f1f5f9", fontSize: 28, fontWeight: "800" }}>
                What should we call you?
              </Text>
              <Text style={{ color: "#94a3b8", fontSize: 16 }}>
                Your journey is personal. We keep everything private.
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor="#475569"
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: 14,
                  padding: 18,
                  color: "#f1f5f9",
                  fontSize: 18,
                  borderWidth: 1,
                  borderColor: name ? "#6366f1" : "#334155",
                }}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={goNext}
              />
              <Button
                label="Continue"
                size="lg"
                onPress={goNext}
                disabled={!name.trim()}
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {/* STEP: ADDICTIONS */}
          {step === "addictions" && (
            <View style={{ gap: 20 }}>
              <View>
                <Text style={{ color: "#f1f5f9", fontSize: 26, fontWeight: "800" }}>
                  What are you battling, {name}?
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 15, marginTop: 8 }}>
                  Select all that apply. No judgment here.
                </Text>
              </View>
              <View style={{ gap: 12 }}>
                {ADDICTION_OPTIONS.map((opt) => {
                  const isSelected = selectedAddictions.includes(opt.type);
                  return (
                    <TouchableOpacity
                      key={opt.type}
                      onPress={() => toggleAddiction(opt.type)}
                      style={{
                        backgroundColor: isSelected ? "#312e81" : "#1e293b",
                        borderRadius: 16,
                        padding: 18,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 16,
                        borderWidth: 2,
                        borderColor: isSelected ? "#6366f1" : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 32 }}>{opt.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#f1f5f9", fontSize: 16, fontWeight: "700" }}>
                          {opt.title}
                        </Text>
                        <Text style={{ color: "#64748b", fontSize: 13 }}>{opt.description}</Text>
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: isSelected ? "#6366f1" : "#334155",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && <Text style={{ color: "#fff", fontSize: 14 }}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Button
                label="Continue"
                size="lg"
                onPress={goNext}
                disabled={selectedAddictions.length === 0}
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {/* STEP: MOTIVATIONS */}
          {step === "motivations" && (
            <View style={{ gap: 20 }}>
              <View>
                <Text style={{ color: "#f1f5f9", fontSize: 26, fontWeight: "800" }}>
                  Why do you want to quit?
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 15, marginTop: 8 }}>
                  Your reasons are your fuel. Pick what resonates.
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {MOTIVATION_OPTIONS.map((m) => {
                  const isSelected = selectedMotivations.includes(m);
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => toggleMotivation(m)}
                      style={{
                        backgroundColor: isSelected ? "#312e81" : "#1e293b",
                        borderRadius: 100,
                        paddingVertical: 10,
                        paddingHorizontal: 18,
                        borderWidth: 1.5,
                        borderColor: isSelected ? "#6366f1" : "#334155",
                      }}
                    >
                      <Text style={{ color: isSelected ? "#a5b4fc" : "#94a3b8", fontSize: 14, fontWeight: "500" }}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Button
                label="Continue"
                size="lg"
                onPress={goNext}
                disabled={selectedMotivations.length === 0}
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {/* STEP: READY */}
          {step === "ready" && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 28 }}>
              <Text style={{ fontSize: 80 }}>🚀</Text>
              <Text style={{ color: "#f1f5f9", fontSize: 30, fontWeight: "800", textAlign: "center" }}>
                You're ready, {name}!
              </Text>
              <Text style={{ color: "#94a3b8", fontSize: 17, textAlign: "center", lineHeight: 26 }}>
                Your journey starts the moment you decide to change. That moment is now.
              </Text>
              <View style={{ backgroundColor: "#1e3a5f", borderRadius: 16, padding: 20, width: "100%", gap: 12 }}>
                <Text style={{ color: "#60a5fa", fontSize: 16, fontWeight: "700" }}>
                  Your plan:
                </Text>
                {selectedAddictions.map((a) => (
                  <Text key={a} style={{ color: "#cbd5e1", fontSize: 14 }}>
                    ✓ Quit {a.replace("_", " ")} addiction
                  </Text>
                ))}
                {selectedMotivations.slice(0, 2).map((m) => (
                  <Text key={m} style={{ color: "#cbd5e1", fontSize: 14 }}>
                    🎯 {m}
                  </Text>
                ))}
              </View>
              <Button
                label="Start My Journey"
                size="lg"
                onPress={handleFinish}
                style={{ width: "100%" }}
                icon="🌱"
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
