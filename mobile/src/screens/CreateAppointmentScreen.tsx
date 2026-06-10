import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FlowCard } from "@/components/FlowCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusPill } from "@/components/StatusPill";
import { TextField } from "@/components/TextField";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function CreateAppointmentScreen({ navigation }: any) {
  const [patient, setPatient] = useState("Maria Fernanda Lopez");
  const [saved, setSaved] = useState(false);

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
      <TextField label="Paciente" onChangeText={setPatient} value={patient} />
      <TextField defaultValue="Cardiologia" label="Especialidad" />
      <TextField defaultValue="Dr. Alejandro Solis" label="Medico" />
      <TextField defaultValue="12/06/2026 10:30" label="Fecha y hora" />
      <TextField defaultValue="Control cardiologico" label="Motivo" multiline />
      {saved ? (
        <View style={styles.savedBox}>
          <View style={styles.savedHeader}>
            <Text style={styles.savedTitle}>Cita preparada</Text>
            <StatusPill label="QR listo" tone="green" />
          </View>
          <Text style={styles.savedText}>Se genero el token APT-2026-0001 para validar asistencia.</Text>
        </View>
      ) : null}
      <PrimaryButton
        icon="qr-code-outline"
        label={saved ? "Volver al panel" : "Guardar cita y generar QR"}
        onPress={() => (saved ? navigation.navigate("Main") : setSaved(true))}
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
  }
});
