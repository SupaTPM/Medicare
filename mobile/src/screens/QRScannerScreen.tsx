import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

export function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [lastScan, setLastScan] = useState<string | null>(null);

  if (!permission?.granted) {
    return (
      <Screen>
        <SectionTitle eyebrow="Escaner" title="Permiso de camara" />
        <Text style={styles.text}>Expo Go necesita permiso de camara para validar citas mediante QR.</Text>
        <PrimaryButton label="Permitir camara" onPress={() => void requestPermission()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle eyebrow="Escaner" title="Validar asistencia" />
      <View style={styles.preview}>
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={(result) => setLastScan(result.data)}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <Text style={styles.text}>
        {lastScan ? `Ultimo codigo leido: ${lastScan}` : "Escanea el QR de la cita para cambiar el estado a En espera."}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: 320,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: spacing.md
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.text
  }
});
