import { Text, View } from "react-native";

const Header = () => {
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
    <View className="px-4 py-5 bg-white">
      <Text className="text-xl tracking-wider font-bold text-textPrimaryLight">
        {greeting}
      </Text>
      <Text className="text-l tracking-wide text-textSecondary">
        Enjoy Your Music
      </Text>
    </View>
  );
};

export default Header;
