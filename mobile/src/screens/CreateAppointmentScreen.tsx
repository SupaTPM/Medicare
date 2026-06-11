import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppointmentSuccessModal } from "@/components/AppointmentSuccessModal";
import { FlowCard } from "@/components/FlowCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { SkeletonList } from "@/components/Skeleton";
import { TextField } from "@/components/TextField";
import { useAppState } from "@/state/AppContext";
import { palette } from "@/theme/palette";
import { cardShadow } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { Appointment, AvailabilitySlot, DoctorOption, Patient } from "@/types";

function OptionChip({
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

function DoctorCard({
  active,
  doctor,
  onPress,
  onProfilePress
}: {
  active: boolean;
  doctor: DoctorOption;
  onPress: () => void;
  onProfilePress: () => void;
}) {
  const initials = doctor.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Pressable onPress={onPress} style={[styles.doctorCard, active ? styles.doctorCardActive : null]}>
      <View style={styles.doctorIcon}>
        {doctor.profilePhotoUrl ? (
          <Image source={{ uri: doctor.profilePhotoUrl }} style={styles.doctorPhoto} />
        ) : (
          <Text style={[styles.doctorInitials, active ? styles.doctorInitialsActive : null]}>{initials || "MD"}</Text>
        )}
      </View>
      <View style={styles.doctorCopy}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorMeta}>
          {doctor.specialty}
          {doctor.experienceYears ? ` · ${doctor.experienceYears} años` : ""}
        </Text>
      </View>
      <Pressable onPress={onProfilePress} style={styles.profileButton}>
        <Text style={styles.profileButtonText}>Perfil</Text>
      </Pressable>
      {active ? <Ionicons color={palette.primaryStrong} name="checkmark-circle" size={22} /> : null}
    </Pressable>
  );
}

function SlotCard({
  active,
  onPress,
  slot
}: {
  active: boolean;
  onPress: () => void;
  slot: AvailabilitySlot;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.slotCard, active ? styles.slotCardActive : null]}>
      <Ionicons color={active ? "#ffffff" : palette.secondary} name="time-outline" size={18} />
      <Text style={[styles.slotText, active ? styles.slotTextActive : null]}>{slot.label}</Text>
    </Pressable>
  );
}

export function CreateAppointmentScreen({ navigation }: any) {
  const {
    authError,
    createAppointment,
    getAvailableSlots,
    getDoctorsBySpecialty,
    getSpecialties,
    patients,
    searchPatients,
    user
  } = useAppState();
  const isPatientUser = user?.role === "patient";
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorOption | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [reason, setReason] = useState("");
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedPatientLabel = useMemo(() => {
    if (!selectedPatient) {
      return "Sin paciente seleccionado";
    }

    return `${selectedPatient.fullName} · ${selectedPatient.cedula}`;
  }, [selectedPatient]);

  useEffect(() => {
    if (!isPatientUser) {
      return;
    }

    const currentPatient = patients[0] ?? null;
    setSelectedPatient(currentPatient);
    setPatientResults(currentPatient ? [currentPatient] : []);
    setPatientQuery(currentPatient?.fullName ?? "");
  }, [isPatientUser, patients]);

  useEffect(() => {
    if (isPatientUser) {
      return;
    }

    let active = true;
    const query = patientQuery.trim();

    if (!query) {
      setPatientResults(patients.slice(0, 5));
      return;
    }

    const timeoutId = setTimeout(() => {
      void searchPatients(query).then((results) => {
        if (active) {
          setPatientResults(results);
        }
      });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [isPatientUser, patientQuery, patients, searchPatients]);

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
    if (!selectedSpecialty) {
      setDoctors([]);
      setSelectedDoctor(null);
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    let active = true;
    setLoadingDoctors(true);
    setSelectedDoctor(null);
    setSlots([]);
    setSelectedSlot(null);

    getDoctorsBySpecialty(selectedSpecialty)
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
  }, [getDoctorsBySpecialty, selectedSpecialty]);

  useEffect(() => {
    if (!selectedDoctor) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    let active = true;
    setLoadingSlots(true);
    setSelectedSlot(null);

    getAvailableSlots(selectedDoctor.id)
      .then((items) => {
        if (active) {
          setSlots(items);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingSlots(false);
        }
      });

    return () => {
      active = false;
    };
  }, [getAvailableSlots, selectedDoctor]);

  async function handleSave() {
    if (!selectedPatient || !selectedDoctor || !selectedSpecialty || !selectedSlot) {
      return;
    }

    setSaving(true);
    const created = await createAppointment({
      availability_slot_id: Number(selectedSlot.id),
      doctor_id: Number(selectedDoctor.id),
      patient_id: Number(selectedPatient.id),
      reason,
      scheduled_at: selectedSlot.startsAt,
      specialty: selectedSpecialty,
      status: "confirmed"
    });
    setSaving(false);

    if (created) {
      setCreatedAppointment(created);
    }
  }

  function handleCloseSuccess() {
    setCreatedAppointment(null);
    navigation.navigate("Main");
  }

  const canSave = Boolean(selectedPatient && selectedDoctor && selectedSpecialty && selectedSlot && reason.trim());

  return (
    <Screen contentContainerStyle={{ gap: spacing.sm }}>
      <SectionTitle eyebrow="Nueva cita" title="Agendar atencion" />
      <FlowCard
        icon="git-branch-outline"
        meta="Especialidad, medico y turno se bloquean al confirmar"
        status="Agenda real"
        title="Selecciona disponibilidad medica"
        tone="blue"
      />

      <View style={styles.stepCard}>
        <Text style={styles.stepLabel}>1. Paciente</Text>
        {isPatientUser ? (
          <View style={styles.patientBox}>
            <Text style={styles.patientTitle}>Paciente autenticado</Text>
            <Text style={styles.patientText}>{selectedPatientLabel}</Text>
            {!selectedPatient ? <Text style={styles.helperText}>Sin token, vuelve a iniciar sesion.</Text> : null}
          </View>
        ) : (
          <>
            <TextField label="Buscar paciente" onChangeText={setPatientQuery} placeholder="Cedula o nombre" value={patientQuery} />
            <View style={styles.optionWrap}>
              {patientResults.map((patient) => (
                <OptionChip
                  active={selectedPatient?.id === patient.id}
                  key={patient.id}
                  label={`${patient.fullName} · ${patient.cedula}`}
                  onPress={() => {
                    setSelectedPatient(patient);
                    setPatientQuery(patient.fullName);
                  }}
                />
              ))}
            </View>
            {!patientResults.length ? <Text style={styles.helperText}>Paciente no encontrado.</Text> : null}
          </>
        )}
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepLabel}>2. Especialidad</Text>
        {loadingSpecialties ? (
          <SkeletonList count={2} />
        ) : (
          <View style={styles.optionWrap}>
            {specialties.map((specialty) => (
              <OptionChip
                active={selectedSpecialty === specialty}
                key={specialty}
                label={specialty}
                onPress={() => setSelectedSpecialty(specialty)}
              />
            ))}
          </View>
        )}
        {!loadingSpecialties && !specialties.length ? (
          <Text style={styles.helperText}>No hay especialidades configuradas. Ejecuta el seed o crea perfiles medicos.</Text>
        ) : null}
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepLabel}>3. Medico disponible</Text>
        {!selectedSpecialty ? <Text style={styles.helperText}>Selecciona una especialidad para ver medicos.</Text> : null}
        {loadingDoctors ? <SkeletonList count={2} /> : null}
        {!loadingDoctors && selectedSpecialty && !doctors.length ? <Text style={styles.helperText}>No hay medicos para esta especialidad.</Text> : null}
        {doctors.map((doctor) => (
          <DoctorCard
            active={selectedDoctor?.id === doctor.id}
            doctor={doctor}
            key={doctor.id}
            onPress={() => setSelectedDoctor(doctor)}
            onProfilePress={() => navigation.navigate("DoctorProfile", { doctorId: doctor.id, doctor })}
          />
        ))}
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepLabel}>4. Turno disponible</Text>
        {!selectedDoctor ? <Text style={styles.helperText}>Selecciona un medico para ver turnos preestablecidos.</Text> : null}
        {loadingSlots ? <SkeletonList count={2} /> : null}
        {!loadingSlots && selectedDoctor && !slots.length ? <Text style={styles.helperText}>Este medico no tiene turnos libres.</Text> : null}
        {slots.map((slot) => (
          <SlotCard
            active={selectedSlot?.id === slot.id}
            key={slot.id}
            onPress={() => setSelectedSlot(slot)}
            slot={slot}
          />
        ))}
      </View>

      <TextField label="Motivo" multiline onChangeText={setReason} value={reason} />
      {authError ? <Text style={styles.error}>{authError}</Text> : null}
      <PrimaryButton
        disabled={!canSave}
        icon="qr-code-outline"
        label={saving ? "Guardando..." : "Guardar Turno"}
        loading={saving}
        onPress={() => void handleSave()}
      />

      <AppointmentSuccessModal
        appointment={createdAppointment}
        onClose={handleCloseSuccess}
        visible={Boolean(createdAppointment)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: palette.surfaceRaised,
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
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
  doctorCard: {
    alignItems: "center",
    backgroundColor: palette.surfaceRaised,
    borderColor: palette.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md
  },
  doctorCardActive: {
    borderColor: palette.primaryStrong,
    backgroundColor: palette.primaryFaint
  },
  doctorCopy: {
    flex: 1
  },
  doctorIcon: {
    alignItems: "center",
    backgroundColor: palette.primaryFaint,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  doctorInitials: {
    color: palette.primaryStrong,
    fontSize: 13,
    fontWeight: "900"
  },
  doctorInitialsActive: {
    color: palette.primaryDeep
  },
  doctorMeta: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  doctorName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900"
  },
  doctorPhoto: {
    borderRadius: 14,
    height: 42,
    width: 42
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    fontWeight: "700"
  },
  helperText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  patientBox: {
    backgroundColor: palette.primaryFaint,
    borderColor: palette.surfaceAccent,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.md
  },
  patientText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  patientTitle: {
    color: palette.primaryDeep,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  profileButton: {
    backgroundColor: "#ffffff",
    borderColor: palette.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  profileButtonText: {
    color: palette.primaryStrong,
    fontSize: 12,
    fontWeight: "900"
  },
  slotCard: {
    alignItems: "center",
    backgroundColor: palette.secondarySoft,
    borderColor: "#c6efd3",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md
  },
  slotCardActive: {
    backgroundColor: palette.secondary,
    borderColor: palette.secondary
  },
  slotText: {
    color: palette.secondary,
    flex: 1,
    fontSize: 13,
    fontWeight: "900"
  },
  slotTextActive: {
    color: "#ffffff"
  },
  stepCard: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    ...cardShadow
  },
  stepLabel: {
    color: palette.primaryDeep,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  }
});
