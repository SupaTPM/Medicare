import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusPill } from "@/components/StatusPill";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  waiting: "En espera",
  completed: "Completada",
  cancelled: "Cancelada"
};

function DetailItem({
  icon,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Ionicons color={palette.primaryStrong} name={icon} size={16} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

export function AppointmentDetailScreen({ route, navigation }: any) {
  const { appointments, user } = useAppState();
  const appointment = appointments.find((item) => item.id === route.params?.appointmentId) ?? appointments[0];
  const canRegisterAttention = user?.role === "doctor";
  const tone = appointment.status === "confirmed" ? "green" : appointment.status === "completed" ? "blue" : appointment.status === "cancelled" ? "red" : "yellow";

  return (
    <Screen contentContainerStyle={{ gap: spacing.md }}>
      <SectionTitle eyebrow="Detalle de cita" title={appointment.specialty} />

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <Ionicons color="#ffffff" name="person" size={22} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>{appointment.patientName}</Text>
            <Text style={styles.heroSubtitle}>con {appointment.doctorName}</Text>
          </View>
          <StatusPill label={STATUS_LABELS[appointment.status] ?? appointment.status} tone={tone} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.grid}>
          <DetailItem icon="medkit-outline" label="Medico" value={appointment.doctorName} />
          <DetailItem icon="calendar-outline" label="Fecha" value={appointment.dateLabel} />
          <DetailItem icon="time-outline" label="Hora" value={appointment.timeLabel} />
          <DetailItem icon="person-outline" label="Paciente" value={appointment.patientName} />
        </View>
        <View style={styles.divider} />
        <View style={styles.reasonBox}>
          <Ionicons color={palette.primaryStrong} name="chatbubble-ellipses-outline" size={16} />
          <View style={styles.flex}>
            <Text style={styles.label}>Motivo de consulta</Text>
            <Text style={styles.value}>{appointment.reason}</Text>
          </View>
        </View>
      </View>

      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Codigo QR de la cita</Text>
        <Text style={styles.qrSubtitle}>Presenta este codigo al llegar a tu cita</Text>
        <View style={styles.qrBox}>
          <QRCode value={appointment.qrCode} size={180} />
        </View>
        <Text style={styles.code}>{appointment.qrCode}</Text>
      </View>

      {canRegisterAttention ? (
        <PrimaryButton icon="medkit-outline" label="Registrar atencion" onPress={() => navigation.navigate("CreateMedicalRecord", { appointmentId: appointment.id })} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  heroCard: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.md,
    ...cardShadow
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  avatar: {
    alignItems: "center",
    backgroundColor: palette.primaryDeep,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  heroCopy: {
    flex: 1,
    gap: 2
  },
  heroName: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900"
  },
  heroSubtitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.md,
    ...cardShadow
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  detailItem: {
    alignItems: "flex-start",
    flexBasis: "45%",
    flexDirection: "row",
    flexGrow: 1,
    gap: spacing.sm
  },
  detailIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  detailCopy: {
    flex: 1,
    gap: 2
  },
  divider: {
    backgroundColor: palette.borderSoft,
    height: 1,
    marginVertical: spacing.md
  },
  reasonBox: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm
  },
  label: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  value: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2
  },
  qrCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: spacing.lg,
    ...cardShadow
  },
  qrTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  qrSubtitle: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: spacing.md,
    textAlign: "center"
  },
  qrBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: spacing.md
  },
  code: {
    color: palette.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.md,
    letterSpacing: 1
  }
});
