import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { useUserStore } from "../../src/store/userStore";
import { useRecoveryStore } from "../../src/store/recoveryStore";
import { Card } from "../../src/components/ui/Card";
import { Button } from "../../src/components/ui/Button";

interface Post {
  id: string;
  userName: string;
  avatar: string;
  level: number;
  streakDays: number;
  streakType: string;
  content: string;
  likes: number;
  timestamp: string;
  isLiked: boolean;
}

// Simulated community posts
const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    userName: "Marcus",
    avatar: "💪",
    level: 12,
    streakDays: 47,
    streakType: "Social Media",
    content: "Day 47 off Instagram and TikTok. I genuinely didn't believe I could do this 2 months ago. My relationships are better, my work is better, I'm sleeping 8 hours. The urges are mostly gone now.",
    likes: 84,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isLiked: false,
  },
  {
    id: "2",
    userName: "Sarah K.",
    avatar: "🌸",
    level: 7,
    streakDays: 21,
    streakType: "Porn",
    content: "3 weeks clean. Had a really bad urge yesterday evening, opened FreeFlow, used the emergency help, did 50 push-ups and went for a walk. Woke up today feeling proud of myself. This community helps more than I expected.",
    likes: 127,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isLiked: true,
  },
  {
    id: "3",
    userName: "DevRaj",
    avatar: "🧘",
    level: 23,
    streakDays: 90,
    streakType: "Social Media",
    content: "90 DAYS. 3 months without social media. I've read 8 books. Shipped 2 side projects. Lost 15 lbs from actually going to the gym instead of scrolling. The best decision of my year.",
    likes: 312,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isLiked: false,
  },
  {
    id: "4",
    userName: "Anonymous",
    avatar: "🌱",
    level: 2,
    streakDays: 3,
    streakType: "Porn",
    content: "Day 3. Relapsed twice before getting here. This time feels different. I set up strict mode and added an accountability partner. Taking it one day at a time.",
    likes: 89,
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    isLiked: false,
  },
];

const CHALLENGES = [
  { id: "1", title: "7-Day Social Media Detox", participants: 2341, emoji: "📱", days: 7 },
  { id: "2", title: "30-Day Reboot", participants: 1876, emoji: "🔥", days: 30 },
  { id: "3", title: "No-Scroll Morning", participants: 4521, emoji: "🌅", days: 30 },
  { id: "4", title: "90-Day Transformation", participants: 892, emoji: "🏆", days: 90 },
];

type Tab = "feed" | "challenges" | "leaderboard";

export default function Community() {
  const { profile } = useUserStore();
  const { streaks } = useRecoveryStore();
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [shareModal, setShareModal] = useState(false);
  const [shareContent, setShareContent] = useState("");

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  function handleShare() {
    if (!shareContent.trim() || !profile) return;
    const bestStreak = streaks.reduce(
      (best, s) => (s.currentDays > best.days ? { days: s.currentDays, label: s.label } : best),
      { days: 0, label: "" }
    );
    const newPost: Post = {
      id: String(Date.now()),
      userName: profile.name,
      avatar: profile.avatar,
      level: profile.level,
      streakDays: bestStreak.days,
      streakType: bestStreak.label,
      content: shareContent,
      likes: 0,
      timestamp: new Date().toISOString(),
      isLiked: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setShareContent("");
    setShareModal(false);
  }

  function formatTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  // Simulated leaderboard combining our streaks with mock data
  const leaderboard = [
    { name: "DevRaj", avatar: "🧘", level: 23, streak: 90, type: "Social Media" },
    { name: "Sarah K.", avatar: "🌸", level: 7, streak: 21, type: "Porn" },
    { name: "Marcus", avatar: "💪", level: 12, streak: 47, type: "Social Media" },
    ...(profile ? [{ name: profile.name, avatar: profile.avatar, level: profile.level, streak: streaks[0]?.currentDays ?? 0, type: streaks[0]?.label ?? "Recovery" }] : []),
  ]
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ color: "#f1f5f9", fontSize: 26, fontWeight: "800" }}>🤝 Community</Text>
        <Text style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
          You're not alone in this journey
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", padding: 16, gap: 8 }}>
        {(["feed", "challenges", "leaderboard"] as Tab[]).map((tab) => (
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
            <Text style={{ color: activeTab === tab ? "#fff" : "#64748b", fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* FEED */}
        {activeTab === "feed" && (
          <View>
            <Button
              label="✍️ Share your progress"
              variant="secondary"
              onPress={() => setShareModal(true)}
              style={{ marginBottom: 16 }}
            />
            {posts.map((post) => (
              <Card key={post.id} style={{ marginBottom: 12 }}>
                {/* Author */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#334155",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{post.avatar}</Text>
                    </View>
                    <View>
                      <Text style={{ color: "#f1f5f9", fontSize: 14, fontWeight: "600" }}>
                        {post.userName}
                      </Text>
                      <Text style={{ color: "#64748b", fontSize: 11 }}>
                        Lvl {post.level} · 🔥 {post.streakDays}d {post.streakType}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: "#475569", fontSize: 11 }}>{formatTime(post.timestamp)}</Text>
                </View>

                {/* Content */}
                <Text style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 21, marginBottom: 12 }}>
                  {post.content}
                </Text>

                {/* Actions */}
                <TouchableOpacity
                  onPress={() => toggleLike(post.id)}
                  style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
                >
                  <Text style={{ fontSize: 16 }}>{post.isLiked ? "❤️" : "🤍"}</Text>
                  <Text style={{ color: post.isLiked ? "#f43f5e" : "#64748b", fontSize: 13 }}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {/* CHALLENGES */}
        {activeTab === "challenges" && (
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#94a3b8", fontSize: 14, marginBottom: 4 }}>
              Join a challenge to stay accountable with thousands of others
            </Text>
            {CHALLENGES.map((challenge) => (
              <Card key={challenge.id}>
                <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                  <Text style={{ fontSize: 36 }}>{challenge.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#f1f5f9", fontSize: 15, fontWeight: "700" }}>
                      {challenge.title}
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                      👥 {challenge.participants.toLocaleString()} participants · {challenge.days} days
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#6366f1",
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Join</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <View>
            <Text style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>
              Top streaks this week
            </Text>
            {leaderboard.map((user, index) => {
              const isMe = profile && user.name === profile.name;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <View
                  key={`${user.name}-${index}`}
                  style={{
                    backgroundColor: isMe ? "#1a1f3a" : "#1e293b",
                    borderRadius: 14,
                    padding: 14,
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 8,
                    borderWidth: isMe ? 1 : 0,
                    borderColor: "#6366f133",
                  }}
                >
                  <Text style={{ fontSize: 22, width: 32, textAlign: "center" }}>
                    {medals[index] ?? `${index + 1}.`}
                  </Text>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#334155",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{user.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isMe ? "#a5b4fc" : "#f1f5f9", fontSize: 14, fontWeight: "600" }}>
                      {user.name} {isMe && "(you)"}
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 11 }}>
                      Lvl {user.level} · {user.type}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: "#f59e0b", fontSize: 18, fontWeight: "800" }}>
                      {user.streak}
                    </Text>
                    <Text style={{ color: "#64748b", fontSize: 10 }}>days</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Share Modal */}
      <Modal visible={shareModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#1e293b", borderRadius: 24, padding: 24, gap: 16 }}>
            <Text style={{ color: "#f1f5f9", fontSize: 20, fontWeight: "800" }}>Share Progress</Text>
            <Text style={{ color: "#64748b", fontSize: 13 }}>
              Your post is anonymous to non-members. Share your wins and struggles — it helps everyone.
            </Text>
            <TextInput
              value={shareContent}
              onChangeText={setShareContent}
              placeholder="What's on your mind? Share a win, a struggle, or advice..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={5}
              style={{
                backgroundColor: "#0f172a",
                borderRadius: 12,
                padding: 14,
                color: "#f1f5f9",
                fontSize: 14,
                minHeight: 120,
                textAlignVertical: "top",
              }}
            />
            <Button label="Post" onPress={handleShare} disabled={!shareContent.trim()} />
            <Button label="Cancel" variant="ghost" onPress={() => setShareModal(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
