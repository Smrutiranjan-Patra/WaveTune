import React from "react";
import { Pressable, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
};

const Button = ({ title, onPress }: ButtonProps) => {
  return (
    <Pressable onPress={onPress} className="rounded-lg">
      <Text className="text-l text-primary">{title}</Text>
    </Pressable>
  );
};

export default Button;
