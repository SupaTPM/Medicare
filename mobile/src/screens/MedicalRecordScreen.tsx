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

export function MedicalRecordScreen() {
  const { loadingSections, medicalRecords } = useAppState();

  return (
    <Screen contentContainerStyle={{ gap: spacing.sm }}>
      <SectionTitle eyebrow="Historial" title="Registros clinicos" />
      {loadingSections.medicalRecords ? <SkeletonList count={3} /> : medicalRecords.map((record) => {
        const vitals = record.vitalSigns
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item && item.toLowerCase() !== "sin signos vitales");

        return (
          <View key={record.id} style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconBox}>
                <Ionicons color={palette.primaryStrong} name="document-text-outline" size={20} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>{record.diagnosis}</Text>
                <View style={styles.dateRow}>
                  <Ionicons color={palette.textSubtle} name="calendar-outline" size={13} />
                  <Text style={styles.date}>{record.dateLabel}</Text>
                </View>
              </View>
            </View>

            {vitals.length ? (
              <View style={styles.vitalsWrap}>
                {vitals.map((vital) => (
                  <View key={vital} style={styles.vitalChip}>
                    <Ionicons color={palette.primaryDeep} name="pulse-outline" size={13} />
                    <Text style={styles.vitalText}>{vital}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tratamiento</Text>
              <Text style={styles.sectionBody}>{record.treatment}</Text>
            </View>

            <View style={styles.noteBox}>
              <Ionicons color={palette.secondary} name="chatbox-ellipses-outline" size={16} />
              <Text style={styles.noteText}>{record.notes}</Text>
            </View>
          </View>
        );
      })}
      {!loadingSections.medicalRecords && !medicalRecords.length ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons color={palette.primaryStrong} name="document-text-outline" size={26} />
          </View>
          <Text style={styles.emptyTitle}>Sin registros</Text>
          <Text style={styles.empty}>Aun no hay registros clinicos reales.</Text>
        </View>
      ) : null}
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
    gap: spacing.sm,
    ...cardShadow
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  headerCopy: {
    flex: 1,
    gap: 2
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.text
  },
  dateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  date: {
    fontSize: 12,
    color: palette.textSubtle,
    fontWeight: "700"
  },
  vitalsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  vitalChip: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  vitalText: {
    color: palette.primaryDeep,
    fontSize: 12,
    fontWeight: "800"
  },
  section: {
    gap: 2
  },
  sectionLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  sectionBody: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "600"
  },
  noteBox: {
    alignItems: "flex-start",
    backgroundColor: palette.successSoft,
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  noteText: {
    color: palette.secondary,
    flex: 1,
    fontSize: 13,
    fontWeight: "600"
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
