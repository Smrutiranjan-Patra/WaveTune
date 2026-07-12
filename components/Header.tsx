import { Text, View } from "react-native";

import { useAppTheme } from "./DesignSystem";
import { useSettingsStore } from "../store/settings.store";

const Header = () => {
  const theme = useAppTheme();
  const userName = useSettingsStore((state) => state.userName);
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
            {userName ? `${greeting}, ${userName}` : greeting}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 2 }}>
            Enjoy your music
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Header;
