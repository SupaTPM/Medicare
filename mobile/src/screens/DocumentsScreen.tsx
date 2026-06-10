import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function DocumentsScreen({ route }: any) {
  const { documents, isSyncing } = useAppState();
  const patientId = route?.params?.patientId as string | undefined;
  const visibleDocuments = patientId ? documents.filter((document) => document.patientId === patientId) : documents;

  return (
    <Screen>
      <SectionTitle eyebrow="Documentos" title="Archivos medicos" />
      {isSyncing ? <SkeletonList count={3} /> : visibleDocuments.map((document) => (
        <View key={document.id} style={styles.card}>
          <Text style={styles.title}>{document.title}</Text>
          <Text style={styles.meta}>
            {document.type} | {document.dateLabel}
          </Text>
          <Text style={styles.meta}>Subido por {document.uploadedBy}</Text>
        </View>
      ))}
      {!isSyncing && !visibleDocuments.length ? <Text style={styles.empty}>Aun no hay documentos reales.</Text> : null}
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
  },
  empty: {
    color: palette.textMuted,
    fontSize: 14
  }
});
