import { Text, View } from "react-native";

import { useAppTheme } from "./DesignSystem";
import { useSettingsStore } from "../store/settings.store";

const Header = () => {
  const theme = useAppTheme();
  const userName = useSettingsStore((state) => state.userName);
  const displayName = typeof userName === "string" ? userName.trim() : "";

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
          <Text
            style={{
              color: theme.primary,
              fontSize: 23,
              fontWeight: "900",
            }}
          >
            {displayName ? `Ready to listen, ${displayName}?` : "Ready to listen?"}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 2 }}>
            Your music, right where you left it
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Header;
