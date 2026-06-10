import React from "react";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusPill } from "@/components/StatusPill";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function AppointmentDetailScreen({ route, navigation }: any) {
  const { appointments, user } = useAppState();
  const appointment = appointments.find((item) => item.id === route.params?.appointmentId) ?? appointments[0];
  const canRegisterAttention = user?.role === "doctor";

  return (
    <Screen>
      <SectionTitle eyebrow="Detalle de cita" title={appointment.specialty} />
      <View style={styles.card}>
        <View style={styles.detailHeader}>
          <Text style={styles.value}>{appointment.patientName}</Text>
          <StatusPill label={appointment.status} tone={appointment.status === "confirmed" ? "green" : "yellow"} />
        </View>
        <Text style={styles.label}>Paciente</Text>
        <Text style={styles.value}>{appointment.patientName}</Text>
        <Text style={styles.label}>Medico</Text>
        <Text style={styles.value}>{appointment.doctorName}</Text>
        <Text style={styles.label}>Fecha</Text>
        <Text style={styles.value}>{appointment.dateLabel} | {appointment.timeLabel}</Text>
        <Text style={styles.label}>Motivo</Text>
        <Text style={styles.value}>{appointment.reason}</Text>
      </View>
      <View style={styles.qrCard}>
        <QRCode value={appointment.qrCode} size={180} />
        <Text style={styles.code}>{appointment.qrCode}</Text>
      </View>
      {canRegisterAttention ? (
        <PrimaryButton icon="medkit-outline" label="Registrar atencion" onPress={() => navigation.navigate("CreateMedicalRecord", { appointmentId: appointment.id })} />
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
    marginBottom: spacing.md,
    ...cardShadow
  },
  detailHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  label: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.sm,
    textTransform: "uppercase"
  },
  value: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  qrCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...cardShadow
  },
  code: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.md
  }
});
