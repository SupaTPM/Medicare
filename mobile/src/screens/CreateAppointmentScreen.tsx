import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FlowCard } from "@/components/FlowCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusPill } from "@/components/StatusPill";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

function parseScheduledAt(value: string) {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);

  if (match) {
    const [, day, month, year, hour, minute] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:00`;
  }

  return trimmedValue;
}

export function CreateAppointmentScreen({ navigation }: any) {
  const { authError, createAppointment, patients, users } = useAppState();
  const [patient, setPatient] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [doctor, setDoctor] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [reason, setReason] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const selectedPatient = patients.find((item) => item.cedula === patient || item.fullName.toLowerCase() === patient.toLowerCase());
    const selectedDoctor = users.find((item) => item.role === "doctor" && (item.email === doctor || item.name.toLowerCase() === doctor.toLowerCase()));

    if (!selectedPatient) {
      return;
    }

    setSaving(true);
    const created = await createAppointment({
      patient_id: Number(selectedPatient.id),
      doctor_id: selectedDoctor ? Number(selectedDoctor.id) : undefined,
      specialty,
      scheduled_at: parseScheduledAt(scheduledAt),
      reason,
      status: "confirmed"
    });
    setSaving(false);
    setSaved(created);
  }

  return (
    <Screen contentContainerStyle={{ gap: spacing.sm }}>
      <SectionTitle eyebrow="Nueva cita" title="Agendar atencion" />
      <FlowCard
        icon="git-branch-outline"
        meta="Paciente, especialidad, medico, horario y QR"
        status="Paso 2 de 3"
        title="Agenda con validacion en recepcion"
        tone="blue"
      />
      <TextField label="Paciente" onChangeText={setPatient} placeholder="Cedula o nombre exacto" value={patient} />
      <TextField label="Especialidad" onChangeText={setSpecialty} value={specialty} />
      <TextField label="Medico" onChangeText={setDoctor} placeholder="Email o nombre exacto" value={doctor} />
      <TextField label="Fecha y hora" onChangeText={setScheduledAt} placeholder="2026-06-12T10:30:00" value={scheduledAt} />
      <TextField label="Motivo" multiline onChangeText={setReason} value={reason} />
      {authError ? <Text style={styles.error}>{authError}</Text> : null}
      {!patients.find((item) => item.cedula === patient || item.fullName.toLowerCase() === patient.toLowerCase()) && patient ? (
        <Text style={styles.error}>Paciente no encontrado. Crea el paciente primero.</Text>
      ) : null}
      {saved ? (
        <View style={styles.savedBox}>
          <View style={styles.savedHeader}>
            <Text style={styles.savedTitle}>Cita preparada</Text>
            <StatusPill label="QR listo" tone="green" />
          </View>
          <Text style={styles.savedText}>Se genero una cita real y su token QR en Supabase.</Text>
        </View>
      ) : null}
      <PrimaryButton
        icon="qr-code-outline"
        label={saved ? "Volver al panel" : saving ? "Guardando..." : "Guardar cita y generar QR"}
        onPress={() => (saved ? navigation.navigate("Main") : void handleSave())}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  savedBox: {
    backgroundColor: palette.successSoft,
    borderRadius: 14,
    padding: spacing.md
  },
  savedHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  savedTitle: {
    color: palette.secondary,
    fontSize: 16,
    fontWeight: "800"
  },
  savedText: {
    color: palette.text,
    fontSize: 14
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "700"
  }
});
