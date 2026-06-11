import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

const STEPS = ["Especialidad", "Fecha", "Resumen"] as const;

export function BookingStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <View style={styles.row}>
      {STEPS.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={label}>
            <View style={styles.stepWrap}>
              <View
                style={[
                  styles.circle,
                  isCompleted ? styles.circleCompleted : null,
                  isCurrent ? styles.circleCurrent : null
                ]}
              >
                {isCompleted ? (
                  <Ionicons color="#ffffff" name="checkmark" size={16} />
                ) : (
                  <Text style={[styles.circleText, isCurrent ? styles.circleTextCurrent : null]}>{step}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isCurrent ? styles.labelCurrent : null,
                  isCompleted ? styles.labelCompleted : null
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
            {!isLast ? (
              <View style={[styles.connector, isCompleted ? styles.connectorCompleted : null]} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    paddingHorizontal: spacing.xs
  },
  stepWrap: {
    alignItems: "center",
    gap: spacing.xs,
    width: 84
  },
  circle: {
    alignItems: "center",
    backgroundColor: palette.surfaceAlt,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  circleCurrent: {
    backgroundColor: palette.primaryStrong,
    borderColor: palette.primaryStrong
  },
  circleCompleted: {
    backgroundColor: palette.secondary,
    borderColor: palette.secondary
  },
  circleText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "800"
  },
  circleTextCurrent: {
    color: "#ffffff"
  },
  label: {
    color: palette.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  },
  labelCurrent: {
    color: palette.primaryStrong,
    fontWeight: "900"
  },
  labelCompleted: {
    color: palette.secondary,
    fontWeight: "800"
  },
  connector: {
    backgroundColor: palette.border,
    flex: 1,
    height: 2,
    marginTop: 17
  },
  connectorCompleted: {
    backgroundColor: palette.secondary
  }
});
