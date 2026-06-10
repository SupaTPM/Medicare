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

export function CreateMedicalRecordScreen({ navigation }: any) {
  const { appointments, authError, createMedicalRecord, patients, user } = useAppState();
  const [appointmentId, setAppointmentId] = useState(appointments[0]?.id ?? "");
  const [consultationReason, setConsultationReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [saving, setSaving] = useState(false);
  const appointment = appointments.find((item) => item.id === appointmentId);
  const patient = appointment ? patients.find((item) => item.fullName === appointment.patientName) : patients[0];

  async function handleSave() {
    if (!appointment || !patient || !user) {
      return;
    }

    setSaving(true);
    const saved = await createMedicalRecord({
      appointment_id: Number(appointment.id),
      patient_id: Number(patient.id),
      doctor_id: Number(user.id),
      consultation_reason: consultationReason,
      symptoms,
      blood_pressure: bloodPressure,
      temperature: temperature ? Number(temperature) : undefined,
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      diagnosis,
      treatment,
      recommendations
    });
    setSaving(false);

    if (saved) {
      navigation.navigate("Main");
    }
  }

  return (
    <Screen contentContainerStyle={{ gap: spacing.sm }}>
      <SectionTitle eyebrow="Atencion" title="Registro medico" />
      <FlowCard
        icon="clipboard-outline"
        meta="Signos vitales, diagnostico, tratamiento y resumen asistido"
        status="En consulta"
        title="Registro clinico estructurado"
        tone="yellow"
      />
      <View style={styles.alertStrip}>
        <Text style={styles.alertText}>{patient ? `Paciente: ${patient.fullName}` : "Selecciona una cita existente."}</Text>
        <StatusPill label="Alerta" tone="red" />
      </View>
      <TextField label="ID cita" onChangeText={setAppointmentId} value={appointmentId} />
      <TextField label="Motivo de consulta" multiline onChangeText={setConsultationReason} value={consultationReason} />
      <TextField label="Sintomas" multiline onChangeText={setSymptoms} value={symptoms} />
      <TextField label="Presion arterial" onChangeText={setBloodPressure} value={bloodPressure} />
      <TextField keyboardType="decimal-pad" label="Temperatura" onChangeText={setTemperature} value={temperature} />
      <TextField keyboardType="decimal-pad" label="Peso" onChangeText={setWeight} value={weight} />
      <TextField keyboardType="decimal-pad" label="Altura" onChangeText={setHeight} value={height} />
      <TextField label="Diagnostico" multiline onChangeText={setDiagnosis} value={diagnosis} />
      <TextField label="Tratamiento" multiline onChangeText={setTreatment} value={treatment} />
      <TextField label="Recomendaciones" multiline onChangeText={setRecommendations} value={recommendations} />
      {authError ? <Text style={styles.error}>{authError}</Text> : null}
      <PrimaryButton icon="sparkles-outline" label="Generar resumen con IA" onPress={() => navigation.navigate("AIAssistantStack")} variant="secondary" />
      <PrimaryButton icon="checkmark-done-outline" label={saving ? "Guardando..." : "Guardar atencion real"} onPress={() => void handleSave()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  alertStrip: {
    alignItems: "center",
    backgroundColor: palette.dangerSoft,
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.md
  },
  alertText: {
    color: palette.danger,
    flex: 1,
    fontSize: 13,
    fontWeight: "800"
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "700"
  }
});
