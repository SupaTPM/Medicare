import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AccessDenied } from "@/components/AccessDenied";
import { FlowCard } from "@/components/FlowCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { isStaff } from "@/utils/roles";

export function CreatePatientScreen({ navigation }: any) {
  const { authError, createPatient, user } = useAppState();
  const [fullName, setFullName] = useState("");
  const [cedula, setCedula] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [allergies, setAllergies] = useState("");
  const [previousConditions, setPreviousConditions] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const saved = await createPatient({
      full_name: fullName,
      cedula,
      birth_date: birthDate || undefined,
      sex: sex || undefined,
      blood_type: bloodType || undefined,
      phone: phone || undefined,
      allergies: allergies ? allergies.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
      previous_conditions: previousConditions ? previousConditions.split(",").map((item) => item.trim()).filter(Boolean) : undefined
    });
    setSaving(false);

    if (saved) {
      navigation.navigate("Main");
    }
  }

  if (!isStaff(user)) {
    return <AccessDenied />;
  }

  return (
    <Screen contentContainerStyle={{ gap: spacing.sm }}>
      <SectionTitle eyebrow="Registro" title="Nuevo paciente" />
      <FlowCard
        icon="shield-checkmark-outline"
        meta="Identidad, contacto, alergias y antecedentes"
        status="Recepcion"
        title="Ficha minima para admision segura"
        tone="green"
      />
      <TextField label="Nombres completos" onChangeText={setFullName} value={fullName} />
      <TextField keyboardType="number-pad" label="Cedula" onChangeText={setCedula} value={cedula} />
      <TextField label="Fecha de nacimiento" onChangeText={setBirthDate} placeholder="1992-08-12" value={birthDate} />
      <TextField label="Sexo" onChangeText={setSex} value={sex} />
      <TextField label="Tipo de sangre" onChangeText={setBloodType} value={bloodType} />
      <TextField keyboardType="phone-pad" label="Telefono" onChangeText={setPhone} value={phone} />
      <TextField label="Alergias" onChangeText={setAllergies} placeholder="Separadas por coma" value={allergies} />
      <TextField label="Enfermedades previas" onChangeText={setPreviousConditions} placeholder="Separadas por coma" value={previousConditions} />
      {authError ? <Text style={styles.error}>{authError}</Text> : null}
      <View style={styles.notice}>
        <Text style={styles.noticeText}>La validacion por cedula debe usar fuente autorizada y consentimiento.</Text>
      </View>
      <PrimaryButton icon="save-outline" label={saving ? "Guardando..." : "Guardar paciente real"} onPress={() => void handleSave()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: palette.warningSoft,
    borderRadius: 14,
    padding: spacing.md
  },
  noticeText: {
    color: "#8a5a00",
    fontSize: 13,
    fontWeight: "700"
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "700"
  }
});
