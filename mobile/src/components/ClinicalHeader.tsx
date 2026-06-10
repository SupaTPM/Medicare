import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { StatusPill } from "@/components/StatusPill";
import { palette } from "@/theme/palette";
import { raisedShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { UserProfile } from "@/types";

export function ClinicalHeader({
  onNotifications,
  user
}: {
  onNotifications: () => void;
  user: UserProfile;
}) {
  const roleLabel = {
    admin: "Administracion",
    doctor: "Medico",
    patient: "Paciente",
    receptionist: "Recepcion"
  }[user.role];

  return (
    <View style={styles.wrap}>
      <View style={styles.identity}>
        <View style={styles.mark}>
          <Ionicons color="#ffffff" name="medkit" size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.kicker}>MedFlow Clinical</Text>
          <Text numberOfLines={1} style={styles.name}>{user.name}</Text>
          <Text numberOfLines={1} style={styles.subtitle}>{user.subtitle}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <StatusPill label={roleLabel} tone={user.role === "patient" ? "blue" : user.role === "admin" ? "yellow" : "green"} />
        <Pressable style={styles.notification} onPress={onNotifications}>
          <Ionicons name="notifications-outline" size={19} color={palette.primaryStrong} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    padding: spacing.md,
    ...raisedShadow
  },
  identity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm
  },
  mark: {
    alignItems: "center",
    backgroundColor: palette.primaryDeep,
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  copy: {
    flex: 1
  },
  kicker: {
    color: palette.primaryStrong,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 2,
    textTransform: "uppercase"
  },
  name: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900"
  },
  subtitle: {
    color: palette.textSubtle,
    fontSize: 13,
    marginTop: 2
  },
  actions: {
    alignItems: "flex-end",
    gap: spacing.sm
  },
  notification: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderColor: palette.borderSoft,
    borderWidth: 1,
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38
  }
});
