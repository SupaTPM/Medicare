import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  createAppointmentRequest,
  CreateAppointmentPayload,
  createMedicalRecordRequest,
  CreateMedicalRecordPayload,
  createPatientRequest,
  CreatePatientPayload,
  buildAlerts,
  loadAppointments,
  loadPatientDocuments,
  loadPatientRecords,
  loadPatients,
  loadUsers,
  loginRequest
} from "@/services/medicalApi";
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
  DevicePatientRegistration,
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
  createAppointment: (payload: CreateAppointmentPayload) => Promise<boolean>;
  createMedicalRecord: (payload: CreateMedicalRecordPayload) => Promise<boolean>;
  createPatient: (payload: CreatePatientPayload) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginDoctor: (email: string, password: string) => Promise<boolean>;
  loginWithCedula: (cedula: string) => boolean;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  refreshData: () => Promise<void>;
  registerDevicePatient: (cedula: string, fullName: string) => Promise<boolean>;
  retryDeviceSync: () => Promise<void>;
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

    loadDeviceRegistration()
      .then((registration) => {
        if (active) {
          setDeviceRegistration(registration);
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

  async function refreshDataWithToken(nextToken: string, nextUsers?: UserProfile[]) {
    setIsSyncing(true);

    try {
      const loadedUsers = nextUsers ?? (await loadUsers(nextToken));
      const loadedPatients = await loadPatients(nextToken);
      const loadedAppointments = await loadAppointments(nextToken, loadedUsers);
      const loadedRecords = (
        await Promise.all(loadedPatients.map((patient) => loadPatientRecords(nextToken, patient.id)))
      ).flat();
      const loadedDocuments = (
        await Promise.all(loadedPatients.map((patient) => loadPatientDocuments(nextToken, patient.id)))
      ).flat();

      setUsers(loadedUsers);
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
      setAuthError(null);
      const response = await loginRequest(email.trim(), password);
      setToken(response.token);
      setUser(response.user);
      await refreshDataWithToken(response.token);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
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

  function loginWithCedula(cedula: string) {
    const normalizedCedula = normalizeCedula(cedula);
    const patient = patients.find((item) => item.cedula === normalizedCedula);

    if (!patient && (!deviceRegistration || normalizedCedula !== deviceRegistration.cedula)) {
      setAuthError("Cedula no encontrada en registros reales.");
      return false;
    }

    const displayName = patient?.fullName ?? deviceRegistration?.fullName ?? "Paciente";
    setAuthError(null);
    setUser({
      id: patient?.id ?? deviceRegistration?.id ?? normalizedCedula,
      name: displayName,
      email: `${normalizedCedula}@local.medflow`,
      role: "patient",
      subtitle: "Paciente"
    });
    return true;
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
    const syncedRegistration = await syncDeviceRegistration(registration);
    setDeviceRegistration(syncedRegistration);

    const remoteId = syncedRegistration.remoteId;

    if (remoteId) {
      setPatients((currentPatients) => {
        if (currentPatients.some((patient) => patient.id === remoteId)) {
          return currentPatients;
        }

        return [
          {
            id: remoteId,
            fullName: syncedRegistration.fullName,
            cedula: syncedRegistration.cedula,
            age: 0,
            bloodType: "No registrado",
            allergies: ["Sin alergias registradas"],
            phone: "No registrado",
            lastVisit: new Date().toLocaleDateString("es-EC")
          },
          ...currentPatients
        ];
      });
    }

    setAuthError(null);
    setUser({
      id: syncedRegistration.remoteId ?? syncedRegistration.id,
      name: syncedRegistration.fullName,
      email: `${syncedRegistration.cedula}@local.medflow`,
      role: "patient",
      subtitle: "Paciente registrado"
    });
    return syncedRegistration.syncStatus === "synced";
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

  async function createAppointment(payload: CreateAppointmentPayload) {
    if (!token) {
      setAuthError("Inicia sesion para crear citas reales.");
      return false;
    }

    try {
      const createdAppointment = await createAppointmentRequest(token, payload, users);
      setAppointments((currentAppointments) => [createdAppointment, ...currentAppointments]);
      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo crear la cita.");
      return false;
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

  function logout() {
    setAuthError(null);
    setToken(null);
    setUser(null);
    setUsers([]);
    setPatients([]);
    setAppointments([]);
    setMedicalRecords([]);
    setDocuments([]);
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
      login,
      loginDoctor,
      loginWithCedula,
      loginAsRole,
      logout,
      refreshData,
      registerDevicePatient,
      retryDeviceSync
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
