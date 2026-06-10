import React from "react";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { cardShadow } from "@/theme/shadows";

export function QRScreen() {
  const { appointments } = useAppState();
  const appointment = appointments[0];

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionTitle eyebrow="Cita" title="Codigo QR" />
      <View style={styles.card}>
        <QRCode value={appointment.qrCode} size={210} />
        <Text style={styles.code}>{appointment.qrCode}</Text>
        <Text style={styles.meta}>{appointment.specialty}</Text>
        <Text style={styles.meta}>
          {appointment.dateLabel} | {appointment.timeLabel}
        </Text>
      </View>
      <PrimaryButton label="Compartir QR" />
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
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...cardShadow
  },
  code: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
    marginTop: spacing.lg
  },
  meta: {
    fontSize: 14,
    color: palette.textMuted,
    marginTop: spacing.xs
  }
});
