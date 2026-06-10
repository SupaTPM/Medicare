import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  mockAlerts,
  mockAppointments,
  mockCredentials,
  mockDoctorProfiles,
  mockDocuments,
  mockPatients,
  mockRecords,
  mockUsers
} from "@/data/mockData";
import {
  createDeviceRegistration,
  loadDeviceRegistration,
  normalizeCedula,
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
  medicalRecords: MedicalRecord[];
  patients: Patient[];
  user: UserProfile | null;
  authError: string | null;
  login: (email: string, password: string) => boolean;
  loginDoctor: (email: string, password: string) => boolean;
  loginWithCedula: (cedula: string) => boolean;
  loginAsRole: (role: UserRole) => void;
  registerDevicePatient: (cedula: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  retryDeviceSync: () => Promise<void>;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [deviceRegistration, setDeviceRegistration] = useState<DevicePatientRegistration | null>(null);

  useEffect(() => {
    let active = true;

    loadDeviceRegistration()
      .then((registration) => {
        if (!active) {
          return;
        }

        setDeviceRegistration(registration);
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

  useEffect(() => {
    if (!deviceRegistration || deviceRegistration.syncStatus !== "pending") {
      return;
    }

    syncDeviceRegistration(deviceRegistration).then(setDeviceRegistration);
  }, [deviceRegistration]);

  const patients = useMemo(() => {
    if (!deviceRegistration || mockPatients.some((item) => item.cedula === deviceRegistration.cedula)) {
      return mockPatients;
    }

    return [
      {
        id: deviceRegistration.id,
        fullName: deviceRegistration.fullName,
        cedula: deviceRegistration.cedula,
        age: 0,
        bloodType: "Pendiente",
        allergies: [],
        phone: "Pendiente",
        lastVisit: "Primer acceso",
        nextSpecialty: "Medicina general"
      },
      ...mockPatients
    ];
  }, [deviceRegistration]);

  function buildPatientUser(registration: DevicePatientRegistration): UserProfile {
    return {
      id: registration.id,
      name: registration.fullName,
      email: `${registration.cedula}@local.medflow`,
      role: "patient",
      subtitle: "Paciente registrado en este celular"
    };
  }

  const value = useMemo<AppState>(
    () => ({
      alerts: mockAlerts,
      appointments: mockAppointments,
      doctorProfiles: mockDoctorProfiles,
      deviceRegistration,
      documents: mockDocuments,
      isReady,
      medicalRecords: mockRecords,
      patients,
      user,
      authError,
      login: (email, password) => {
        const credential = mockCredentials.find(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
        );

        const nextUser = credential ? mockUsers.find((item) => item.id === credential.userId) : null;

        if (!nextUser) {
          setAuthError("Credenciales incorrectas. Revisa el correo y la contrasena.");
          return false;
        }

        setAuthError(null);
        setUser(nextUser);
        return true;
      },
      loginDoctor: (email, password) => {
        const credential = mockCredentials.find(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
        );

        const nextUser =
          credential ? mockDoctorProfiles.find((item) => item.id === credential.userId) ?? null : null;

        if (!nextUser) {
          setAuthError("Acceso doctor invalido. Revisa correo y contrasena.");
          return false;
        }

        setAuthError(null);
        setUser(nextUser);
        return true;
      },
      loginWithCedula: (cedula) => {
        const normalizedCedula = normalizeCedula(cedula);

        if (!deviceRegistration || normalizedCedula !== deviceRegistration.cedula) {
          setAuthError("Cedula no coincide con registro local de este celular.");
          return false;
        }

        setAuthError(null);
        setUser(buildPatientUser(deviceRegistration));
        return true;
      },
      loginAsRole: (role) => {
        const nextUser = mockUsers.find((item) => item.role === role) ?? mockUsers[0];
        setAuthError(null);
        setUser(nextUser);
      },
      registerDevicePatient: async (cedula, fullName) => {
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
        setAuthError(null);
        setUser(buildPatientUser(registration));
        return true;
      },
      logout: () => {
        setAuthError(null);
        setUser(null);
      },
      retryDeviceSync: async () => {
        if (!deviceRegistration) {
          return;
        }

        const syncedRegistration = await syncDeviceRegistration({
          ...deviceRegistration,
          syncStatus: "pending"
        });

        setDeviceRegistration(syncedRegistration);
      }
    }),
    [authError, deviceRegistration, isReady, patients, user]
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
