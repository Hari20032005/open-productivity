/**
 * AI RECOVERY COACH SCREEN
 *
 * Based on research:
 * - CBT-based trigger identification and cognitive restructuring — Claude/Gemini PDF
 * - ACT-based acceptance techniques (93% reduction in porn use) — Claude PDF
 * - Conversational check-ins beat cold blockers — all PDFs
 * - Identity transformation framing — Claude PDF
 * - Non-shame, self-compassion approach — Gemini PDF (Moral Incongruence Model)
 */
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useUserStore } from "../src/store/userStore";
import { useRecoveryStore } from "../src/store/recoveryStore";
import {
  sendCoachMessage,
  ChatMessage,
  getDailyCheckIn,
} from "../src/services/ai/RecoveryCoach";

const QUICK_PROMPTS = [
  "I'm feeling an urge right now",
  "I relapsed and feel guilty",
  "What should I do today?",
  "Why is this so hard?",
  "I hit a milestone!",
  "I feel bored and restless",
  "How do I tell someone about this?",
];

export default function CoachScreen() {
  const { profile } = useUserStore();
  const { streaks, journalEntries } = useRecoveryStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const coachContext = {
    userName: profile?.name ?? "Friend",
    addictionTypes: streaks.map((s) => s.label),
    currentStreaks: streaks.map((s) => ({
      label: s.label,
      days: s.currentDays,
    })),
    todayMood: undefined,
    todayUrgeIntensity: undefined,
    recentJournalNote: journalEntries[0]?.note,
    motivationReasons: [],
  };

  useEffect(() => {
    initConversation();
  }, []);

  async function initConversation() {
    setInitializing(true);
    try {
      const greeting = await getDailyCheckIn(coachContext);
      const welcomeMsg: ChatMessage = {
        role: "assistant",
        content: greeting,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMsg]);
    } catch {
      const fallback: ChatMessage = {
        role: "assistant",
        content: `Hey ${profile?.name ?? "there"}! I'm your FreeFlow AI coach. I'm here 24/7 — no judgment, just support. How are you feeling right now?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([fallback]);
    }
    setInitializing(false);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await sendCoachMessage(newMessages, coachContext);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content:
          "I'm having trouble connecting right now. But remember: you opened this app instead of giving in. That's already a win. Take 5 deep breaths and do one small positive action.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#1e293b",
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#312e81",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 22 }}>🤖</Text>
            </View>
            <View>
              <Text style={{ color: "#f1f5f9", fontSize: 16, fontWeight: "700" }}>
                FreeFlow Coach
              </Text>
              <Text style={{ color: "#22c55e", fontSize: 12 }}>
                ● Online · CBT + ACT based
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#475569", fontSize: 22 }}>↓</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: false })
          }
        >
          {initializing ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator color="#6366f1" />
              <Text style={{ color: "#64748b", marginTop: 12 }}>
                Coach is getting ready...
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <View
                  key={index}
                  style={{
                    alignItems: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  {!isUser && (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "flex-end",
                        maxWidth: "85%",
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: "#312e81",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>🤖</Text>
                      </View>
                      <View>
                        <View
                          style={{
                            backgroundColor: "#1e293b",
                            borderRadius: 18,
                            borderBottomLeftRadius: 4,
                            padding: 14,
                          }}
                        >
                          <Text
                            style={{
                              color: "#e2e8f0",
                              fontSize: 15,
                              lineHeight: 22,
                            }}
                          >
                            {msg.content}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: "#334155",
                            fontSize: 10,
                            marginTop: 4,
                            marginLeft: 4,
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {isUser && (
                    <View style={{ maxWidth: "80%" }}>
                      <View
                        style={{
                          backgroundColor: "#4f46e5",
                          borderRadius: 18,
                          borderBottomRightRadius: 4,
                          padding: 14,
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 15, lineHeight: 22 }}>
                          {msg.content}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#334155",
                          fontSize: 10,
                          marginTop: 4,
                          textAlign: "right",
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}

          {loading && (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "#312e81",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14 }}>🤖</Text>
              </View>
              <View
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: 18,
                  borderBottomLeftRadius: 4,
                  padding: 14,
                  flexDirection: "row",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="small" color="#6366f1" />
                <Text style={{ color: "#64748b", fontSize: 13 }}>thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick prompts */}
        {messages.length <= 2 && !loading && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            style={{ maxHeight: 44, marginBottom: 8 }}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                onPress={() => sendMessage(prompt)}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: "#334155",
                }}
              >
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            padding: 12,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: "#1e293b",
            alignItems: "flex-end",
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message your coach..."
            placeholderTextColor="#475569"
            multiline
            style={{
              flex: 1,
              backgroundColor: "#1e293b",
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: "#f1f5f9",
              fontSize: 15,
              maxHeight: 120,
            }}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() && !loading ? "#6366f1" : "#1e293b",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>↑</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text
          style={{
            color: "#334155",
            fontSize: 10,
            textAlign: "center",
            paddingBottom: 8,
            paddingHorizontal: 20,
          }}
        >
          AI coach is not a replacement for professional therapy. In crisis, call
          988 (US) or your local helpline.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
