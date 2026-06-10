import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { FlowCard } from "@/components/FlowCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StatusPill } from "@/components/StatusPill";
import { TextField } from "@/components/TextField";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function CreateMedicalRecordScreen({ navigation }: any) {
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
        <Text style={styles.alertText}>Alergia critica: revisar penicilina antes de recetar.</Text>
        <StatusPill label="Alerta" tone="red" />
      </View>
      <TextField defaultValue="Dolor de garganta y fiebre desde hace 2 dias" label="Motivo de consulta" multiline />
      <TextField defaultValue="Fiebre, tos leve, dolor faringeo" label="Sintomas" multiline />
      <TextField defaultValue="120/80" label="Presion arterial" />
      <TextField defaultValue="37.8" label="Temperatura" />
      <TextField defaultValue="68 kg" label="Peso" />
      <TextField defaultValue="1.68 m" label="Altura" />
      <TextField defaultValue="Faringitis aguda probable" label="Diagnostico" multiline />
      <TextField defaultValue="Hidratacion, antipiretico y control si persiste fiebre" label="Tratamiento" multiline />
      <TextField defaultValue="Reposo relativo y seguimiento en 72 horas" label="Recomendaciones" multiline />
      <PrimaryButton icon="sparkles-outline" label="Generar resumen con IA" onPress={() => navigation.navigate("AIAssistantStack")} variant="secondary" />
      <PrimaryButton icon="checkmark-done-outline" label="Guardar atencion" onPress={() => navigation.navigate("Main")} />
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
  }
});
