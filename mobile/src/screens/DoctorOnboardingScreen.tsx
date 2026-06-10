import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { cardShadow } from "@/theme/shadows";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";

type SelectedPhoto = {
  uri: string;
  name: string;
  type: string;
};

function buildPhotoFile(asset: ImagePicker.ImagePickerAsset): SelectedPhoto {
  const fileName = asset.fileName ?? `doctor-profile-${Date.now()}.jpg`;
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension === "png" ? "png" : "jpg";

  return {
    uri: asset.uri,
    name: fileName.includes(".") ? fileName : `doctor-profile-${Date.now()}.${safeExtension}`,
    type: asset.mimeType ?? (safeExtension === "png" ? "image/png" : "image/jpeg")
  };
}

export function DoctorOnboardingScreen() {
  const { authError, logout, updateDoctorProfile, user } = useAppState();
  const [cedula, setCedula] = useState(user?.cedula ?? "");
  const [specialty, setSpecialty] = useState(user?.specialty ?? "");
  const [licenseCode, setLicenseCode] = useState(user?.licenseCode ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [education, setEducation] = useState(user?.education ?? "");
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears ? String(user.experienceYears) : "");
  const [languagesText, setLanguagesText] = useState(user?.languages?.join(", ") ?? "Español");
  const [photo, setPhoto] = useState<SelectedPhoto | null>(user?.profilePhotoUrl ? {
    uri: user.profilePhotoUrl,
    name: "current-profile-photo.jpg",
    type: "image/jpeg"
  } : null);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const languages = useMemo(
    () => languagesText.split(",").map((item) => item.trim()).filter(Boolean),
    [languagesText]
  );

  const canSave = Boolean(
    specialty.trim()
      && cedula.trim().length >= 10
      && licenseCode.trim()
      && phone.trim()
      && bio.trim().length >= 30
      && education.trim()
      && experienceYears.trim()
      && languages.length
      && photo
  );

  async function pickPhoto() {
    setLocalError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setLocalError("Permite acceso a tu galeria para subir la foto profesional.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(buildPhotoFile(result.assets[0]));
    }
  }

  async function handleSave() {
    const parsedExperience = Number(experienceYears);

    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      setLocalError("Ingresa años de experiencia válidos.");
      return;
    }

    if (!photo) {
      setLocalError("La foto de perfil es obligatoria.");
      return;
    }

    setSaving(true);
    setLocalError(null);

    const saved = await updateDoctorProfile({
      cedula: cedula.trim(),
      specialty: specialty.trim(),
      license_code: licenseCode.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      education: education.trim(),
      experience_years: parsedExperience,
      languages,
      profilePhoto: photo.uri.startsWith("http") ? undefined : photo
    });

    setSaving(false);

    if (!saved) {
      setLocalError(null);
    }
  }

  return (
    <Screen contentContainerStyle={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#083454", "#0e7781", "#eafaff"]} style={styles.header}>
          <Text style={styles.eyebrow}>Primer ingreso medico</Text>
          <Text style={styles.title}>Completa tu perfil antes de atender pacientes</Text>
          <Text style={styles.subtitle}>Esta informacion sera visible para los pacientes que agenden una cita contigo.</Text>
        </LinearGradient>

        <View style={styles.photoCard}>
          <Pressable onPress={() => void pickPhoto()} style={styles.photoButton}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons color={palette.primaryStrong} name="camera-outline" size={34} />
                <Text style={styles.photoPlaceholderText}>Subir foto</Text>
              </View>
            )}
          </Pressable>
          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>Foto profesional obligatoria</Text>
            <Text style={styles.photoText}>Usa una imagen clara del rostro, cuadrada y con buena luz.</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <TextField keyboardType="numeric" label="Cédula profesional" onChangeText={setCedula} placeholder="0911111111" value={cedula} />
          <TextField label="Especialidad" onChangeText={setSpecialty} placeholder="Cardiologia" value={specialty} />
          <TextField label="Codigo profesional" onChangeText={setLicenseCode} placeholder="MED-001" value={licenseCode} />
          <TextField keyboardType="phone-pad" label="Telefono de contacto" onChangeText={setPhone} placeholder="0990000001" value={phone} />
          <TextField keyboardType="numeric" label="Años de experiencia" onChangeText={setExperienceYears} placeholder="8" value={experienceYears} />
          <TextField label="Formacion academica" onChangeText={setEducation} placeholder="Universidad · Especializacion" value={education} />
          <TextField label="Idiomas" onChangeText={setLanguagesText} placeholder="Español, Ingles" value={languagesText} />
          <TextField
            label="Biografia para pacientes"
            multiline
            onChangeText={setBio}
            placeholder="Describe tu enfoque medico, experiencia y tipo de pacientes que atiendes."
            value={bio}
          />
        </View>

        {localError || authError ? <Text style={styles.error}>{localError ?? authError}</Text> : null}

        <PrimaryButton
          disabled={!canSave}
          icon="checkmark-circle-outline"
          label={saving ? "Guardando perfil..." : "Completar registro medico"}
          loading={saving}
          onPress={() => void handleSave()}
          style={styles.action}
        />
        <PrimaryButton label="Cerrar sesion" onPress={logout} variant="ghost" />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  action: {
    marginHorizontal: spacing.lg
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "800",
    marginHorizontal: spacing.lg
  },
  eyebrow: {
    color: "#dff8ff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  formCard: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    ...cardShadow
  },
  header: {
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    minHeight: 220,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl
  },
  photo: {
    borderRadius: 34,
    height: 116,
    width: 116
  },
  photoButton: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 38,
    borderWidth: 1,
    height: 132,
    justifyContent: "center",
    width: 132
  },
  photoCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: -44,
    padding: spacing.md,
    ...cardShadow
  },
  photoCopy: {
    flex: 1,
    gap: spacing.xs
  },
  photoPlaceholder: {
    alignItems: "center",
    gap: spacing.xs
  },
  photoPlaceholderText: {
    color: palette.primaryStrong,
    fontSize: 13,
    fontWeight: "900"
  },
  photoText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18
  },
  photoTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900"
  },
  subtitle: {
    color: "#e8fbff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: spacing.sm
  },
  title: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: spacing.sm
  }
});
