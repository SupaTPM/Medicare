import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { softShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function DoctorAccessScreen() {
  const { authError, doctorProfiles, loginDoctor } = useAppState();
  const [email, setEmail] = useState("doctor@medflow.test");
  const [password, setPassword] = useState("password123");

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Acceso profesional</Text>
        <Text style={styles.subtitle}>Ingreso para doctores con cuenta activa. Cuenta provista por administracion.</Text>
        <View style={styles.form}>
          <TextField
            keyboardType="email-address"
            label="Correo"
            onChangeText={setEmail}
            placeholder="doctor@medflow.test"
            value={email}
          />
          <TextField
            label="Contrasena"
            onChangeText={setPassword}
            placeholder="password123"
            secureTextEntry
            value={password}
          />
          {authError ? <Text style={styles.error}>{authError}</Text> : null}
          <PrimaryButton icon="medkit-outline" label="Entrar como doctor" onPress={() => loginDoctor(email, password)} />
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.blockTitle}>Doctores demo</Text>
          <View style={styles.chipWrap}>
            {doctorProfiles.map((item) => (
              <Pressable key={item.id} onPress={() => setEmail(item.email)} style={styles.chip}>
                <Text style={styles.chipText}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>Si no tienes cuenta, solicita alta al administrador.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.lg,
    ...softShadow
  },
  title: {
    color: palette.primaryDeep,
    fontSize: 24,
    fontWeight: "900"
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: spacing.xs
  },
  form: {
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "700"
  },
  infoBlock: {
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  blockTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s
  },
  chip: {
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.s
  },
  chipText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  noticeBox: {
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md
  },
  noticeText: {
    color: palette.primaryDeep,
    fontSize: 13,
    fontWeight: "700"
  }
});
