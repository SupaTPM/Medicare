import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function UsersScreen() {
  const { users } = useAppState();

  return (
    <Screen>
      <SectionTitle eyebrow="Usuarios" title="Roles y accesos" />
      {users.map((user) => (
        <View key={user.id} style={styles.card}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>{user.email}</Text>
          <Text style={styles.role}>{user.role}</Text>
        </View>
      ))}
      {!users.length ? <Text style={styles.empty}>Inicia sesion para cargar usuarios reales.</Text> : null}
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
    marginBottom: spacing.sm,
    ...cardShadow
  },
  name: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "700"
  },
  meta: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: spacing.xs
  },
  role: {
    color: palette.primaryStrong,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
    textTransform: "uppercase"
  },
  empty: {
    color: palette.textMuted,
    fontSize: 14
  }
});
