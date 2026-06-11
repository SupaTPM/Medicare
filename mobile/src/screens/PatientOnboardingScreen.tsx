import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { cardShadow, softShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STEPS = [
  { icon: "person-outline", subtitle: "Cuentanos como contactarte", title: "Datos personales" },
  { icon: "fitness-outline", subtitle: "Informacion clinica basica", title: "Informacion medica" },
  { icon: "accessibility-outline", subtitle: "Solo si aplica en tu caso", title: "Discapacidad" }
] as const;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function StepProgress({ step }: { step: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const total = STEPS.length;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (step + 1) / total,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  }, [progress, step, total]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width }]} />
      </View>
      <View style={styles.dotsRow}>
        {STEPS.map((item, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <View key={item.title} style={styles.dotItem}>
              <View style={[styles.dot, active ? styles.dotActive : null, done ? styles.dotDone : null]}>
                {done ? (
                  <Ionicons color="#ffffff" name="checkmark" size={14} />
                ) : (
                  <Text style={[styles.dotLabel, active ? styles.dotLabelActive : null]}>{index + 1}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.progressText}>
        Paso {step + 1} de {total}
      </Text>
    </View>
  );
}

function TagInput({
  items,
  onChange,
  placeholder
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const value = draft.trim();
    if (!value) {
      return;
    }

    if (!items.some((item) => item.toLowerCase() === value.toLowerCase())) {
      onChange([...items, value]);
    }

    setDraft("");
  }

  return (
    <View style={styles.tagBlock}>
      <View style={styles.tagInputRow}>
        <View style={styles.tagInputField}>
          <TextField
            autoCapitalize="sentences"
            label=""
            onChangeText={setDraft}
            onSubmitEditing={addTag}
            placeholder={placeholder}
            returnKeyType="done"
            value={draft}
          />
        </View>
        <Pressable onPress={addTag} style={styles.tagAddButton}>
          <Ionicons color="#ffffff" name="add" size={22} />
        </Pressable>
      </View>
      {items.length ? (
        <View style={styles.tagWrap}>
          {items.map((item) => (
            <Pressable key={item} onPress={() => onChange(items.filter((value) => value !== item))} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{item}</Text>
              <Ionicons color={palette.primaryDeep} name="close" size={14} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.tagEmpty}>Sin elementos agregados.</Text>
      )}
    </View>
  );
}

export function PatientOnboardingScreen() {
  const navigation = useNavigation<any>();
  const { authError, completePatientProfile, deviceRegistration, patients, user } = useAppState();
  const patient = patients[0] ?? null;
  const isEditing = Boolean(patient?.profileCompleted);

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState(patient?.fullName ?? deviceRegistration?.fullName ?? user?.name ?? "");
  const [phone, setPhone] = useState(patient?.phone && patient.phone !== "No registrado" ? patient.phone : "");
  const [email, setEmail] = useState(patient?.email ?? "");
  const [address, setAddress] = useState(patient?.address ?? "");
  const [bloodType, setBloodType] = useState(patient?.bloodType && patient.bloodType !== "No registrado" ? patient.bloodType : "");
  const [allergies, setAllergies] = useState<string[]>(patient?.allergies ?? []);
  const [chronicConditions, setChronicConditions] = useState<string[]>(patient?.chronicConditions ?? []);
  const [hasDisability, setHasDisability] = useState(patient?.hasDisability ?? false);
  const [disabilityType, setDisabilityType] = useState(patient?.disabilityType ?? "");
  const [disabilityPercentage, setDisabilityPercentage] = useState(
    patient?.disabilityPercentage ? String(patient.disabilityPercentage) : ""
  );
  const [insuranceProvider, setInsuranceProvider] = useState(patient?.insuranceProvider ?? "");
  const [insuranceNumber, setInsuranceNumber] = useState(patient?.insuranceNumber ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [fade, step]);

  const percentageValue = useMemo(() => Number(disabilityPercentage), [disabilityPercentage]);

  function validateStep(current: number): string | null {
    if (current === 0) {
      if (fullName.trim().length < 5) {
        return "Ingresa tus nombres completos.";
      }
      if (phone.replace(/\D/g, "").length < 7) {
        return "Ingresa un telefono valido.";
      }
      if (email.trim() && !isValidEmail(email.trim())) {
        return "El correo no tiene un formato valido.";
      }
      if (address.trim().length < 5) {
        return "Ingresa tu direccion.";
      }
      return null;
    }

    if (current === 1) {
      if (!bloodType) {
        return "Selecciona tu tipo de sangre.";
      }
      return null;
    }

    if (current === 2) {
      if (hasDisability) {
        if (disabilityType.trim().length < 3) {
          return "Indica el tipo de discapacidad.";
        }
        if (!Number.isFinite(percentageValue) || percentageValue < 1 || percentageValue > 100) {
          return "El porcentaje debe estar entre 1 y 100.";
        }
      }
      return null;
    }

    return null;
  }

  function handleNext() {
    const stepError = validateStep(step);
    if (stepError) {
      setError(stepError);
      return;
    }

    setError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function handleBack() {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleFinish() {
    const stepError = validateStep(2);
    if (stepError) {
      setError(stepError);
      return;
    }

    setError(null);
    setSaving(true);
    const saved = await completePatientProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      blood_type: bloodType,
      allergies: allergies.length ? allergies : undefined,
      chronic_conditions: chronicConditions.length ? chronicConditions : undefined,
      has_disability: hasDisability,
      disability_type: hasDisability ? disabilityType.trim() : undefined,
      disability_percentage: hasDisability ? percentageValue : undefined,
      insurance_provider: insuranceProvider.trim() || undefined,
      insurance_number: insuranceNumber.trim() || undefined
    });
    setSaving(false);

    if (!saved) {
      setError("No se pudo guardar tu registro. Intenta de nuevo.");
      return;
    }

    if (isEditing && navigation.canGoBack()) {
      navigation.goBack();
    }
    // Si es el registro inicial, el navegador cambia automaticamente al panel principal.
  }

  const current = STEPS[step];

  return (
    <Screen contentContainerStyle={{ gap: spacing.md }}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons color={palette.primaryStrong} name="clipboard-outline" size={22} />
        </View>
        <Text style={styles.heroTitle}>{isEditing ? "Edita tu informacion" : "Completa tu registro medico"}</Text>
        <Text style={styles.heroSubtitle}>
          {isEditing
            ? "Actualiza tus datos de contacto y tu ficha medica cuando lo necesites."
            : "Necesitamos estos datos para tu ficha clinica. Solo tomara un momento."}
        </Text>
      </View>

      <StepProgress step={step} />

      <Animated.View style={[styles.card, { opacity: fade }]}>
        <View style={styles.stepHeader}>
          <View style={styles.stepHeaderIcon}>
            <Ionicons color={palette.primaryStrong} name={current.icon} size={20} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.stepTitle}>{current.title}</Text>
            <Text style={styles.stepSubtitle}>{current.subtitle}</Text>
          </View>
        </View>

        {step === 0 ? (
          <View style={styles.form}>
            <TextField autoCapitalize="words" label="Nombres completos" onChangeText={setFullName} placeholder="Juan Perez" value={fullName} />
            <TextField keyboardType="phone-pad" label="Telefono" onChangeText={setPhone} placeholder="0991234567" value={phone} />
            <TextField autoCapitalize="none" keyboardType="email-address" label="Correo (opcional)" onChangeText={setEmail} placeholder="correo@ejemplo.com" value={email} />
            <TextField autoCapitalize="sentences" label="Direccion" multiline onChangeText={setAddress} placeholder="Calle, numero, ciudad" value={address} />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>Tipo de sangre</Text>
            <View style={styles.bloodWrap}>
              {BLOOD_TYPES.map((type) => {
                const active = bloodType === type;
                return (
                  <Pressable key={type} onPress={() => setBloodType(type)} style={[styles.bloodChip, active ? styles.bloodChipActive : null]}>
                    <Text style={[styles.bloodChipText, active ? styles.bloodChipTextActive : null]}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Alergias</Text>
            <TagInput items={allergies} onChange={setAllergies} placeholder="Ej. Penicilina" />

            <Text style={styles.fieldLabel}>Enfermedades cronicas</Text>
            <TagInput items={chronicConditions} onChange={setChronicConditions} placeholder="Ej. Diabetes" />

            <Text style={styles.fieldLabel}>Seguro medico</Text>
            <TextField
              autoCapitalize="words"
              label=""
              onChangeText={setInsuranceProvider}
              placeholder="Ej. OSDE, IESS, particular"
              value={insuranceProvider}
            />

            <Text style={styles.fieldLabel}>Numero de afiliado</Text>
            <TextField
              label=""
              onChangeText={setInsuranceNumber}
              placeholder="Ej. OS-1234567"
              value={insuranceNumber}
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.form}>
            <View style={styles.switchRow}>
              <View style={styles.flex}>
                <Text style={styles.switchTitle}>¿Tienes alguna discapacidad?</Text>
                <Text style={styles.switchHint}>Activalo si cuentas con carnet o diagnostico.</Text>
              </View>
              <Switch
                onValueChange={setHasDisability}
                thumbColor="#ffffff"
                trackColor={{ false: palette.border, true: palette.primaryStrong }}
                value={hasDisability}
              />
            </View>

            {hasDisability ? (
              <View style={styles.form}>
                <TextField autoCapitalize="sentences" label="Tipo de discapacidad" onChangeText={setDisabilityType} placeholder="Fisica, visual, auditiva..." value={disabilityType} />
                <TextField keyboardType="number-pad" label="Porcentaje (%)" onChangeText={setDisabilityPercentage} placeholder="Ej. 40" value={disabilityPercentage} />
              </View>
            ) : (
              <View style={styles.infoBox}>
                <Ionicons color={palette.secondary} name="checkmark-circle-outline" size={18} />
                <Text style={styles.infoText}>Sin discapacidad registrada. Puedes finalizar tu registro.</Text>
              </View>
            )}
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {authError && !error ? <Text style={styles.error}>{authError}</Text> : null}
      </Animated.View>

      <View style={styles.actions}>
        {step > 0 ? (
          <PrimaryButton icon="arrow-back-outline" label="Atras" onPress={handleBack} style={styles.flex} variant="secondary" />
        ) : null}
        {step < STEPS.length - 1 ? (
          <PrimaryButton icon="arrow-forward-outline" label="Siguiente" onPress={handleNext} style={styles.flex} />
        ) : (
          <PrimaryButton
            icon="checkmark-done-outline"
            label={saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Finalizar registro"}
            loading={saving}
            onPress={() => void handleFinish()}
            style={styles.flex}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 52
  },
  heroTitle: {
    color: palette.primaryDeep,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  heroSubtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  progressWrap: {
    gap: spacing.sm
  },
  progressTrack: {
    backgroundColor: palette.surfaceAccent,
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: palette.primaryStrong,
    borderRadius: 999,
    height: 8
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  dotItem: {
    alignItems: "center"
  },
  dot: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  dotActive: {
    backgroundColor: palette.primaryFaint,
    borderColor: palette.primaryStrong
  },
  dotDone: {
    backgroundColor: palette.secondaryStrong,
    borderColor: palette.secondaryStrong
  },
  dotLabel: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  dotLabelActive: {
    color: palette.primaryStrong
  },
  progressText: {
    color: palette.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.lg,
    ...cardShadow
  },
  stepHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  stepHeaderIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  stepTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900"
  },
  stepSubtitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2
  },
  form: {
    gap: spacing.sm
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  bloodWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  bloodChip: {
    alignItems: "center",
    backgroundColor: palette.surfaceRaised,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  bloodChipActive: {
    backgroundColor: palette.primaryStrong,
    borderColor: palette.primaryStrong
  },
  bloodChipText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900"
  },
  bloodChipTextActive: {
    color: "#ffffff"
  },
  tagBlock: {
    gap: spacing.sm
  },
  tagInputRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.sm
  },
  tagInputField: {
    flex: 1
  },
  tagAddButton: {
    alignItems: "center",
    backgroundColor: palette.primaryStrong,
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tagChip: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.s
  },
  tagChipText: {
    color: palette.primaryDeep,
    fontSize: 13,
    fontWeight: "800"
  },
  tagEmpty: {
    color: palette.textSubtle,
    fontSize: 13,
    fontWeight: "600"
  },
  switchRow: {
    alignItems: "center",
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  switchTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800"
  },
  switchHint: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  infoBox: {
    alignItems: "center",
    backgroundColor: palette.successSoft,
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  infoText: {
    color: palette.secondary,
    flex: 1,
    fontSize: 13,
    fontWeight: "700"
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    ...softShadow
  }
});
