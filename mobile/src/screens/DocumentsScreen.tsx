import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function DocumentsScreen() {
  const { documents } = useAppState();

  return (
    <Screen>
      <SectionTitle eyebrow="Documentos" title="Archivos medicos" />
      {documents.map((document) => (
        <View key={document.id} style={styles.card}>
          <Text style={styles.title}>{document.title}</Text>
          <Text style={styles.meta}>
            {document.type} | {document.dateLabel}
          </Text>
          <Text style={styles.meta}>Subido por {document.uploadedBy}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...cardShadow
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
    marginBottom: spacing.xs
  },
  meta: {
    fontSize: 14,
    color: palette.textMuted,
    marginBottom: spacing.xs
  }
});
