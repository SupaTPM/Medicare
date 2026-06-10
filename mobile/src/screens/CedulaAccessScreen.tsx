import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PatientCard } from "@/components/PatientCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function CedulaAccessScreen() {
  const { patients } = useAppState();
  const [cedula, setCedula] = useState("1312345678");
  const patient = patients.find((item) => item.cedula.includes(cedula));

  return (
    <Screen>
      <SectionTitle eyebrow="Acceso rapido" title="Buscar por cedula" />
      <TextField keyboardType="number-pad" label="Cedula" onChangeText={setCedula} value={cedula} />
      <View style={styles.result}>
        {patient ? (
          <PatientCard item={patient} />
        ) : (
          <Text style={styles.empty}>No se encontro paciente con esa cedula.</Text>
        )}
      </View>
      <PrimaryButton label="Solicitar validacion en recepcion" disabled={!patient} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  result: {
    marginVertical: spacing.lg
  },
  empty: {
    color: palette.textMuted,
    fontSize: 15
  }
});
