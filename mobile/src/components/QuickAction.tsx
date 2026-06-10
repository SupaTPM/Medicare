import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { cardShadow } from "@/theme/shadows";

export function QuickAction({
  icon,
  label,
  onPress,
  tone = "light"
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  tone?: "light" | "primary" | "secondary";
}) {
  const cardTone =
    tone === "primary"
      ? { backgroundColor: palette.primaryStrong, iconBg: "#ffffff22", iconColor: "#ffffff", text: "#ffffff" }
      : tone === "secondary"
        ? { backgroundColor: palette.secondarySoft, iconBg: "#ffffff", iconColor: palette.secondary, text: palette.secondary }
        : { backgroundColor: palette.surfaceRaised, iconBg: palette.primaryFaint, iconColor: palette.primaryStrong, text: palette.text };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardTone.backgroundColor },
        pressed ? styles.pressed : null
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: cardTone.iconBg }]}>
        <Ionicons color={cardTone.iconColor} name={icon} size={22} />
      </View>
      <Text style={[styles.label, { color: cardTone.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "47%",
    minHeight: 116,
    borderRadius: 16,
    padding: spacing.md,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: palette.borderSoft,
    ...cardShadow
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  }
});
