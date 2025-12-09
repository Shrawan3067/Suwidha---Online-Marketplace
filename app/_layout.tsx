// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { PropertyProvider } from "@/src/contexts/PropertyContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PropertyProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="property/[id]" />
            <Stack.Screen name="filters" />
          </Stack>
        </PropertyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}