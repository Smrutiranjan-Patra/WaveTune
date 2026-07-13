import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { softShadow, useAppTheme } from "../components/DesignSystem";

const sections = [
  {
    title: "Information WaveTune Uses",
    body: "WaveTune reads audio files and their metadata, including song title, artist, album, genre, duration, folder, and available album artwork. This access is used to organize and play music stored on your device.",
  },
  {
    title: "Information Stored on Your Device",
    body: "Your nickname, preferences, playlists, favorites, recent searches, listening history, and indexed music-library information are stored locally on your device.",
  },
  {
    title: "Sharing and Network Use",
    body: "WaveTune does not require an account and does not upload your music library or listening activity to a WaveTune server. When you use Share, Android sends the song text only to the app you choose from the system share sheet.",
  },
  {
    title: "Permissions",
    body: "Music and media permissions are requested only so WaveTune can discover and play audio files. You can change these permissions at any time from Android Settings, although library features may stop working.",
  },
  {
    title: "Your Choices",
    body: "You can exclude folders, choose generated covers instead of album artwork, clear recent searches, or use Reset App Data to remove WaveTune's locally stored data. Resetting WaveTune does not delete your music files.",
  },
  {
    title: "Policy Updates",
    body: "If WaveTune's data practices change, this policy will be updated in the app with a revised effective date.",
  },
];

export default function PrivacyPolicyScreen() {
  const theme = useAppTheme();

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: 14,
          paddingHorizontal: 22,
          paddingTop: 14,
        }}
      >
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 19,
              borderWidth: 1,
              height: 38,
              justifyContent: "center",
              width: 38,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Ionicons name="chevron-back" color={theme.icon} size={21} />
        </Pressable>
        <Text style={{ color: theme.primary, fontSize: 20, fontWeight: "900" }}>
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 40,
          paddingHorizontal: 22,
          paddingTop: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              padding: 16,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Text style={{ color: theme.primary, fontSize: 17, fontWeight: "900" }}>
            WaveTune Privacy Policy
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 11, marginTop: 5 }}>
            Effective July 13, 2026
          </Text>
          <Text
            style={{
              color: theme.secondary,
              fontSize: 13,
              lineHeight: 19,
              marginTop: 12,
            }}
          >
            WaveTune is designed as an offline music player. Your music and
            personal library activity remain on your device unless you choose to
            share something through Android.
          </Text>
        </View>

        {sections.map((section) => (
          <View
            key={section.title}
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              padding: 16,
            }}
          >
            <Text
              style={{ color: theme.primary, fontSize: 14, fontWeight: "900" }}
            >
              {section.title}
            </Text>
            <Text
              style={{
                color: theme.secondary,
                fontSize: 12,
                lineHeight: 18,
                marginTop: 7,
              }}
            >
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
