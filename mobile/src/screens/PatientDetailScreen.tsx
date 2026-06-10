import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { AlertBox } from "@/components/AlertBox";
import { FlowCard } from "@/components/FlowCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { isStaff } from "@/utils/roles";

export function PatientDetailScreen({ route, navigation }: any) {
  const { patients, medicalRecords, user } = useAppState();
  const patient = patients.find((item) => item.id === route.params?.patientId) ?? patients[0];
  const records = medicalRecords.filter((item) => item.patientId === patient.id);

  return (
    <Screen>
      <SectionTitle eyebrow="Paciente" title={patient.fullName} />
      <FlowCard
        icon="person-circle-outline"
        meta={`CI ${patient.cedula} | ${patient.age} anos | sangre ${patient.bloodType}`}
        status="Ficha activa"
        title="Identificacion clinica"
        tone="blue"
      />
      <View style={styles.card}>
        <Text style={styles.row}>Cedula: {patient.cedula}</Text>
        <Text style={styles.row}>Edad: {patient.age}</Text>
        <Text style={styles.row}>Sangre: {patient.bloodType}</Text>
        <Text style={styles.row}>Telefono: {patient.phone}</Text>
      </View>
      <AlertBox item={{ id: "allergy", tone: patient.allergies[0] === "Ninguna registrada" ? "info" : "danger", title: "Alergias", body: patient.allergies.join(", ") }} />
      {isStaff(user) ? (
        <PrimaryButton icon="medkit-outline" label="Registrar atencion" onPress={() => navigation.navigate("CreateMedicalRecord", { patientId: patient.id })} />
      ) : null}
      <PrimaryButton icon="folder-open-outline" label="Ver documentos" onPress={() => navigation.navigate("PatientDocuments", { patientId: patient.id })} style={styles.button} variant="secondary" />
      <SectionTitle eyebrow="Historial" title="Ultimas atenciones" />
      {records.length ? records.map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.title}>{record.diagnosis}</Text>
          <Text style={styles.row}>{record.dateLabel}</Text>
          <Text style={styles.row}>{record.notes}</Text>
        </View>
      )) : <Text style={styles.empty}>Sin registros clinicos para este paciente.</Text>}
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
  row: {
    color: palette.text,
    fontSize: 14,
    marginBottom: spacing.xs
  },
  title: {
    color: palette.primaryStrong,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  empty: {
    color: palette.textMuted,
    fontSize: 14
  },
  button: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg
  }
});
