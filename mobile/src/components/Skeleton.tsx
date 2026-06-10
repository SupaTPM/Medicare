import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

import { palette } from "@/theme/palette";
import { cardShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

type SkeletonProps = {
  height: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({ height, radius = 12, style, width = "100%" }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 780,
          toValue: 1,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          duration: 780,
          toValue: 0.45,
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          borderRadius: radius,
          height,
          opacity,
          width
        },
        style
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Skeleton height={48} radius={14} width={48} />
        <View style={styles.copy}>
          <Skeleton height={16} width="72%" />
          <Skeleton height={12} style={styles.lineGap} width="48%" />
        </View>
      </View>
      <Skeleton height={1} style={styles.divider} />
      <View style={styles.footer}>
        <Skeleton height={24} radius={999} width={92} />
        <Skeleton height={14} width="38%" />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </>
  );
}

export function HomeSkeleton() {
  return (
    <View style={styles.homeWrap}>
      <Skeleton height={72} radius={20} />
      <Skeleton height={136} radius={24} />
      <View style={styles.quickGrid}>
        <Skeleton height={86} radius={18} style={styles.quickItem} />
        <Skeleton height={86} radius={18} style={styles.quickItem} />
        <Skeleton height={86} radius={18} style={styles.quickItem} />
        <Skeleton height={86} radius={18} style={styles.quickItem} />
      </View>
      <SkeletonList count={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: palette.borderSoft
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...cardShadow
  },
  copy: {
    flex: 1
  },
  divider: {
    marginVertical: spacing.sm
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  homeWrap: {
    gap: spacing.md
  },
  lineGap: {
    marginTop: spacing.sm
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quickItem: {
    flexBasis: "47%",
    flexGrow: 1
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  }
});
