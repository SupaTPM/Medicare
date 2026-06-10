import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusPill } from "@/components/StatusPill";
import { Appointment } from "@/types";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function AppointmentCard({ item, onPress }: { item: Appointment; onPress?: () => void }) {
  const tone = item.status === "waiting" ? "yellow" : item.status === "confirmed" ? "green" : "gray";

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.timeBox}>
          <Text style={styles.time}>{item.timeLabel.replace(" AM", "")}</Text>
          <Text style={styles.timeSuffix}>{item.timeLabel.includes("AM") ? "AM" : "PM"}</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <Text style={styles.meta}>{item.patientName}</Text>
        </View>
        <StatusPill label={item.status} tone={tone} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.reason}>{item.reason}</Text>
        <Ionicons color={palette.textSubtle} name="chevron-forward" size={18} />
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm
  },
  timeBox: {
    alignItems: "center",
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    width: 56
  },
  time: {
    color: palette.primaryStrong,
    fontSize: 14,
    fontWeight: "800"
  },
  timeSuffix: {
    color: palette.textSubtle,
    fontSize: 10,
    fontWeight: "800"
  },
  headerCopy: {
    flex: 1
  },
  specialty: {
    fontSize: 17,
    fontWeight: "700",
    color: palette.text
  },
  meta: {
    fontSize: 13,
    color: palette.textSubtle
  },
  reason: {
    flex: 1,
    fontSize: 14,
    color: palette.text,
    fontWeight: "600"
  },
  footer: {
    alignItems: "center",
    borderTopColor: palette.borderSoft,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm
  }
});
