import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useUserStore } from "../src/store/userStore";

export default function Index() {
  const { onboardingComplete } = useUserStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onboardingComplete) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [onboardingComplete]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}
