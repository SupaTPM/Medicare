import React, { useEffect, useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SkeletonList } from "@/components/Skeleton";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { DoctorOption } from "@/types";

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function MetricCard({
  icon,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Ionicons color={palette.primaryStrong} name={icon} size={18} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons color={palette.primaryStrong} name={icon} size={16} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function DoctorProfileScreen({ route, navigation }: any) {
  const { getDoctorProfile } = useAppState();
  const initialDoctor = route.params?.doctor as DoctorOption | undefined;
  const doctorId = String(route.params?.doctorId ?? initialDoctor?.id ?? "");
  const [doctor, setDoctor] = useState<DoctorOption | null>(initialDoctor ?? null);
  const [loading, setLoading] = useState(Boolean(doctorId));

  useEffect(() => {
    let active = true;

    if (!doctorId) {
      setLoading(false);
      return;
    }

    getDoctorProfile(doctorId)
      .then((profile) => {
        if (active && profile) {
          setDoctor(profile);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [doctorId, getDoctorProfile]);

  const initials = useMemo(() => initialsFromName(doctor?.name ?? "MD"), [doctor?.name]);
  const languageLabel = doctor?.languages?.length ? doctor.languages.join(" · ") : "Español";
  const experienceLabel = doctor?.experienceYears != null ? `${doctor.experienceYears}+` : "—";

  if (loading && !doctor) {
    return (
      <Screen contentContainerStyle={{ gap: spacing.md }}>
        <SkeletonList count={4} />
      </Screen>
    );
  }

  if (!doctor) {
    return (
      <Screen contentContainerStyle={styles.emptyState}>
        <Ionicons color={palette.textMuted} name="person-circle-outline" size={54} />
        <Text style={styles.emptyTitle}>Perfil no disponible</Text>
        <Text style={styles.emptyText}>No se pudo encontrar informacion publica del medico.</Text>
        <PrimaryButton icon="arrow-back-outline" label="Volver" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#0b3a67", "#0f7a8a", "#e8fbff"]} style={styles.hero}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons color="#ffffff" name="arrow-back" size={18} />
          </Pressable>

          <View style={styles.photoFrame}>
            {doctor.profilePhotoUrl ? (
              <Image source={{ uri: doctor.profilePhotoUrl }} style={styles.photo} />
            ) : (
              <LinearGradient colors={["#eaf8ff", "#b9e8ee"]} style={styles.initialsAvatar}>
                <Text style={styles.initials}>{initials}</Text>
              </LinearGradient>
            )}
          </View>

          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <View style={styles.licensePill}>
            <Ionicons color="#dff8ff" name="shield-checkmark-outline" size={15} />
            <Text style={styles.licenseText}>{doctor.licenseCode ?? "Licencia por registrar"}</Text>
          </View>
        </LinearGradient>

        <View style={styles.metrics}>
          <MetricCard icon="briefcase-outline" label="Experiencia" value={experienceLabel} />
          <MetricCard icon="language-outline" label="Idiomas" value={String(doctor.languages?.length || 1)} />
          <MetricCard icon="calendar-outline" label="Agenda" value="Activa" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Conoce a tu medico</Text>
          <Text style={styles.bio}>
            {doctor.bio ?? "Este medico todavia no ha completado su biografia publica. Puedes revisar su especialidad y datos profesionales antes de la atencion."}
          </Text>
        </View>

        <View style={styles.card}>
          <InfoRow icon="school-outline" label="Formacion" value={doctor.education} />
          <InfoRow icon="call-outline" label="Contacto" value={doctor.phone} />
          <InfoRow icon="chatbubbles-outline" label="Idiomas" value={languageLabel} />
        </View>

        <View style={styles.noteCard}>
          <Ionicons color={palette.primaryStrong} name="information-circle-outline" size={18} />
          <Text style={styles.noteText}>Este perfil ayuda al paciente a conocer al profesional antes de su cita. La informacion se actualiza desde el perfil medico del doctor.</Text>
        </View>

        {doctor.phone ? (
          <PrimaryButton icon="call-outline" label="Llamar al consultorio" onPress={() => void Linking.openURL(`tel:${doctor.phone}`)} />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    left: spacing.lg,
    position: "absolute",
    top: spacing.lg,
    width: 38
  },
  bio: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
    marginTop: spacing.sm
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    ...cardShadow
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center"
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: "center"
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900"
  },
  hero: {
    alignItems: "center",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    minHeight: 330,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 64
  },
  infoCopy: {
    flex: 1
  },
  infoIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  infoLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  infoRow: {
    alignItems: "flex-start",
    borderBottomColor: palette.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  infoValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 2
  },
  initials: {
    color: palette.primaryDeep,
    fontSize: 34,
    fontWeight: "900"
  },
  initialsAvatar: {
    alignItems: "center",
    borderRadius: 58,
    height: 116,
    justifyContent: "center",
    width: 116
  },
  licensePill: {
    alignItems: "center",
    backgroundColor: "rgba(3, 39, 66, 0.35)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  licenseText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  },
  metricCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
    ...cardShadow
  },
  metricLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase"
  },
  metricValue: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: -34
  },
  name: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "900",
    marginTop: spacing.md,
    textAlign: "center"
  },
  noteCard: {
    alignItems: "flex-start",
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.md
  },
  noteText: {
    color: palette.primaryDeep,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  photo: {
    borderRadius: 58,
    height: 116,
    width: 116
  },
  photoFrame: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: "rgba(255,255,255,0.55)",
    borderRadius: 68,
    borderWidth: 2,
    height: 136,
    justifyContent: "center",
    width: 136
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  sectionEyebrow: {
    color: palette.primaryStrong,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  specialty: {
    color: "#dff8ff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: spacing.xs,
    textAlign: "center"
  }
});
