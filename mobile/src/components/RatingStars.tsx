import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function RatingStars({
  rating,
  reviewsCount,
  size = 14
}: {
  rating?: number | null;
  reviewsCount?: number;
  size?: number;
}) {
  if (rating == null) {
    return (
      <View style={styles.row}>
        <Ionicons color={palette.textSubtle} name="star-outline" size={size} />
        <Text style={styles.muted}>Sin calificaciones</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Ionicons color={palette.warning} name="star" size={size} />
      <Text style={styles.value}>{rating.toFixed(1)}</Text>
      {reviewsCount != null ? <Text style={styles.muted}>({reviewsCount})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  value: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800"
  },
  muted: {
    color: palette.textSubtle,
    fontSize: 12,
    fontWeight: "700"
  }
});
