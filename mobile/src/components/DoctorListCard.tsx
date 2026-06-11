import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/PrimaryButton";
import { RatingStars } from "@/components/RatingStars";
import { palette } from "@/theme/palette";
import { cardShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { DoctorOption } from "@/types";
import { getDoctorPhotoUri } from "@/utils/avatar";

export function DoctorListCard({ doctor, onPress }: { doctor: DoctorOption; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarFrame}>
          <Image source={{ uri: getDoctorPhotoUri(doctor) }} style={styles.avatar} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.name} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text style={styles.specialty} numberOfLines={1}>
            {doctor.specialty}
          </Text>
          <RatingStars rating={doctor.rating} reviewsCount={doctor.reviewsCount} />
        </View>
      </View>

      {doctor.location ? (
        <View style={styles.row}>
          <Ionicons color={palette.textSubtle} name="location-outline" size={14} />
          <Text style={styles.rowText} numberOfLines={1}>
            {doctor.location}
          </Text>
        </View>
      ) : null}

      {doctor.nextSlotLabel ? (
        <View style={styles.row}>
          <Ionicons color={palette.secondary} name="time-outline" size={14} />
          <Text style={styles.nextSlotLabel}>Próxima cita</Text>
          <Text style={styles.nextSlotValue}>{doctor.nextSlotLabel}</Text>
        </View>
      ) : null}

      <PrimaryButton icon="calendar-outline" label="Ver disponibilidad" onPress={onPress} style={styles.cta} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...cardShadow
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  avatarFrame: {
    height: 56,
    width: 56
  },
  avatar: {
    alignItems: "center",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    width: 56
  },
  headerCopy: {
    flex: 1,
    gap: 2
  },
  name: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  specialty: {
    color: palette.primaryStrong,
    fontSize: 13,
    fontWeight: "800"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  rowText: {
    color: palette.textMuted,
    flex: 1,
    fontSize: 13,
    fontWeight: "600"
  },
  nextSlotLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  nextSlotValue: {
    color: palette.secondary,
    fontSize: 13,
    fontWeight: "800"
  },
  cta: {
    marginTop: spacing.xs
  }
});
