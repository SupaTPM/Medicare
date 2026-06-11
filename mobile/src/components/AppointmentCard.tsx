import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusPill, Tone } from "@/components/StatusPill";
import { useAppState } from "@/state/AppContext";
import { Appointment, AppointmentStatus } from "@/types";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { getDoctorPhotoUri } from "@/utils/avatar";

const STATUS_VISUAL: Record<AppointmentStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pendiente", tone: "yellow" },
  confirmed: { label: "Confirmada", tone: "green" },
  waiting: { label: "En espera", tone: "yellow" },
  in_consultation: { label: "En consulta", tone: "blue" },
  completed: { label: "Completada", tone: "blue" },
  cancelled: { label: "Cancelada", tone: "red" },
  no_show: { label: "No asistio", tone: "gray" }
};

function getSpecialtyVisual(specialty: string): { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string } {
  const value = specialty.toLowerCase();

  if (value.includes("cardio")) {
    return { icon: "heart-outline", bg: palette.warningSoft, fg: "#b45309" };
  }
  if (value.includes("pediatr")) {
    return { icon: "happy-outline", bg: palette.secondarySoft, fg: palette.secondary };
  }
  if (value.includes("odont") || value.includes("dent")) {
    return { icon: "medical-outline", bg: palette.lavender, fg: palette.primary };
  }
  if (value.includes("oftalm") || value.includes("ocul") || value.includes("vis")) {
    return { icon: "eye-outline", bg: palette.cyanSoft, fg: palette.primary };
  }
  if (value.includes("dermat")) {
    return { icon: "body-outline", bg: palette.lavender, fg: palette.primary };
  }
  if (value.includes("trauma") || value.includes("ortoped")) {
    return { icon: "fitness-outline", bg: palette.warningSoft, fg: "#b45309" };
  }

  return { icon: "medkit-outline", bg: palette.primaryFaint, fg: palette.primaryStrong };
}

export function AppointmentCard({ item, onPress }: { item: Appointment; onPress?: () => void }) {
  const { user } = useAppState();
  const isPatient = user?.role === "patient";
  const isInactive = item.status === "cancelled" || item.status === "no_show";

  const status = STATUS_VISUAL[item.status] ?? { label: item.status, tone: "gray" as Tone };
  const visual = isInactive
    ? { icon: getSpecialtyVisual(item.specialty).icon, bg: palette.surfaceAlt, fg: palette.textSubtle }
    : getSpecialtyVisual(item.specialty);

  const title = isPatient ? item.doctorName : item.patientName;
  const subtitle = isPatient ? item.specialty : `${item.specialty} · ${item.doctorName}`;
  const photoUri = getDoctorPhotoUri({ id: item.doctorId, name: item.doctorName, profilePhotoUrl: item.doctorPhotoUrl });

  return (
    <Pressable onPress={onPress} style={[styles.card, isInactive ? styles.cardInactive : null]}>
      <View style={styles.header}>
        {isPatient ? (
          <View style={styles.avatarFrame}>
            <Image source={{ uri: photoUri }} style={styles.avatar} />
            <View style={[styles.specialtyBadge, { backgroundColor: visual.bg }]}>
              <Ionicons color={visual.fg} name={visual.icon} size={12} />
            </View>
          </View>
        ) : (
          <View style={[styles.iconAvatar, { backgroundColor: visual.bg }]}>
            <Ionicons color={visual.fg} name={visual.icon} size={26} />
          </View>
        )}
        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={[styles.title, isInactive ? styles.titleInactive : null]}>
            {title}
          </Text>
          <Text numberOfLines={1} style={[styles.subtitle, isInactive ? styles.subtitleInactive : null]}>
            {subtitle}
          </Text>
        </View>
        <StatusPill dot label={status.label} tone={status.tone} />
      </View>

      <View style={[styles.infoGrid, isInactive ? styles.infoGridInactive : null]}>
        <View style={styles.infoCell}>
          <Ionicons color={isInactive ? palette.textSubtle : palette.primaryStrong} name="calendar-outline" size={18} />
          <View>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={[styles.infoValue, isInactive ? styles.infoValueInactive : null]}>{item.dateLabel}</Text>
          </View>
        </View>
        <View style={styles.infoCell}>
          <Ionicons color={isInactive ? palette.textSubtle : palette.primaryStrong} name="time-outline" size={18} />
          <View>
            <Text style={styles.infoLabel}>Hora</Text>
            <Text style={[styles.infoValue, isInactive ? styles.infoValueInactive : null]}>{item.timeLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text numberOfLines={1} style={[styles.reason, isInactive ? styles.subtitleInactive : null]}>
          {item.reason}
        </Text>
        <View style={styles.footerAction}>
          <Text style={styles.footerActionText}>Ver detalle</Text>
          <Ionicons color={palette.primaryStrong} name="chevron-forward" size={16} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...cardShadow
  },
  cardInactive: {
    opacity: 0.78
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  iconAvatar: {
    alignItems: "center",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  avatarFrame: {
    height: 52,
    width: 52
  },
  avatar: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    height: 52,
    width: 52
  },
  specialtyBadge: {
    alignItems: "center",
    borderColor: palette.surface,
    borderRadius: 11,
    borderWidth: 2,
    bottom: -4,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    width: 22
  },
  headerCopy: {
    flex: 1,
    gap: 2,
    paddingTop: 2
  },
  title: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  titleInactive: {
    color: palette.textMuted
  },
  subtitle: {
    color: palette.textSubtle,
    fontSize: 13,
    fontWeight: "600"
  },
  subtitleInactive: {
    color: palette.textSubtle
  },
  infoGrid: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md
  },
  infoGridInactive: {
    backgroundColor: "transparent",
    borderColor: palette.borderSoft,
    borderWidth: 1
  },
  infoCell: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm
  },
  infoLabel: {
    color: palette.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  infoValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2
  },
  infoValueInactive: {
    color: palette.textMuted
  },
  reason: {
    color: palette.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "600"
  },
  footer: {
    alignItems: "center",
    borderTopColor: palette.borderSoft,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm
  },
  footerAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  footerActionText: {
    color: palette.primaryStrong,
    fontSize: 13,
    fontWeight: "800"
  }
});
