import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  loadCurrentPatient,
  createAppointmentRequest,
  createPublicAppointmentRequest,
  CreateAppointmentPayload,
  createMedicalRecordRequest,
  CreateMedicalRecordPayload,
  createPatientRequest,
  CreatePatientPayload,
  completePatientProfileRequest,
  CompletePatientProfilePayload,
  loginWithCedulaRequest,
  loadDoctorAvailability,
  loadDoctorProfile,
  updateDoctorProfileRequest,
  UpdateDoctorProfilePayload,
  buildAlerts,
  loadAppointments,
  loadScheduleDoctors,
  loadScheduleSpecialties,
  loadPatientDocuments,
  loadPatientRecords,
  loadPatients,
  registerDevicePatientRequest,
  searchPatients as searchPatientsRequest,
  loadUsers,
  loginRequest
} from "@/services/medicalApi";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "@/services/authSession";
import {
  createDeviceRegistration,
  loadDeviceRegistration,
  normalizeCedula,
  saveDeviceRegistration,
  syncDeviceRegistration
} from "@/services/deviceRegistration";
import {
  AlertItem,
  Appointment,
  AvailabilitySlot,
  DevicePatientRegistration,
  DoctorOption,
  MedicalDocument,
  MedicalRecord,
  Patient,
  UserProfile,
  UserRole
} from "@/types";

type AppState = {
  alerts: AlertItem[];
  appointments: Appointment[];
  doctorProfiles: UserProfile[];
  deviceRegistration: DevicePatientRegistration | null;
  documents: MedicalDocument[];
  isReady: boolean;
  isSyncing: boolean;
  medicalRecords: MedicalRecord[];
  patients: Patient[];
  users: UserProfile[];
  user: UserProfile | null;
  authError: string | null;
  createAppointment: (payload: CreateAppointmentPayload) => Promise<Appointment | null>;
  createMedicalRecord: (payload: CreateMedicalRecordPayload) => Promise<boolean>;
  createPatient: (payload: CreatePatientPayload) => Promise<boolean>;
  completePatientProfile: (payload: CompletePatientProfilePayload) => Promise<boolean>;
  getAvailableSlots: (doctorId: string) => Promise<AvailabilitySlot[]>;
  getDoctorProfile: (doctorId: string) => Promise<DoctorOption | null>;
  getDoctorsBySpecialty: (specialty: string) => Promise<DoctorOption[]>;
  getSpecialties: () => Promise<string[]>;
  login: (email: string, password: string) => Promise<boolean>;
  loginDoctor: (email: string, password: string) => Promise<boolean>;
  loginWithCedula: (cedula: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  refreshData: () => Promise<void>;
  registerDevicePatient: (cedula: string, fullName: string) => Promise<boolean>;
  retryDeviceSync: () => Promise<void>;
  searchPatients: (query: string) => Promise<Patient[]>;
  updateDoctorProfile: (payload: UpdateDoctorProfilePayload) => Promise<boolean>;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [deviceRegistration, setDeviceRegistration] = useState<DevicePatientRegistration | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);

  const doctorProfiles = useMemo(() => users.filter((item) => item.role === "doctor"), [users]);
  const alerts = useMemo(() => buildAlerts(patients), [patients]);

  useEffect(() => {
    let active = true;

    Promise.all([loadDeviceRegistration(), loadAuthSession()])
      .then(async ([registration, session]) => {
        if (active) {
          setDeviceRegistration(registration);
        }

        if (active && session?.token) {
          try {
            setToken(session.token);
            setUser(session.user);
            await refreshDataWithToken(session.token, undefined, session.user);
          } catch {
            setToken(null);
            setUser(null);
            await clearAuthSession();
          }
        }
      })
      .finally(() => {
        if (active) {
          setIsReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshDataWithToken(nextToken: string, nextUsers?: UserProfile[], nextUser?: UserProfile | null) {
    setIsSyncing(true);

    try {
      const sessionUser = nextUser ?? user;
      const isPatientSession = sessionUser?.role === "patient";
      let resolvedDoctorUser: UserProfile | null = null;

      if (sessionUser?.role === "doctor") {
        const doctorProfile = await loadDoctorProfile(nextToken, sessionUser.id);
        resolvedDoctorUser = doctorProfile;
        setUser(doctorProfile);
        await saveAuthSession({ token: nextToken, user: doctorProfile });

        if (!doctorProfile.doctorProfileCompleted) {
          setUsers([doctorProfile]);
          setPatients([]);
          setAppointments([]);
          setMedicalRecords([]);
          setDocuments([]);
          return;
        }
      }

      const usersPromise = isPatientSession
        ? Promise.resolve<UserProfile[]>([])
        : nextUsers ?? loadUsers(nextToken);
      const patientsPromise = isPatientSession
        ? loadCurrentPatient(nextToken).then((patient) => [patient])
        : loadPatients(nextToken);

      const [loadedUsers, loadedPatients] = await Promise.all([usersPromise, patientsPromise]);
      let resolvedUsers = loadedUsers;

      if (resolvedDoctorUser) {
        if (!resolvedUsers.some((item) => item.id === resolvedDoctorUser?.id)) {
          resolvedUsers = [resolvedDoctorUser, ...resolvedUsers];
        }
      }

      const loadedAppointments = await loadAppointments(nextToken, resolvedUsers);

      const [loadedRecords, loadedDocuments] = await Promise.all([
        Promise.all(loadedPatients.map((patient) => loadPatientRecords(nextToken, patient.id))).then((items) => items.flat()),
        Promise.all(loadedPatients.map((patient) => loadPatientDocuments(nextToken, patient.id))).then((items) => items.flat())
      ]);

      setUsers(resolvedUsers);
      setPatients(loadedPatients);
      setAppointments(loadedAppointments);
      setMedicalRecords(loadedRecords);
      setDocuments(loadedDocuments);
    } finally {
      setIsSyncing(false);
    }
  }

  async function refreshData() {
    if (!token) {
      return;
    }

    await refreshDataWithToken(token);
  }

  async function login(email: string, password: string) {
    try {
      setIsSyncing(true);
      setAuthError(null);
      const response = await loginRequest(email.trim(), password);
      setToken(response.token);
      setUser(response.user);
      await saveAuthSession({ token: response.token, user: response.user });
      await refreshDataWithToken(response.token, undefined, response.user);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
      setIsSyncing(false);
      return false;
    }
  }

  async function loginDoctor(email: string, password: string) {
    const loggedIn = await login(email, password);

    if (!loggedIn) {
      return false;
    }

    return true;
  }

  async function loginWithCedula(cedula: string) {
    const normalizedCedula = normalizeCedula(cedula);

    if (normalizedCedula.length !== 10) {
      setAuthError("Cedula invalida. Debe tener 10 digitos.");
      return false;
    }

    try {
      setIsSyncing(true);
      setAuthError(null);
      const response = await loginWithCedulaRequest(normalizedCedula);
      setToken(response.token);
      setUser(response.user);
      await saveAuthSession({ token: response.token, user: response.user });

      if (response.patient) {
        const responsePatient = response.patient;
        setDeviceRegistration((current) => {
          const nextRegistration = {
            id: current?.id ?? `device-${normalizedCedula}`,
            cedula: normalizedCedula,
            fullName: responsePatient.fullName ?? current?.fullName ?? "Paciente",
            createdAt: current?.createdAt ?? new Date().toISOString(),
            syncStatus: "synced" as const,
            lastSyncAttemptAt: new Date().toISOString(),
            remoteId: responsePatient.id
          };

          void saveDeviceRegistration(nextRegistration);
          return nextRegistration;
        });
      }

      await refreshDataWithToken(response.token, undefined, response.user);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Paciente no encontrado.");
      setIsSyncing(false);
      return false;
    }
  }

  function loginAsRole(role: UserRole) {
    const nextUser = users.find((item) => item.role === role);

    if (!nextUser) {
      setAuthError("No existe un usuario real con ese rol. Inicia sesion con credenciales reales.");
      return;
    }

    setAuthError(null);
    setUser(nextUser);
  }

  async function registerDevicePatient(cedula: string, fullName: string) {
    const normalizedCedula = normalizeCedula(cedula);
    const trimmedName = fullName.trim();

    if (normalizedCedula.length !== 10) {
      setAuthError("Cedula invalida. Debe tener 10 digitos.");
      return false;
    }

    if (trimmedName.length < 5) {
      setAuthError("Ingresa nombres completos.");
      return false;
    }

    const registration = await createDeviceRegistration(normalizedCedula, trimmedName);
    setDeviceRegistration(registration);
    const syncedRegistration = await syncDeviceRegistration(registration);
    setDeviceRegistration(syncedRegistration);

    try {
      setIsSyncing(true);
      const response = await registerDevicePatientRequest(normalizedCedula, trimmedName);
      const remotePatient = response.patient;
      const nextRegistration = {
        ...syncedRegistration,
        syncStatus: "synced" as const,
        lastSyncAttemptAt: new Date().toISOString(),
        remoteId: remotePatient?.id ?? syncedRegistration.remoteId
      };

      setDeviceRegistration(nextRegistration);
      await saveDeviceRegistration(nextRegistration);
      setToken(response.token);
      setUser(response.user);
      await saveAuthSession({ token: response.token, user: response.user });
      await refreshDataWithToken(response.token, undefined, response.user);
      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo registrar el paciente.");
      setIsSyncing(false);
      return false;
    }
  }

  async function retryDeviceSync() {
    if (!deviceRegistration) {
      return;
    }

    const syncedRegistration = await syncDeviceRegistration({
      ...deviceRegistration,
      syncStatus: "pending"
    });

    setDeviceRegistration(syncedRegistration);
    await saveDeviceRegistration(syncedRegistration);
  }

  async function searchPatients(query: string) {
    if (!token) {
      setAuthError("Sin token, vuelve a iniciar sesion.");
      return [];
    }

    try {
      const results = await searchPatientsRequest(token, query);
      setAuthError(null);
      return results;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo buscar pacientes.");
      return [];
    }
  }

  async function createPatient(payload: CreatePatientPayload) {
    if (!token) {
      setAuthError("Inicia sesion para crear pacientes reales.");
      return false;
    }

    try {
      const createdPatient = await createPatientRequest(token, payload);
      setPatients((currentPatients) => [createdPatient, ...currentPatients]);
      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo crear el paciente.");
      return false;
    }
  }

  async function completePatientProfile(payload: CompletePatientProfilePayload) {
    if (!token) {
      setAuthError("Sin token, vuelve a iniciar sesion.");
      return false;
    }

    try {
      const updatedPatient = await completePatientProfileRequest(token, payload);
      setPatients((currentPatients) => {
        const others = currentPatients.filter((item) => item.id !== updatedPatient.id);
        return [updatedPatient, ...others];
      });

      if (user) {
        const nextUser = { ...user, name: updatedPatient.fullName };
        setUser(nextUser);
        await saveAuthSession({ token, user: nextUser });
      }

      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo guardar tu registro medico.");
      return false;
    }
  }

  async function getSpecialties() {
    return loadScheduleSpecialties(token ?? "");
  }

  async function getDoctorsBySpecialty(specialty: string) {
    return loadScheduleDoctors(token ?? "", specialty);
  }

  async function getAvailableSlots(doctorId: string) {
    return loadDoctorAvailability(token ?? "", doctorId);
  }

  async function getDoctorProfile(doctorId: string) {
    try {
      const doctor = await loadDoctorProfile(token ?? "", doctorId);
      setAuthError(null);
      return doctor;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo cargar el perfil del medico.");
      return null;
    }
  }

  async function createAppointment(payload: CreateAppointmentPayload) {
    try {
      const createdAppointment = token
        ? await createAppointmentRequest(token, payload, users)
        : await createPublicAppointmentRequest(payload, users);
      setAppointments((currentAppointments) => [createdAppointment, ...currentAppointments]);
      setAuthError(null);
      return createdAppointment;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo crear la cita.");
      return null;
    }
  }

  async function createMedicalRecord(payload: CreateMedicalRecordPayload) {
    if (!token) {
      setAuthError("Inicia sesion para crear historias clinicas reales.");
      return false;
    }

    try {
      const createdRecord = await createMedicalRecordRequest(token, payload);
      setMedicalRecords((currentRecords) => [createdRecord, ...currentRecords]);
      await refreshDataWithToken(token);
      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo crear el registro medico.");
      return false;
    }
  }

  async function updateDoctorProfile(payload: UpdateDoctorProfilePayload) {
    if (!token || !user || user.role !== "doctor") {
      setAuthError("Inicia sesion como doctor para completar el perfil.");
      return false;
    }

    try {
      const updatedDoctor = await updateDoctorProfileRequest(token, user.id, payload);
      setUser(updatedDoctor);
      setUsers((currentUsers) => {
        const others = currentUsers.filter((item) => item.id !== updatedDoctor.id);
        return [updatedDoctor, ...others];
      });
      await saveAuthSession({ token, user: updatedDoctor });
      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo completar el perfil medico.");
      return false;
    }
  }

  function logout() {
    setAuthError(null);
    setToken(null);
    setUser(null);
    setUsers([]);
    setPatients([]);
    setAppointments([]);
    setMedicalRecords([]);
    setDocuments([]);
    void clearAuthSession();
  }

  const value = useMemo<AppState>(
    () => ({
      alerts,
      appointments,
      doctorProfiles,
      deviceRegistration,
      documents,
      isReady,
      isSyncing,
      medicalRecords,
      patients,
      users,
      user,
      authError,
      createAppointment,
      createMedicalRecord,
      createPatient,
      completePatientProfile,
      getAvailableSlots,
      getDoctorProfile,
      getDoctorsBySpecialty,
      getSpecialties,
      login,
      loginDoctor,
      loginWithCedula,
      loginAsRole,
      logout,
      refreshData,
      registerDevicePatient,
      retryDeviceSync,
      searchPatients,
      updateDoctorProfile
    }),
    [alerts, appointments, authError, deviceRegistration, documents, doctorProfiles, isReady, isSyncing, medicalRecords, patients, users, user, token]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }

  return context;
}
