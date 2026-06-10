import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function MedicalRecordScreen() {
  const { medicalRecords } = useAppState();

  return (
    <Screen>
      <SectionTitle eyebrow="Historial" title="Registros clinicos" />
      {medicalRecords.map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.date}>{record.dateLabel}</Text>
          <Text style={styles.title}>{record.diagnosis}</Text>
          <Text style={styles.body}>{record.vitalSigns}</Text>
          <Text style={styles.body}>{record.treatment}</Text>
          <Text style={styles.note}>{record.notes}</Text>
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
  date: {
    fontSize: 13,
    color: palette.primaryStrong,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: palette.text,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: 14,
    color: palette.text,
    marginBottom: spacing.xs
  },
  note: {
    fontSize: 13,
    color: palette.textMuted,
    marginTop: spacing.sm
  }
});
