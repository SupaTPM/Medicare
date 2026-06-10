import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusPill } from "@/components/StatusPill";
import { palette } from "@/theme/palette";
import { cardShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function FlowCard({
  icon,
  meta,
  status,
  title,
  tone = "blue"
}: {
  icon: keyof typeof Ionicons.glyphMap;
  meta: string;
  status: string;
  title: string;
  tone?: "blue" | "green" | "yellow" | "red" | "gray";
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons color={palette.primaryStrong} name={icon} size={24} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <StatusPill label={status} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...cardShadow
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: palette.surfaceAccent,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  copy: {
    flex: 1
  },
  title: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800"
  },
  meta: {
    color: palette.textSubtle,
    fontSize: 13,
    marginTop: 3
  }
});
