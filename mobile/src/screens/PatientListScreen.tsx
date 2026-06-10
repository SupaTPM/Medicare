import React from "react";
import { useNavigation } from "@react-navigation/native";

import { PatientCard } from "@/components/PatientCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { useAppState } from "@/state/AppContext";
import { spacing } from "@/theme/spacing";

export function PatientListScreen() {
  const navigation = useNavigation<any>();
  const { isSyncing, patients } = useAppState();

  return (
    <Screen>
      <SectionTitle eyebrow="Pacientes" title="Registro y consulta" />
      <PrimaryButton label="Registrar paciente" onPress={() => navigation.navigate("CreatePatient")} style={{ marginBottom: spacing.md }} />
      {isSyncing ? <SkeletonList count={4} /> : patients.map((item) => (
        <PatientCard item={item} key={item.id} onPress={() => navigation.navigate("PatientDetail", { patientId: item.id })} />
      ))}
    </Screen>
  );
}
