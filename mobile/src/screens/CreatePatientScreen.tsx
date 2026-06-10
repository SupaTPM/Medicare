import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { FlowCard } from "@/components/FlowCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { TextField } from "@/components/TextField";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function CreatePatientScreen({ navigation }: any) {
  return (
    <Screen contentContainerStyle={{ gap: spacing.sm }}>
      <SectionTitle eyebrow="Registro" title="Nuevo paciente" />
      <FlowCard
        icon="shield-checkmark-outline"
        meta="Identidad, contacto, alergias y antecedentes"
        status="Recepcion"
        title="Ficha minima para admision segura"
        tone="green"
      />
      <TextField defaultValue="Maria Fernanda Lopez" label="Nombres completos" />
      <TextField defaultValue="0911122233" keyboardType="number-pad" label="Cedula" />
      <TextField defaultValue="1992-08-12" label="Fecha de nacimiento" />
      <TextField defaultValue="Femenino" label="Sexo" />
      <TextField defaultValue="A+" label="Tipo de sangre" />
      <TextField defaultValue="0981112233" keyboardType="phone-pad" label="Telefono" />
      <TextField defaultValue="Penicilina" label="Alergias" />
      <TextField defaultValue="Hipertension" label="Enfermedades previas" />
      <View style={styles.notice}>
        <Text style={styles.noticeText}>La validacion por cedula debe usar fuente autorizada y consentimiento.</Text>
      </View>
      <PrimaryButton icon="save-outline" label="Guardar paciente" onPress={() => navigation.navigate("Main")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: palette.warningSoft,
    borderRadius: 14,
    padding: spacing.md
  },
  noticeText: {
    color: "#8a5a00",
    fontSize: 13,
    fontWeight: "700"
  }
});
