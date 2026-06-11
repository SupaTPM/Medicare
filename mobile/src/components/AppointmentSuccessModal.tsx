import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusPill } from "@/components/StatusPill";
import { palette } from "@/theme/palette";
import { cardShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { Appointment } from "@/types";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function AppointmentSuccessModal({
  appointment,
  onClose,
  visible
}: {
  appointment: Appointment | null;
  onClose: () => void;
  visible: boolean;
}) {
  const [showQr, setShowQr] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!visible) {
      setShowQr(false);
      checkScale.setValue(0);
      cardOpacity.setValue(0);
      cardSlide.setValue(24);
      return;
    }

    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        delay: 120,
        useNativeDriver: true
      })
    ]).start();
  }, [visible, checkScale, cardOpacity, cardSlide]);

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <Animated.View style={[styles.modalCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
          {showQr && appointment ? (
            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.qrHeader}>
                <Text style={styles.qrHeaderTitle}>Tu cita</Text>
                <StatusPill label="QR listo" tone="green" />
              </View>

              <View style={styles.qrBox}>
                <QRCode value={appointment.qrCode} size={190} />
                <Text style={styles.qrCode}>{appointment.qrCode}</Text>
              </View>

              <View style={styles.detailGroup}>
                <DetailRow label="Paciente" value={appointment.patientName} />
                <DetailRow label="Medico" value={appointment.doctorName} />
                <DetailRow label="Especialidad" value={appointment.specialty} />
                <DetailRow label="Fecha" value={`${appointment.dateLabel} | ${appointment.timeLabel}`} />
                {appointment.reason ? <DetailRow label="Motivo" value={appointment.reason} /> : null}
              </View>

              <Text style={styles.qrHint}>Presenta este codigo QR al llegar a tu cita.</Text>

              <PrimaryButton icon="arrow-back-outline" label="Volver" onPress={() => setShowQr(false)} variant="secondary" />
              <PrimaryButton icon="home-outline" label="Ir al panel" onPress={onClose} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          ) : (
            <View style={styles.successBody}>
              <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
                <Ionicons color="#ffffff" name="checkmark" size={56} />
              </Animated.View>
              <Text style={styles.successTitle}>¡CITA AGENDADA!</Text>
              <Text style={styles.successText}>
                Tu turno quedo reservado. Revisa los detalles y guarda tu codigo QR para presentarlo en la cita.
              </Text>
              <PrimaryButton icon="qr-code-outline" label="Ver cita y QR" onPress={() => setShowQr(true)} />
              <PrimaryButton
                icon="home-outline"
                label="Volver al panel"
                onPress={onClose}
                style={{ marginTop: spacing.sm }}
                variant="secondary"
              />
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(7, 21, 38, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  modalCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    maxHeight: "88%",
    padding: spacing.lg,
    width: "100%",
    ...cardShadow
  },
  modalScroll: {
    gap: spacing.md
  },
  successBody: {
    alignItems: "center",
    gap: spacing.sm
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: palette.secondaryStrong,
    borderRadius: 56,
    height: 96,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 96
  },
  successTitle: {
    color: palette.secondary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center"
  },
  successText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
    textAlign: "center"
  },
  qrHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  qrHeaderTitle: {
    color: palette.primaryDeep,
    fontSize: 18,
    fontWeight: "900"
  },
  qrBox: {
    alignItems: "center",
    backgroundColor: palette.surfaceRaised,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.lg
  },
  qrCode: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: spacing.md
  },
  detailGroup: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    padding: spacing.md
  },
  detailRow: {
    borderBottomColor: palette.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.s
  },
  detailLabel: {
    color: palette.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  detailValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2
  },
  qrHint: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
  }
});
