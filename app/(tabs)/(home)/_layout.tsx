import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#e70909",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
          },
          headerTitleAlign: "center", // Add this line
          title: "Hamro Sewa",
        }}
      />
    </Stack>
  );
}