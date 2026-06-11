import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { palette } from "@/theme/palette";

export type Tone = "blue" | "green" | "yellow" | "red" | "gray";

const tones: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: palette.primarySoft, fg: palette.primary },
  green: { bg: palette.successSoft, fg: palette.secondary },
  yellow: { bg: palette.warningSoft, fg: "#8a5a00" },
  red: { bg: palette.dangerSoft, fg: palette.danger },
  gray: { bg: palette.surfaceAlt, fg: palette.textMuted }
};

export function StatusPill({ label, tone = "blue", dot = false }: { label: string; tone?: Tone; dot?: boolean }) {
  const colors = tones[tone];

  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: colors.fg }]} /> : null}
      <Text style={[styles.text, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  dot: {
    borderRadius: 999,
    height: 6,
    width: 6
  },
  text: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  }
});
