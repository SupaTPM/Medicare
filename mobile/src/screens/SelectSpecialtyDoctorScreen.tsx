import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BookingStepper } from "@/components/BookingStepper";
import { DoctorListCard } from "@/components/DoctorListCard";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { spacing } from "@/theme/spacing";
import { DoctorOption } from "@/types";

const ALL_SPECIALTIES_LABEL = "Todas";

function SpecialtyChip({
  active,
  label,
  onPress
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : null]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

export function SelectSpecialtyDoctorScreen({ navigation }: any) {
  const { getDoctorsBySpecialty, getSpecialties } = useAppState();
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(ALL_SPECIALTIES_LABEL);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    let active = true;

    getSpecialties()
      .then((items) => {
        if (active) {
          setSpecialties(items);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingSpecialties(false);
        }
      });

    return () => {
      active = false;
    };
  }, [getSpecialties]);

  useEffect(() => {
    if (loadingSpecialties) {
      return;
    }

    let active = true;
    setLoadingDoctors(true);

    const loadAll = async () => {
      if (selectedSpecialty === ALL_SPECIALTIES_LABEL) {
        const results = await Promise.all(specialties.map((specialty) => getDoctorsBySpecialty(specialty)));
        return results.flat();
      }

      return getDoctorsBySpecialty(selectedSpecialty);
    };

    loadAll()
      .then((items) => {
        if (active) {
          setDoctors(items);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingDoctors(false);
        }
      });

    return () => {
      active = false;
    };
  }, [getDoctorsBySpecialty, loadingSpecialties, selectedSpecialty, specialties]);

  const filteredDoctors = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      return doctor.name.toLowerCase().includes(query) || doctor.specialty.toLowerCase().includes(query);
    });
  }, [doctors, searchText]);

  function handleDoctorPress(doctor: DoctorOption) {
    navigation.navigate("DoctorProfile", {
      doctorId: doctor.id,
      doctor,
      bookingMode: true,
      specialty: doctor.specialty
    });
  }

  return (
    <Screen contentContainerStyle={{ gap: spacing.md }}>
      <SectionTitle eyebrow="Nueva cita" title="Reservar turno" />
      <BookingStepper currentStep={1} />

      <View style={styles.searchWrap}>
        <Ionicons color={palette.textSubtle} name="search-outline" size={18} style={styles.searchIcon} />
        <TextField
          label=""
          onChangeText={setSearchText}
          placeholder="Encontrar un especialista..."
          style={styles.searchInput}
          value={searchText}
        />
      </View>

      {loadingSpecialties ? (
        <SkeletonList count={1} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyRow}>
          <SpecialtyChip
            active={selectedSpecialty === ALL_SPECIALTIES_LABEL}
            label={ALL_SPECIALTIES_LABEL}
            onPress={() => setSelectedSpecialty(ALL_SPECIALTIES_LABEL)}
          />
          {specialties.map((specialty) => (
            <SpecialtyChip
              active={selectedSpecialty === specialty}
              key={specialty}
              label={specialty}
              onPress={() => setSelectedSpecialty(specialty)}
            />
          ))}
        </ScrollView>
      )}

      {loadingDoctors ? <SkeletonList count={3} /> : null}

      {!loadingDoctors && !filteredDoctors.length ? (
        <Text style={styles.helperText}>No se encontraron medicos para tu busqueda.</Text>
      ) : null}

      {!loadingDoctors
        ? filteredDoctors.map((doctor) => (
            <DoctorListCard doctor={doctor} key={doctor.id} onPress={() => handleDoctorPress(doctor)} />
          ))
        : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: palette.surfaceRaised,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  chipActive: {
    backgroundColor: palette.primaryStrong,
    borderColor: palette.primaryStrong
  },
  chipText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800"
  },
  chipTextActive: {
    color: "#ffffff"
  },
  helperText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    textAlign: "center"
  },
  searchIcon: {
    left: spacing.md,
    position: "absolute",
    top: 16,
    zIndex: 1
  },
  searchInput: {
    paddingLeft: spacing.xl
  },
  searchWrap: {
    position: "relative"
  },
  specialtyRow: {
    flexGrow: 0
  }
});
