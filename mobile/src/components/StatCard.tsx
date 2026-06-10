import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function StatCard({
  label,
  value,
  tone = "blue"
}: {
  label: string;
  value: string;
  tone?: "blue" | "green" | "purple";
}) {
  const accent = tone === "green" ? palette.secondary : tone === "purple" ? "#6750a4" : palette.primaryStrong;

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 104,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    padding: spacing.md,
    ...cardShadow
  },
  accent: {
    borderRadius: 999,
    height: 4,
    marginBottom: spacing.sm,
    width: 30
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  label: {
    fontSize: 13,
    color: palette.textMuted
  }
});
