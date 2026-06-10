import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusPill } from "@/components/StatusPill";
import { Patient } from "@/types";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function PatientCard({ item, onPress }: { item: Patient; onPress?: () => void }) {
  const hasAllergy = item.allergies.some((allergy) => allergy !== "Ninguna registrada");

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{item.fullName.split(" ").slice(0, 2).map((part) => part[0]).join("")}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.meta}>C.I. {item.cedula} | {item.age} anos | {item.bloodType}</Text>
        </View>
        <Ionicons color={palette.textSubtle} name="chevron-forward" size={18} />
      </View>
      <View style={styles.metaRow}>
        <StatusPill label={hasAllergy ? "Alergia" : "Sin alergias"} tone={hasAllergy ? "red" : "green"} />
        <Text style={styles.footer}>Ultima: {item.lastVisit}</Text>
      </View>
    </Pressable>
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  avatar: {
    alignItems: "center",
    backgroundColor: palette.surfaceAccent,
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  initials: {
    color: palette.primaryStrong,
    fontSize: 14,
    fontWeight: "900"
  },
  copy: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  meta: {
    fontSize: 13,
    color: palette.textMuted,
    marginBottom: 2
  },
  footer: {
    fontSize: 13,
    color: palette.textSubtle
  },
  metaRow: {
    alignItems: "center",
    borderTopColor: palette.borderSoft,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm
  }
});
