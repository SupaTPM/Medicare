import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { softShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

export function PatientAccessScreen() {
  const { authError, deviceRegistration, isReady, isSyncing, loginWithCedula, registerDevicePatient, retryDeviceSync, user } = useAppState();
  const [cedula, setCedula] = useState(deviceRegistration?.cedula ?? "");
  const [fullName, setFullName] = useState(deviceRegistration?.fullName ?? "");

  const isFirstAccess = !deviceRegistration;

  useEffect(() => {
    if (!deviceRegistration) {
      return;
    }

    setCedula(deviceRegistration.cedula);
    setFullName(deviceRegistration.fullName);
  }, [deviceRegistration]);

  if (!isReady) {
    return (
      <Screen contentContainerStyle={styles.loadingContent}>
        <ActivityIndicator color={palette.primaryStrong} size="large" />
        <Text style={styles.loadingText}>Cargando registro local...</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{isFirstAccess ? "Registro paciente" : "Ingreso paciente"}</Text>
        <Text style={styles.subtitle}>
          {isFirstAccess ? "Primer acceso en este celular." : "Usa cédula guardada en este celular."}
        </Text>
        <View style={styles.form}>
          <TextField
            keyboardType="number-pad"
            label="Cedula"
            onChangeText={setCedula}
            placeholder="1312345678"
            value={cedula}
          />
          {isFirstAccess ? (
            <TextField
              label="Nombres completos"
              onChangeText={setFullName}
              placeholder="Juan Perez"
              value={fullName}
            />
          ) : null}
          {authError ? <Text style={styles.error}>{authError}</Text> : null}
          {user?.role === "patient" ? <Text style={styles.success}>Paciente autenticado.</Text> : null}
          {deviceRegistration ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {deviceRegistration.fullName} - nube {deviceRegistration.syncStatus === "synced" ? "ok" : "pendiente"}
              </Text>
            </View>
          ) : null}
          <PrimaryButton
            icon={isFirstAccess ? "person-add-outline" : "log-in-outline"}
            label={isSyncing ? "Validando..." : isFirstAccess ? "Registrar en celular" : "Entrar con cedula"}
            onPress={() => {
              if (isFirstAccess) {
                void registerDevicePatient(cedula, fullName);
                return;
              }

              void loginWithCedula(cedula);
            }}
          />
          {deviceRegistration && deviceRegistration.syncStatus !== "synced" ? (
            <PrimaryButton
              icon="cloud-upload-outline"
              label="Reintentar sync nube"
              onPress={() => void retryDeviceSync()}
              variant="ghost"
            />
          ) : null}
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
  loadingContent: {
    alignItems: "center",
    flexGrow: 1,
    gap: spacing.sm,
    justifyContent: "center"
  },
  loadingText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: "700"
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
  success: {
    color: palette.secondary,
    fontSize: 13,
    fontWeight: "700"
  },
  badge: {
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm
  },
  badgeText: {
    color: palette.primaryDeep,
    fontSize: 12,
    fontWeight: "700"
  }
});
