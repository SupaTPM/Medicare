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
  createReviewRequest,
  loadDoctorAvailability,
  loadDoctorProfile,
  loadDoctorReviews as loadDoctorReviewsRequest,
  updateDoctorProfileRequest,
  UpdateDoctorProfilePayload,
  loadNotifications,
  markNotificationReadRequest,
  registerDeviceTokenRequest,
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
import { getExpoPushToken } from "@/services/pushNotifications";
import {
  AlertItem,
  AppNotification,
  Appointment,
  AvailabilitySlot,
  DevicePatientRegistration,
  DoctorOption,
  MedicalDocument,
  MedicalRecord,
  Patient,
  Review,
  UserProfile,
  UserRole
} from "@/types";

type AppState = {
  alerts: AlertItem[];
  appNotifications: AppNotification[];
  appointments: Appointment[];
  doctorProfiles: UserProfile[];
  deviceRegistration: DevicePatientRegistration | null;
  documents: MedicalDocument[];
  isReady: boolean;
  isSyncing: boolean;
  loadingSections: LoadingSections;
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
  login: (identifier: string, password: string) => Promise<boolean>;
  loginDoctor: (identifier: string, password: string) => Promise<boolean>;
  loginWithCedula: (cedula: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  refreshData: () => Promise<void>;
  registerDevicePatient: (cedula: string, fullName: string) => Promise<boolean>;
  retryDeviceSync: () => Promise<void>;
  searchPatients: (query: string) => Promise<Patient[]>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  updateDoctorProfile: (payload: UpdateDoctorProfilePayload) => Promise<boolean>;
  createReview: (appointmentId: string, payload: { rating: number; comment?: string }) => Promise<boolean>;
  loadDoctorReviews: (doctorId: string) => Promise<Review[]>;
};

type LoadingSections = {
  users: boolean;
  patients: boolean;
  appointments: boolean;
  medicalRecords: boolean;
  documents: boolean;
  notifications: boolean;
  doctorProfile: boolean;
};

const EMPTY_LOADING_SECTIONS: LoadingSections = {
  users: false,
  patients: false,
  appointments: false,
  medicalRecords: false,
  documents: false,
  notifications: false,
  doctorProfile: false
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
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [loadingSections, setLoadingSections] = useState<LoadingSections>(EMPTY_LOADING_SECTIONS);

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
      void registerPushToken(nextToken);
      const sessionUser = nextUser ?? user;
      const isPatientSession = sessionUser?.role === "patient";
      let resolvedDoctorUser: UserProfile | null = null;

      if (sessionUser?.role === "doctor") {
        setLoadingSection("doctorProfile", true);
        let doctorProfile: DoctorOption;

        try {
          doctorProfile = await loadDoctorProfile(nextToken, sessionUser.id);
        } finally {
          setLoadingSection("doctorProfile", false);
        }

        resolvedDoctorUser = doctorProfile;
        setUser(doctorProfile);
        await saveAuthSession({ token: nextToken, user: doctorProfile });

        if (!doctorProfile.doctorProfileCompleted) {
          setUsers([doctorProfile]);
          setPatients([]);
          setAppointments([]);
          setMedicalRecords([]);
          setDocuments([]);
          setLoadingSection("notifications", true);
          try {
            setAppNotifications(await loadNotifications(nextToken));
          } finally {
            setLoadingSection("notifications", false);
          }
          return;
        }
      }

      const usersTask = (async (): Promise<UserProfile[]> => {
        if (isPatientSession) {
          setUsers([]);
          return [];
        }

        if (nextUsers) {
          setUsers(nextUsers);
          return nextUsers;
        }

        setLoadingSection("users", true);
        try {
          const loadedUsers = await loadUsers(nextToken);
          setUsers(loadedUsers);
          return loadedUsers;
        } finally {
          setLoadingSection("users", false);
        }
      })();

      const patientsTask = (async (): Promise<Patient[]> => {
        setLoadingSection("patients", true);
        try {
          const loadedPatients = isPatientSession
            ? [await loadCurrentPatient(nextToken)]
            : await loadPatients(nextToken);
          setPatients(loadedPatients);
          return loadedPatients;
        } finally {
          setLoadingSection("patients", false);
        }
      })();

      const appointmentsTask = usersTask.then(async (loadedUsers): Promise<void> => {
        let resolvedUsers = loadedUsers;

        if (resolvedDoctorUser && !resolvedUsers.some((item) => item.id === resolvedDoctorUser?.id)) {
          resolvedUsers = [resolvedDoctorUser, ...resolvedUsers];
          setUsers(resolvedUsers);
        }

        setLoadingSection("appointments", true);
        try {
          setAppointments(await loadAppointments(nextToken, resolvedUsers));
        } finally {
          setLoadingSection("appointments", false);
        }
      });

      const recordsTask = patientsTask.then(async (loadedPatients): Promise<void> => {
        setLoadingSection("medicalRecords", true);
        try {
          const loadedRecords = await Promise.all(
            loadedPatients.map((patient) => loadPatientRecords(nextToken, patient.id))
          ).then((items) => items.flat());
          setMedicalRecords(loadedRecords);
        } finally {
          setLoadingSection("medicalRecords", false);
        }
      });

      const documentsTask = patientsTask.then(async (loadedPatients): Promise<void> => {
        setLoadingSection("documents", true);
        try {
          const loadedDocuments = await Promise.all(
            loadedPatients.map((patient) => loadPatientDocuments(nextToken, patient.id))
          ).then((items) => items.flat());
          setDocuments(loadedDocuments);
        } finally {
          setLoadingSection("documents", false);
        }
      });

      const notificationsTask = (async (): Promise<void> => {
        setLoadingSection("notifications", true);
        try {
          setAppNotifications(await loadNotifications(nextToken));
        } finally {
          setLoadingSection("notifications", false);
        }
      })();

      await Promise.all([
        usersTask,
        patientsTask,
        appointmentsTask,
        recordsTask,
        documentsTask,
        notificationsTask
      ]);
    } finally {
      setIsSyncing(false);
    }
  }

  function setLoadingSection(section: keyof LoadingSections, loading: boolean) {
    setLoadingSections((current) => ({
      ...current,
      [section]: loading
    }));
  }

  async function registerPushToken(nextToken: string) {
    try {
      const expoToken = await getExpoPushToken();

      if (!expoToken) {
        return;
      }

      await registerDeviceTokenRequest(nextToken, {
        token: expoToken,
        platform: "expo"
      });
    } catch {
    }
  }

  async function refreshData() {
    if (!token) {
      return;
    }

    await refreshDataWithToken(token);
  }

  async function login(identifier: string, password: string) {
    try {
      setIsSyncing(true);
      setAuthError(null);
      const trimmedIdentifier = identifier.trim();
      const normalizedCedula = normalizeCedula(trimmedIdentifier);
      const response = normalizedCedula.length === 10 && normalizedCedula === trimmedIdentifier && !password.trim()
        ? await loginWithCedulaRequest(normalizedCedula)
        : await loginRequest(trimmedIdentifier, password);
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

  async function loginDoctor(identifier: string, password: string) {
    const loggedIn = await login(identifier, password);

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
      if (token) {
        setAppNotifications(await loadNotifications(token));
      }
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

  async function createReview(appointmentId: string, payload: { rating: number; comment?: string }) {
    if (!token) {
      setAuthError("Inicia sesion para dejar una resena.");
      return false;
    }

    try {
      await createReviewRequest(token, appointmentId, payload);
      setAuthError(null);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo enviar la resena.");
      return false;
    }
  }

  async function loadDoctorReviews(doctorId: string) {
    return loadDoctorReviewsRequest(token ?? null, doctorId);
  }

  async function markNotificationRead(notificationId: string) {
    if (!token) {
      return;
    }

    try {
      const updatedNotification = await markNotificationReadRequest(token, notificationId);
      setAppNotifications((currentNotifications) => currentNotifications.map((notification) => (
        notification.id === updatedNotification.id ? updatedNotification : notification
      )));
    } catch {
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
    setAppNotifications([]);
    setLoadingSections(EMPTY_LOADING_SECTIONS);
    void clearAuthSession();
  }

  const value = useMemo<AppState>(
    () => ({
      alerts,
      appNotifications,
      appointments,
      doctorProfiles,
      deviceRegistration,
      documents,
      isReady,
      isSyncing,
      loadingSections,
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
      markNotificationRead,
      updateDoctorProfile,
      createReview,
      loadDoctorReviews
    }),
    [alerts, appNotifications, appointments, authError, deviceRegistration, documents, doctorProfiles, isReady, isSyncing, loadingSections, medicalRecords, patients, users, user, token]
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
