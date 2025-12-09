import { Redirect } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // If user is logged in, redirect to tabs
  if (user) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  // If user is not logged in, redirect to login
  return <Redirect href="/login" />;
}