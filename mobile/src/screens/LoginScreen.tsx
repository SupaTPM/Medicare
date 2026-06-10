import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

function CareConnectMark() {
  return (
    <View style={styles.logoBox}>
      <View style={styles.crossVertical} />
      <View style={styles.crossHorizontal} />
      <View style={styles.linkBadge}>
        <Ionicons color="#ffffff" name="link-outline" size={22} />
      </View>
      <Text style={styles.logoText}>CareConnect</Text>
    </View>
  );
}

function LoginInput({
  icon,
  keyboardType,
  onChangeText,
  placeholder,
  secureTextEntry,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: "email-address";
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <View style={styles.inputWrap}>
      <TextInput
        autoCapitalize="none"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#707789"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
      <Ionicons color="#a7adba" name={icon} size={22} style={styles.inputIcon} />
    </View>
  );
}

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { authError, isSyncing, login } = useAppState();
  const [identifier, setIdentifier] = useState("doctor@medflow.test");
  const [password, setPassword] = useState("password123");
  const [remember, setRemember] = useState(false);
  const normalizedCedula = identifier.replace(/\D/g, "");
  const isCedula = normalizedCedula.length === 10 && identifier.trim() === normalizedCedula;
  const canSubmit = Boolean(identifier.trim() && (password.trim() || isCedula));

  async function handleLogin() {
    await login(identifier, password);
  }

  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.meshTop} />
      <View style={styles.meshBottom} />

      <View style={styles.panel}>
        <CareConnectMark />

        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Ingrese sus credenciales de acceso</Text>

        <View style={styles.form}>
          <LoginInput
            icon="at-outline"
            keyboardType="email-address"
            onChangeText={setIdentifier}
            placeholder="Correo o cédula"
            value={identifier}
          />
          <LoginInput
            icon="lock-closed-outline"
            onChangeText={setPassword}
            placeholder={isCedula ? "Contraseña si eres doctor o personal" : "Contraseña"}
            secureTextEntry
            value={password}
          />
          {isCedula && !password.trim() ? (
            <Text style={styles.patientHint}>Paciente: puedes entrar solo con tu cédula.</Text>
          ) : null}

          <View style={styles.optionsRow}>
            <Pressable onPress={() => setRemember((current) => !current)} style={styles.rememberWrap}>
              <View style={[styles.checkCircle, remember ? styles.checkCircleActive : null]}>
                {remember ? <Ionicons color="#ffffff" name="checkmark" size={13} /> : null}
              </View>
              <Text style={styles.optionText}>Recordarme</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.forgotText}>¿Olvidó su contraseña?</Text>
            </Pressable>
          </View>

          {authError ? <Text style={styles.error}>{authError}</Text> : null}

          <PrimaryButton
            disabled={!canSubmit}
            label={isSyncing ? "Validando..." : "Iniciar Sesión"}
            loading={isSyncing}
            onPress={() => void handleLogin()}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tiene una cuenta?</Text>
          <Pressable onPress={() => navigation.navigate("PatientAccess")}>
            <Text style={styles.registerLink}>Registro</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statusPill}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>SISTEMA OPERATIVO V4.2.0 — RED SEGURA</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkCircle: {
    alignItems: "center",
    borderColor: "#b9c2d6",
    borderRadius: 14,
    borderWidth: 1.5,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  checkCircleActive: {
    backgroundColor: palette.primaryStrong,
    borderColor: palette.primaryStrong
  },
  crossHorizontal: {
    borderColor: palette.primaryStrong,
    borderRadius: 2,
    borderWidth: 3,
    height: 34,
    position: "absolute",
    top: 38,
    width: 84
  },
  crossVertical: {
    borderColor: palette.primary,
    borderRadius: 2,
    borderWidth: 3,
    height: 84,
    position: "absolute",
    top: 13,
    width: 34
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
  },
  forgotText: {
    color: palette.primaryStrong,
    fontSize: 14,
    fontWeight: "900"
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.xl,
    width: "100%"
  },
  input: {
    color: palette.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    minHeight: 62,
    paddingLeft: spacing.lg,
    paddingRight: 52
  },
  inputIcon: {
    position: "absolute",
    right: spacing.lg
  },
  inputWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.52)",
    borderColor: "#bec6d9",
    borderRadius: 28,
    borderWidth: 1.2,
    flexDirection: "row",
    minHeight: 62,
    overflow: "hidden"
  },
  linkBadge: {
    alignItems: "center",
    backgroundColor: palette.primaryStrong,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    top: 38,
    width: 36
  },
  loginButton: {
    borderRadius: 30,
    minHeight: 66,
    shadowColor: palette.primaryStrong,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 24
  },
  logoBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    height: 150,
    justifyContent: "center",
    marginBottom: spacing.xl,
    position: "relative",
    width: 150
  },
  logoText: {
    bottom: 30,
    color: palette.primaryStrong,
    fontSize: 15,
    fontWeight: "900",
    position: "absolute"
  },
  meshBottom: {
    backgroundColor: "rgba(143,246,208,0.23)",
    borderRadius: 180,
    bottom: -70,
    height: 280,
    position: "absolute",
    right: -110,
    width: 280
  },
  meshTop: {
    backgroundColor: "rgba(0,80,203,0.12)",
    borderRadius: 180,
    height: 300,
    left: -120,
    position: "absolute",
    top: -90,
    width: 300
  },
  optionText: {
    color: palette.textSubtle,
    fontSize: 14,
    fontWeight: "700"
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  panel: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.58)",
    borderColor: "rgba(255,255,255,0.68)",
    borderRadius: 38,
    borderWidth: 1,
    padding: spacing.xl,
    width: "100%"
  },
  patientHint: {
    color: palette.primaryStrong,
    fontSize: 12,
    fontWeight: "800",
    marginTop: -spacing.xs
  },
  registerLink: {
    color: palette.primaryStrong,
    fontSize: 15,
    fontWeight: "900"
  },
  registerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xl
  },
  registerText: {
    color: palette.textSubtle,
    fontSize: 15,
    fontWeight: "600"
  },
  rememberWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  screen: {
    backgroundColor: "#edf6ff",
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  statusDot: {
    backgroundColor: "#0b7d64",
    borderRadius: 6,
    height: 12,
    width: 12
  },
  statusPill: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 999,
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  statusText: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "800"
  },
  subtitle: {
    color: palette.textSubtle,
    fontSize: 18,
    fontWeight: "600",
    marginTop: spacing.sm,
    textAlign: "center"
  },
  title: {
    color: palette.text,
    fontSize: 33,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center"
  }
});
