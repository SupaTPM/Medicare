import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { palette } from "@/theme/palette";
import { cardShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

const STARS = [1, 2, 3, 4, 5];

export function ReviewModal({
  visible,
  onClose,
  onSubmit,
  loading = false
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => Promise<void> | void;
  loading?: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment("");
    }
  }, [visible]);

  async function handleSubmit() {
    if (!rating) {
      return;
    }

    await onSubmit(rating, comment.trim() ? comment.trim() : undefined);
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Califica a tu doctor</Text>
          <Text style={styles.subtitle}>Tu opinión ayuda a otros pacientes a elegir mejor.</Text>

          <View style={styles.starsRow}>
            {STARS.map((value) => (
              <Pressable accessibilityLabel={`${value} estrellas`} key={value} onPress={() => setRating(value)}>
                <Ionicons
                  color={value <= rating ? palette.warning : palette.border}
                  name={value <= rating ? "star" : "star-outline"}
                  size={36}
                />
              </Pressable>
            ))}
          </View>

          <TextField
            label="Comentario (opcional)"
            multiline
            numberOfLines={4}
            onChangeText={setComment}
            placeholder="Cuéntanos cómo fue tu experiencia"
            value={comment}
          />

          <View style={styles.actions}>
            <PrimaryButton
              disabled={!rating}
              label="Enviar"
              loading={loading}
              onPress={() => void handleSubmit()}
            />
            <PrimaryButton label="Cancelar" onPress={onClose} style={styles.cancelButton} variant="ghost" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(7, 21, 38, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    gap: spacing.md,
    padding: spacing.lg,
    width: "100%",
    ...cardShadow
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: -spacing.sm,
    textAlign: "center"
  },
  starsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center"
  },
  actions: {
    gap: spacing.sm
  },
  cancelButton: {
    marginTop: 0
  }
});
