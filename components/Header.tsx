import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { accent, softShadow, useAppTheme } from "./DesignSystem";

const Header = () => {
  const theme = useAppTheme();
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : hour < 21
          ? "Good Evening"
          : "Good Night";

  return (
    <View
      style={{
        backgroundColor: theme.background,
        paddingHorizontal: 22,
        paddingTop: 12,
        paddingBottom: 10,
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ color: theme.primary, fontSize: 22, fontWeight: "900" }}>
            {greeting}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 2 }}>
            Enjoy your music
          </Text>
        </View>

        <Pressable
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 17,
              borderWidth: 1,
              height: 34,
              justifyContent: "center",
              width: 34,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Ionicons name="notifications-outline" color={accent} size={17} />
        </Pressable>
      </View>
    </View>
  );
};

export default Header;
