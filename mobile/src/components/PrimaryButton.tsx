import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { palette } from "@/theme/palette";
import { softShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  icon,
  loading = false,
  variant = "primary",
  style
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
}) {
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        isGhost ? styles.ghostButton : isSecondary ? styles.secondaryButton : styles.primaryButton,
        disabled || loading ? styles.disabled : null,
        style
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={isSecondary || isGhost ? palette.primaryStrong : "#ffffff"} size="small" />
        ) : icon ? (
          <Ionicons
            color={isSecondary || isGhost ? palette.primaryStrong : "#ffffff"}
            name={icon}
            size={18}
          />
        ) : null}
        <Text style={[styles.text, isSecondary || isGhost ? styles.secondaryText : styles.primaryText]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center"
  },
  primaryButton: {
    backgroundColor: palette.primaryStrong,
    ...softShadow
  },
  secondaryButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border
  },
  ghostButton: {
    backgroundColor: palette.primaryFaint,
    borderWidth: 1,
    borderColor: palette.surfaceAccent
  },
  text: {
    fontSize: 15,
    fontWeight: "700"
  },
  primaryText: {
    color: "#ffffff"
  },
  secondaryText: {
    color: palette.primaryStrong
  },
  disabled: {
    opacity: 0.55
  }
});
