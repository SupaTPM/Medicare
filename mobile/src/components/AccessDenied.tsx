import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { palette } from "@/theme/palette";
import { cardShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function AccessDenied({ message }: { message?: string }) {
  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionTitle eyebrow="Acceso restringido" title="Acceso no disponible" />
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons color={palette.danger} name="lock-closed-outline" size={28} />
        </View>
        <Text style={styles.text}>
          {message ?? "Esta sección es solo para personal médico autorizado."}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1
  },
  card: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
    ...cardShadow
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: palette.dangerSoft,
    borderRadius: 22,
    height: 64,
    justifyContent: "center",
    width: 64
  },
  text: {
    color: palette.textMuted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center"
  }
});
