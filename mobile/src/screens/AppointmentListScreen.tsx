import React from "react";
import { useNavigation } from "@react-navigation/native";

import { AppointmentCard } from "@/components/AppointmentCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";
import { spacing } from "@/theme/spacing";

export function AppointmentListScreen() {
  const navigation = useNavigation<any>();
  const { appointments } = useAppState();

  return (
    <Screen>
      <SectionTitle eyebrow="Agenda" title="Citas medicas" />
      <PrimaryButton label="Crear cita" onPress={() => navigation.navigate("CreateAppointment")} style={{ marginBottom: spacing.md }} />
      {appointments.map((item) => (
        <AppointmentCard item={item} key={item.id} onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: item.id })} />
      ))}
    </Screen>
  );
}
