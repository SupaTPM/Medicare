import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { cardShadow } from "@/theme/shadows";

export function AIAssistantScreen() {
  return (
    <Screen>
      <SectionTitle eyebrow="Asistente IA" title="Soporte clinico operativo" />
      <View style={styles.card}>
        <Text style={styles.heading}>Resumen sugerido</Text>
        <Text style={styles.body}>
          Paciente con antecedente de hipertension y alergia a penicilina. Se recomienda verificar presion
          arterial antes de indicar tratamiento y evitar antibioticos derivados de penicilina.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Campos faltantes detectados</Text>
        <Text style={styles.body}>Falta registrar temperatura, peso y fecha de proximo control.</Text>
      </View>
      <PrimaryButton label="Generar resumen de consulta" />
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
    marginBottom: spacing.sm,
    ...cardShadow
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.primaryStrong,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.text
  }
});
