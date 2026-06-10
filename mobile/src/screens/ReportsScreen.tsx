import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { spacing } from "@/theme/spacing";

export function ReportsScreen() {
  return (
    <Screen>
      <SectionTitle eyebrow="Reportes" title="Indicadores clinicos" />
      <View style={styles.row}>
        <StatCard label="Pacientes nuevos" value="34" />
        <StatCard label="Canceladas" value="8" />
      </View>
      <View style={styles.row}>
        <StatCard label="Especialidad top" value="Cardio" />
        <StatCard label="Promedio atencion" value="21m" />
      </View>
      <View style={styles.row}>
        <StatCard label="Alertas activas" value="4" />
        <StatCard label="Documentos" value="52" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm
  }
});
