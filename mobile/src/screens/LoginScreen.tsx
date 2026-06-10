import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { palette } from "@/theme/palette";
import { softShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function LoginScreen() {
  const navigation = useNavigation<any>();

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.logoWrap}>
        <View style={styles.logo}>
          <Ionicons color={palette.primaryStrong} name="medkit" size={28} />
        </View>
        <Text style={styles.brand}>MedFlow</Text>
        <Text style={styles.title}>Como quieres entrar</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Soy paciente</Text>
          <Text style={styles.cardText}>Registro inicial por cédula. Luego ingreso rápido desde este celular.</Text>
          <PrimaryButton icon="person-outline" label="Entrar como paciente" onPress={() => navigation.navigate("PatientAccess")} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Soy doctor</Text>
          <Text style={styles.cardText}>Login profesional con cuenta entregada por administracion.</Text>
          <PrimaryButton icon="medkit-outline" label="Entrar como doctor" onPress={() => navigation.navigate("DoctorAccess")} variant="secondary" />
        </View>
      </View>

      <View style={styles.secondaryGrid}>
        <PrimaryButton icon="card-outline" label="Cedula" onPress={() => navigation.navigate("CedulaAccess")} variant="secondary" />
        <PrimaryButton icon="qr-code-outline" label="QR de cita" onPress={() => navigation.navigate("PublicQRAccess")} variant="secondary" />
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
  logoWrap: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderWidth: 1
  },
  brand: {
    fontSize: 30,
    fontWeight: "900",
    color: palette.primaryDeep
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.textMuted
  },
  grid: {
    gap: spacing.md
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.lg,
    ...softShadow
  },
  cardTitle: {
    color: palette.primaryDeep,
    fontSize: 22,
    fontWeight: "900"
  },
  cardText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
    marginTop: spacing.xs
  },
  secondaryGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  }
});
