import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { AppointmentCard } from "@/components/AppointmentCard";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { useAppState } from "@/state/AppContext";
import { Appointment } from "@/types";
import { cardShadow, softShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { getDoctorPhotoUri } from "@/utils/avatar";
import { getCountdownLabel, getRelativeDayLabel } from "@/utils/dateGroups";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "upcoming", label: "Próximas" },
  { key: "past", label: "Pasadas" }
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const PAST_STATUSES = new Set(["completed", "cancelled", "no_show"]);

function isUpcoming(item: Appointment) {
  if (PAST_STATUSES.has(item.status)) {
    return false;
  }
  return new Date(item.scheduledAt).getTime() >= Date.now();
}

function byScheduledAt(direction: 1 | -1) {
  return (a: Appointment, b: Appointment) =>
    direction * (new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export function AppointmentListScreen() {
  const navigation = useNavigation<any>();
  const { appointments, loadingSections, user } = useAppState();
  const isPatient = user?.role === "patient";
  const [filter, setFilter] = useState<FilterKey>("all");

  const upcoming = useMemo(
    () => appointments.filter(isUpcoming).sort(byScheduledAt(1)),
    [appointments]
  );
  const past = useMemo(
    () => appointments.filter((item) => !isUpcoming(item)).sort(byScheduledAt(-1)),
    [appointments]
  );
  const nextAppointment = upcoming[0] ?? null;

  const filteredAppointments = useMemo(() => {
    if (filter === "upcoming") {
      return upcoming;
    }
    if (filter === "past") {
      return past;
    }
    return [...upcoming, ...past];
  }, [upcoming, past, filter]);

  const listAppointments = useMemo(() => {
    if (filter === "past" || !nextAppointment) {
      return filteredAppointments;
    }
    return filteredAppointments.filter((item) => item.id !== nextAppointment.id);
  }, [filteredAppointments, filter, nextAppointment]);

  const groups = useMemo(() => {
    const result: { label: string; items: Appointment[] }[] = [];
    for (const item of listAppointments) {
      const label = getRelativeDayLabel(item.scheduledAt);
      const lastGroup = result[result.length - 1];
      if (lastGroup?.label === label) {
        lastGroup.items.push(item);
      } else {
        result.push({ label, items: [item] });
      }
    }
    return result;
  }, [listAppointments]);

  const showHero = filter !== "past" && Boolean(nextAppointment);
  const heroTitle = nextAppointment ? (isPatient ? nextAppointment.doctorName : nextAppointment.patientName) : "";
  const heroSubtitle = nextAppointment
    ? isPatient
      ? nextAppointment.specialty
      : `${nextAppointment.specialty} · ${nextAppointment.doctorName}`
    : "";

  return (
    <Screen contentContainerStyle={{ gap: spacing.md }}>
      <SectionTitle
        action={
          <Pressable
            onPress={() => navigation.navigate(isPatient ? "SelectSpecialtyDoctor" : "CreateAppointment")}
            style={({ pressed }) => [styles.newButton, pressed ? styles.newButtonPressed : null]}
          >
            <Ionicons color="#ffffff" name="add" size={18} />
            <Text style={styles.newButtonText}>Nueva</Text>
          </Pressable>
        }
        eyebrow="Agenda"
        title="Mis citas"
      />

      {showHero && nextAppointment ? (
        <Pressable
          onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: nextAppointment.id })}
          style={({ pressed }) => [styles.heroCard, pressed ? styles.heroCardPressed : null]}
        >
          <View style={styles.heroAccent} />
          <View style={styles.heroBody}>
            <Text style={styles.heroEyebrow}>
              Próximo turno · <Text style={styles.heroCountdown}>{getCountdownLabel(nextAppointment.scheduledAt)}</Text>
            </Text>
            <View style={styles.heroRow}>
              {isPatient ? (
                <Image source={{ uri: getDoctorPhotoUri({ id: nextAppointment.doctorId, name: nextAppointment.doctorName, profilePhotoUrl: nextAppointment.doctorPhotoUrl }) }} style={styles.heroAvatar} />
              ) : (
                <View style={styles.heroIconAvatar}>
                  <Ionicons color={palette.primaryStrong} name="person-outline" size={24} />
                </View>
              )}
              <View style={styles.heroCopy}>
                <Text numberOfLines={1} style={styles.heroName}>
                  {heroTitle}
                </Text>
                <Text numberOfLines={1} style={styles.heroSpecialty}>
                  {heroSubtitle}
                </Text>
                <View style={styles.heroMetaRow}>
                  <View style={styles.heroMetaItem}>
                    <Ionicons color={palette.textSubtle} name="calendar-outline" size={13} />
                    <Text style={styles.heroMetaText}>{nextAppointment.dateLabel}</Text>
                  </View>
                  <View style={styles.heroMetaItem}>
                    <Ionicons color={palette.textSubtle} name="time-outline" size={13} />
                    <Text style={styles.heroMetaText}>{nextAppointment.timeLabel}</Text>
                  </View>
                </View>
              </View>
              <Ionicons color={palette.primaryStrong} name="chevron-forward" size={20} />
            </View>
          </View>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.filterRow} horizontal showsHorizontalScrollIndicator={false}>
        {FILTERS.map((item) => {
          const active = filter === item.key;
          const count = item.key === "all" ? appointments.length : item.key === "upcoming" ? upcoming.length : past.length;
          return (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[styles.filterChip, active ? styles.filterChipActive : null]}
            >
              <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>
                {item.label} · {count}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loadingSections.appointments ? (
        <SkeletonList count={4} />
      ) : (
        groups.map((group) => (
          <View key={group.label} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.groupRule} />
            </View>
            {group.items.map((item) => (
              <AppointmentCard item={item} key={item.id} onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: item.id })} />
            ))}
          </View>
        ))
      )}

      {!loadingSections.appointments && !groups.length && !showHero ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons color={palette.primaryStrong} name="calendar-outline" size={26} />
          </View>
          <Text style={styles.emptyTitle}>Sin citas {filter === "upcoming" ? "próximas" : filter === "past" ? "pasadas" : "agendadas"}</Text>
          <Text style={styles.empty}>
            {filter === "all"
              ? "Creá una cita nueva para verla en tu agenda."
              : "Probá con otro filtro para ver el resto de tus citas."}
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  newButton: {
    alignItems: "center",
    backgroundColor: palette.primaryStrong,
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...softShadow
  },
  newButtonPressed: {
    opacity: 0.9
  },
  newButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800"
  },
  heroCard: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    ...cardShadow
  },
  heroCardPressed: {
    opacity: 0.92
  },
  heroAccent: {
    backgroundColor: palette.primaryStrong,
    width: 5
  },
  heroBody: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  heroEyebrow: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  heroCountdown: {
    color: palette.primaryStrong
  },
  heroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  heroAvatar: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    height: 52,
    width: 52
  },
  heroIconAvatar: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  heroCopy: {
    flex: 1,
    gap: 2
  },
  heroName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  heroSpecialty: {
    color: palette.textSubtle,
    fontSize: 13,
    fontWeight: "600"
  },
  heroMetaRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: 2
  },
  heroMetaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4
  },
  heroMetaText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  filterRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs
  },
  filterChip: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  filterChipActive: {
    backgroundColor: palette.primaryStrong
  },
  filterChipText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  filterChipTextActive: {
    color: "#ffffff"
  },
  group: {
    gap: spacing.sm
  },
  groupHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs
  },
  groupLabel: {
    color: palette.textSubtle,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  groupRule: {
    backgroundColor: palette.borderSoft,
    flex: 1,
    height: StyleSheet.hairlineWidth
  },
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
