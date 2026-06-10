import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AlertItem } from "@/types";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function AlertBox({ item }: { item: AlertItem }) {
  const toneStyles =
    item.tone === "danger"
      ? { bg: palette.dangerSoft, fg: palette.danger }
      : item.tone === "warning"
        ? { bg: "#FEF3C7", fg: "#92400E" }
        : { bg: palette.surfaceAccent, fg: palette.primaryStrong };

  return (
    <View style={[styles.box, { backgroundColor: toneStyles.bg }]}>
      <Text style={[styles.title, { color: toneStyles.fg }]}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  body: {
    fontSize: 14,
    color: palette.text
  }
});
