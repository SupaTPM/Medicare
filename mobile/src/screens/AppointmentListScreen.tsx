import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppointmentCard } from "@/components/AppointmentCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function AppointmentListScreen() {
  const navigation = useNavigation<any>();
  const { appointments, loadingSections, user } = useAppState();
  const isPatient = user?.role === "patient";

  return (
    <Screen contentContainerStyle={{ gap: spacing.sm }}>
      <SectionTitle eyebrow="Agenda" title="Citas medicas" />
      <PrimaryButton
        icon="add-circle-outline"
        label="Crear cita"
        onPress={() => navigation.navigate(isPatient ? "SelectSpecialtyDoctor" : "CreateAppointment")}
        style={{ marginBottom: spacing.xs }}
      />
      {loadingSections.appointments ? <SkeletonList count={4} /> : appointments.map((item) => (
        <AppointmentCard item={item} key={item.id} onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: item.id })} />
      ))}
      {!loadingSections.appointments && !appointments.length ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons color={palette.primaryStrong} name="calendar-outline" size={26} />
          </View>
          <Text style={styles.emptyTitle}>Sin citas agendadas</Text>
          <Text style={styles.empty}>Crea una nueva cita para verla en tu agenda.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    gap: spacing.xs,
    padding: spacing.xl,
    ...cardShadow
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 52
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  empty: {
    color: palette.textMuted,
    fontSize: 13,
    textAlign: "center"
  }
});
