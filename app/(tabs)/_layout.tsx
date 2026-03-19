import { Tabs } from "expo-router";
import { View, Text } from "react-native";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          color: focused ? "#818cf8" : "#475569",
          fontWeight: focused ? "600" : "400",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="recovery"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔥" label="Recovery" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="blocker"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🛡️" label="Blocker" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="productivity"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚡" label="Focus" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🤝" label="Community" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
