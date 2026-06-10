import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function ProfileScreen() {
  const { logout, user } = useAppState();

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <SectionTitle eyebrow="Perfil" title={user.name} />
      <View style={styles.card}>
        <Text style={styles.item}>Rol: {user.role}</Text>
        <Text style={styles.item}>Area: {user.subtitle}</Text>
        <Text style={styles.item}>Sesion simulada del MVP</Text>
      </View>
      <PrimaryButton label="Cerrar sesion" variant="secondary" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...cardShadow
  },
  item: {
    fontSize: 15,
    color: palette.text,
    marginBottom: spacing.sm
  }
});
