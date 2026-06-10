import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function SectionTitle({
  eyebrow,
  title,
  action
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.text
  }
});
