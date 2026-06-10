import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

const ROLE_LABELS = {
  admin: "Administracion",
  doctor: "Medico",
  patient: "Paciente",
  receptionist: "Recepcion"
} as const;

function InfoRow({
  icon,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons color={palette.primaryStrong} name={icon} size={16} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ChipGroup({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (!items.length) {
    return <Text style={styles.emptyText}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.chipWrap}>
      {items.map((item) => (
        <View key={item} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout, patients, user } = useAppState();

  if (!user) {
    return null;
  }

  const isPatient = user.role === "patient";
  const patient = isPatient ? patients[0] ?? null : null;
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Screen contentContainerStyle={{ gap: spacing.md }}>
      <SectionTitle eyebrow="Perfil" title={user.name} />

      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroName}>{user.name}</Text>
          <View style={styles.rolePill}>
            <Ionicons color={palette.primaryStrong} name="shield-checkmark-outline" size={13} />
            <Text style={styles.rolePillText}>{ROLE_LABELS[user.role]}</Text>
          </View>
        </View>
      </View>

      {isPatient ? (
        <>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons color={palette.primaryStrong} name="call-outline" size={18} />
              </View>
              <Text style={styles.cardTitle}>Datos de contacto</Text>
            </View>
            <InfoRow icon="card-outline" label="Cedula" value={patient?.cedula || "No registrado"} />
            <InfoRow icon="call-outline" label="Telefono" value={patient?.phone || "No registrado"} />
            <InfoRow icon="mail-outline" label="Correo" value={patient?.email || "No registrado"} />
            <InfoRow icon="location-outline" label="Direccion" value={patient?.address || "No registrado"} />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons color={palette.primaryStrong} name="fitness-outline" size={18} />
              </View>
              <Text style={styles.cardTitle}>Informacion medica</Text>
            </View>
            <InfoRow icon="water-outline" label="Tipo de sangre" value={patient?.bloodType || "No registrado"} />

            <Text style={styles.fieldLabel}>Alergias</Text>
            <ChipGroup emptyLabel="Sin alergias registradas." items={patient?.allergies ?? []} />

            <Text style={styles.fieldLabel}>Enfermedades cronicas</Text>
            <ChipGroup emptyLabel="Sin enfermedades cronicas registradas." items={patient?.chronicConditions ?? []} />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons color={palette.primaryStrong} name="accessibility-outline" size={18} />
              </View>
              <Text style={styles.cardTitle}>Discapacidad</Text>
            </View>
            {patient?.hasDisability ? (
              <>
                <InfoRow icon="information-circle-outline" label="Tipo" value={patient.disabilityType || "No especificado"} />
                <InfoRow
                  icon="speedometer-outline"
                  label="Porcentaje"
                  value={patient.disabilityPercentage ? `${patient.disabilityPercentage}%` : "No especificado"}
                />
              </>
            ) : (
              <Text style={styles.emptyText}>Sin discapacidad registrada.</Text>
            )}
          </View>

          <PrimaryButton
            icon="create-outline"
            label="Editar mi informacion"
            onPress={() => navigation.navigate("PatientProfileEdit")}
            variant="secondary"
          />
        </>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons color={palette.primaryStrong} name="briefcase-outline" size={18} />
            </View>
            <Text style={styles.cardTitle}>Informacion laboral</Text>
          </View>
          <InfoRow icon="mail-outline" label="Correo" value={user.email || "No registrado"} />
          <InfoRow icon="business-outline" label="Area" value={user.subtitle || "No registrado"} />
          {user.specialty ? <InfoRow icon="medkit-outline" label="Especialidad" value={user.specialty} /> : null}
        </View>
      )}

      <PrimaryButton label="Cerrar sesion" variant="ghost" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    ...cardShadow
  },
  avatar: {
    alignItems: "center",
    backgroundColor: palette.primaryDeep,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900"
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs
  },
  heroName: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900"
  },
  heroSubtitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  rolePill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  rolePillText: {
    color: palette.primaryDeep,
    fontSize: 12,
    fontWeight: "800"
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.md,
    gap: spacing.sm,
    ...cardShadow
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  cardHeaderIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  cardTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  infoIcon: {
    alignItems: "center",
    backgroundColor: palette.surfaceAlt,
    borderRadius: 10,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  infoCopy: {
    flex: 1
  },
  infoLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  infoValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700"
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 6
  },
  chipText: {
    color: palette.primaryDeep,
    fontSize: 13,
    fontWeight: "800"
  },
  emptyText: {
    color: palette.textSubtle,
    fontSize: 13,
    fontWeight: "600"
  }
});
