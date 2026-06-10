import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

const DOCUMENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  lab: "flask-outline",
  laboratorio: "flask-outline",
  imaging: "scan-outline",
  imagen: "scan-outline",
  prescription: "medkit-outline",
  receta: "medkit-outline",
  report: "document-text-outline",
  informe: "document-text-outline"
};

function iconForDocument(type: string): keyof typeof Ionicons.glyphMap {
  return DOCUMENT_ICONS[type.toLowerCase()] ?? "document-attach-outline";
}

export function DocumentsScreen({ route }: any) {
  const { documents, loadingSections } = useAppState();
  const patientId = route?.params?.patientId as string | undefined;
  const visibleDocuments = patientId ? documents.filter((document) => document.patientId === patientId) : documents;

  return (
    <Screen contentContainerStyle={{ gap: spacing.sm }}>
      <SectionTitle eyebrow="Documentos" title="Archivos medicos" />
      {loadingSections.documents ? <SkeletonList count={3} /> : visibleDocuments.map((document) => (
        <View key={document.id} style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons color={palette.primaryStrong} name={iconForDocument(document.type)} size={22} />
          </View>
          <View style={styles.copy}>
            <Text numberOfLines={1} style={styles.title}>{document.title}</Text>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{document.type}</Text>
              </View>
              <Text style={styles.meta}>{document.dateLabel}</Text>
            </View>
            <View style={styles.uploaderRow}>
              <Ionicons color={palette.textSubtle} name="person-circle-outline" size={14} />
              <Text style={styles.meta}>Subido por {document.uploadedBy}</Text>
            </View>
          </View>
        </View>
      ))}
      {!loadingSections.documents && !visibleDocuments.length ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons color={palette.primaryStrong} name="folder-open-outline" size={26} />
          </View>
          <Text style={styles.emptyTitle}>Sin documentos</Text>
          <Text style={styles.empty}>Aun no hay documentos medicos registrados.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    ...cardShadow
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.text
  },
  tagRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  tag: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  tagText: {
    color: palette.primaryDeep,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  uploaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  meta: {
    fontSize: 13,
    color: palette.textMuted
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    gap: spacing.xs,
    padding: spacing.xl,
    ...cardShadow
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 52
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  empty: {
    color: palette.textMuted,
    fontSize: 13,
    textAlign: "center"
  }
});
