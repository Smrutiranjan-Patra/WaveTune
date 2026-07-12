import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { softShadow, useAppTheme } from "../components/DesignSystem";
import { useSettingsStore } from "../store/settings.store";

function WaveTuneMark() {
  const bars = [10, 24, 54, 88, 118, 82, 46, 24, 12];

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: 4,
        height: 112,
        justifyContent: "center",
      }}
    >
      {bars.map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={{
            backgroundColor:
              index < 3 ? "#7C5CFF" : index > 5 ? "#3882F6" : "#6C63FF",
            borderRadius: 999,
            height,
            width: index === 4 ? 9 : 7,
          }}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const setUserName = useSettingsStore((state) => state.setUserName);
  const [name, setName] = useState("");
  const trimmedName = name.trim();

  const handleContinue = () => {
    if (!trimmedName) {
      return;
    }

    setUserName(trimmedName);
    router.replace("/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ backgroundColor: theme.background, flex: 1 }}
    >
      <View
        style={{
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={[
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 28,
              borderWidth: 1,
              overflow: "hidden",
              padding: 24,
              width: "100%",
            },
            softShadow(theme.isDark, "high"),
          ]}
        >
          <View style={{ alignItems: "center", paddingTop: 18 }}>
            <WaveTuneMark />
            <Text
              style={{
                color: theme.primary,
                fontSize: 30,
                fontWeight: "900",
                marginTop: 18,
                textAlign: "center",
              }}
            >
              Welcome to WaveTune
            </Text>
            <Text
              style={{
                color: theme.secondary,
                fontSize: 13,
                lineHeight: 19,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              What should we call you while your music library comes alive?
            </Text>
          </View>

          <View style={{ marginTop: 34 }}>
            <Text
              style={{
                color: theme.secondary,
                fontSize: 12,
                fontWeight: "900",
                marginBottom: 10,
              }}
            >
              YOUR NAME
            </Text>
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.cardSoft,
                borderColor: theme.border,
                borderRadius: 18,
                borderWidth: 1,
                flexDirection: "row",
                gap: 10,
                minHeight: 54,
                paddingHorizontal: 14,
              }}
            >
              <Ionicons name="person-outline" color={theme.accent} size={19} />
              <TextInput
                autoCapitalize="words"
                autoFocus
                maxLength={28}
                onChangeText={setName}
                onSubmitEditing={handleContinue}
                placeholder="Enter your name"
                placeholderTextColor={theme.muted}
                returnKeyType="done"
                style={{
                  color: theme.primary,
                  flex: 1,
                  fontSize: 16,
                  fontWeight: "800",
                  paddingVertical: 12,
                }}
                value={name}
              />
            </View>
          </View>

          <Pressable
            disabled={!trimmedName}
            onPress={handleContinue}
            style={[
              {
                alignItems: "center",
                backgroundColor: theme.accent,
                borderRadius: 22,
                flexDirection: "row",
                gap: 8,
                justifyContent: "center",
                marginTop: 24,
                minHeight: 50,
                opacity: trimmedName ? 1 : 0.45,
              },
              softShadow(theme.isDark, "high"),
            ]}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "900" }}>
              Continue
            </Text>
            <Ionicons name="arrow-forward" color="#FFFFFF" size={18} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
