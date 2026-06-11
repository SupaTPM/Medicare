import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AppointmentSuccessModal } from "@/components/AppointmentSuccessModal";
import { BookingStepper } from "@/components/BookingStepper";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RatingStars } from "@/components/RatingStars";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusPill } from "@/components/StatusPill";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { cardShadow, softShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { Appointment, AvailabilitySlot, DoctorOption } from "@/types";

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  const formatted = new Intl.DateTimeFormat("es-EC", { weekday: "long", day: "numeric", month: "long" }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTimeLabel(slot: AvailabilitySlot) {
  const parts = slot.label.split("·");
  return parts.length > 1 ? parts[1].trim() : slot.label;
}

export function AppointmentSummaryScreen({ route, navigation }: any) {
  const { authError, createAppointment, patients, user } = useAppState();
  const doctor = route.params?.doctor as DoctorOption;
  const slot = route.params?.slot as AvailabilitySlot;
  const specialty = (route.params?.specialty as string | undefined) ?? doctor?.specialty;

  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  const initials = useMemo(() => initialsFromName(doctor?.name ?? "MD") || "MD", [doctor?.name]);
  const dateLabel = useMemo(() => formatDateLabel(slot.startsAt), [slot.startsAt]);
  const timeLabel = useMemo(() => formatTimeLabel(slot), [slot]);
  const patient = patients[0];
  const patientId = patient?.id;

  const canConfirm = Boolean(reason.trim()) && !saving;

  async function handleConfirm() {
    if (!patientId || !reason.trim()) {
      return;
    }

    setSaving(true);
    const created = await createAppointment({
      availability_slot_id: Number(slot.id),
      doctor_id: Number(doctor.id),
      patient_id: Number(patientId),
      reason: reason.trim(),
      scheduled_at: slot.startsAt,
      specialty,
      status: "confirmed"
    });
    setSaving(false);

    if (created) {
      setCreatedAppointment(created);
    }
  }

  function handleCloseSuccess() {
    setCreatedAppointment(null);
    navigation.navigate("Main");
  }

  return (
    <Screen contentContainerStyle={{ gap: spacing.md }}>
      <SectionTitle eyebrow="Nueva cita · Paso 3 de 3" title="Revisá tu turno" />
      <BookingStepper currentStep={3} />
      <Text style={styles.description}>
        Confirmá que todos los detalles de tu consulta sean correctos. Vas a poder ver el detalle completo en tu
        historial de citas.
      </Text>

      <View style={styles.heroCard}>
        <View style={styles.heroGlow} pointerEvents="none" />

        <View style={styles.heroHeader}>
          <View style={styles.avatarFrame}>
            {doctor.profilePhotoUrl ? (
              <Image source={{ uri: doctor.profilePhotoUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={["#eaf8ff", "#b9e8ee"]} style={styles.avatar}>
                <Text style={styles.initials}>{initials}</Text>
              </LinearGradient>
            )}
          </View>
          <View style={styles.doctorCopy}>
            <StatusPill label={specialty} tone="green" />
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <RatingStars rating={doctor.rating} reviewsCount={doctor.reviewsCount} />
          </View>
        </View>

        <View style={styles.bentoGrid}>
          <View style={styles.bentoCell}>
            <View style={styles.iconBadge}>
              <Ionicons color={palette.primaryStrong} name="calendar-outline" size={18} />
            </View>
            <Text style={styles.bentoLabel}>Fecha</Text>
            <Text style={styles.bentoValue}>{dateLabel}</Text>
          </View>
          <View style={styles.bentoCell}>
            <View style={styles.iconBadge}>
              <Ionicons color={palette.primaryStrong} name="time-outline" size={18} />
            </View>
            <Text style={styles.bentoLabel}>Horario</Text>
            <Text style={styles.bentoValue}>{timeLabel}</Text>
          </View>
        </View>

        {doctor.location ? (
          <View style={styles.locationCell}>
            <View style={[styles.iconBadge, styles.iconBadgeInline]}>
              <Ionicons color={palette.primaryStrong} name="location-outline" size={18} />
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.bentoLabel}>Ubicación</Text>
              <Text style={styles.bentoValue}>{doctor.location}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Detalles de la cita</Text>

        <View style={styles.detailRow}>
          <View>
            <Text style={styles.cardLabel}>Paciente</Text>
            <Text style={styles.cardValue}>{user?.name ?? "—"}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View>
            <Text style={styles.cardLabel}>Seguro médico</Text>
            <Text style={styles.cardValue}>
              {patient?.insuranceProvider
                ? `${patient.insuranceProvider}${patient.insuranceNumber ? ` · ${patient.insuranceNumber}` : ""}`
                : "No especificado"}
            </Text>
          </View>
          <Pressable hitSlop={8} onPress={() => navigation.navigate("PatientProfileEdit")}>
            <Text style={styles.linkAction}>Cambiar</Text>
          </Pressable>
        </View>

        <View style={[styles.detailRow, styles.detailRowLast]}>
          <TextField
            label="Motivo de consulta"
            multiline
            numberOfLines={4}
            onChangeText={setReason}
            placeholder="Describe brevemente el motivo de tu consulta"
            style={styles.reasonInput}
            value={reason}
          />
        </View>
      </View>

      <View style={styles.noteCard}>
        <Ionicons color={palette.primaryStrong} name="information-circle-outline" size={18} />
        <Text style={styles.noteText}>
          Podés cancelar o reprogramar este turno sin cargo hasta 24 horas antes de la cita.
        </Text>
      </View>

      {authError ? <Text style={styles.error}>{authError}</Text> : null}

      <PrimaryButton
        disabled={!canConfirm}
        icon="arrow-forward"
        label={saving ? "Confirmando..." : "Confirmar turno"}
        loading={saving}
        onPress={() => void handleConfirm()}
        style={styles.confirmButton}
      />

      <AppointmentSuccessModal appointment={createdAppointment} onClose={handleCloseSuccess} visible={Boolean(createdAppointment)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: 20,
    height: 72,
    justifyContent: "center",
    width: 72
  },
  avatarFrame: {
    height: 72,
    width: 72,
    ...softShadow
  },
  bentoCell: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 18,
    flex: 1,
    gap: 2,
    padding: spacing.md
  },
  bentoGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  bentoLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  bentoValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2
  },
  cardLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  cardValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4
  },
  confirmButton: {
    marginTop: spacing.xs
  },
  description: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  detailRow: {
    alignItems: "center",
    borderBottomColor: palette.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0
  },
  detailsCard: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.lg,
    ...cardShadow
  },
  detailsTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  doctorCopy: {
    flex: 1,
    gap: spacing.xs
  },
  doctorName: {
    color: palette.text,
    fontSize: 19,
    fontWeight: "900"
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "700"
  },
  heroCard: {
    backgroundColor: palette.surface,
    borderColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    padding: spacing.lg,
    position: "relative",
    ...cardShadow
  },
  heroGlow: {
    backgroundColor: palette.primaryFaint,
    borderRadius: 100,
    height: 200,
    position: "absolute",
    right: -70,
    top: -90,
    width: 200
  },
  heroHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: palette.primarySoft,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 36
  },
  iconBadgeInline: {
    marginBottom: 0
  },
  initials: {
    color: palette.primaryDeep,
    fontSize: 22,
    fontWeight: "900"
  },
  linkAction: {
    color: palette.primaryStrong,
    fontSize: 13,
    fontWeight: "800"
  },
  locationCell: {
    alignItems: "center",
    backgroundColor: palette.surfaceAlt,
    borderRadius: 18,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md
  },
  locationCopy: {
    flex: 1
  },
  noteCard: {
    alignItems: "flex-start",
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  noteText: {
    color: palette.primaryDeep,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  reasonInput: {
    marginTop: spacing.xs
  }
});
