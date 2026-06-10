import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { palette } from "@/theme/palette";

type Tone = "blue" | "green" | "yellow" | "red" | "gray";

const tones: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: palette.primarySoft, fg: palette.primary },
  green: { bg: palette.successSoft, fg: palette.secondary },
  yellow: { bg: palette.warningSoft, fg: "#8a5a00" },
  red: { bg: palette.dangerSoft, fg: palette.danger },
  gray: { bg: palette.surfaceAlt, fg: palette.textMuted }
};

export function StatusPill({ label, tone = "blue" }: { label: string; tone?: Tone }) {
  const colors = tones[tone];

  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  text: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  }
});
