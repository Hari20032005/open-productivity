import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserStore } from "../src/store/userStore";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <StatusBar style="light" backgroundColor="#0f172a" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0f172a" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="coach" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
        <Stack.Screen name="urge" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
        <Stack.Screen name="relapse" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
