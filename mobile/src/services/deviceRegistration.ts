import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { apiRequest, API_URL } from "@/services/api";
import { DevicePatientRegistration } from "@/types";

const DEVICE_REGISTRATION_KEY = "medflow.device.patient.registration";

function nowIso() {
  return new Date().toISOString();
}

export function normalizeCedula(value: string) {
  return value.replace(/\D/g, "");
}

async function getStoredValue(key: string) {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function loadDeviceRegistration() {
  const rawValue = await getStoredValue(DEVICE_REGISTRATION_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as DevicePatientRegistration;
}

export async function saveDeviceRegistration(registration: DevicePatientRegistration) {
  await setStoredValue(DEVICE_REGISTRATION_KEY, JSON.stringify(registration));
}

export async function createDeviceRegistration(cedula: string, fullName: string) {
  const registration: DevicePatientRegistration = {
    id: `device-${normalizeCedula(cedula)}`,
    cedula: normalizeCedula(cedula),
    fullName: fullName.trim(),
    createdAt: nowIso(),
    syncStatus: API_URL ? "pending" : "failed"
  };

  await saveDeviceRegistration(registration);

  return registration;
}

export async function syncDeviceRegistration(registration: DevicePatientRegistration) {
  try {
    const response = await apiRequest<{ id?: string; data?: { id?: string } }>("/patients/device-registration", {
      method: "POST",
      body: JSON.stringify({
        cedula: registration.cedula,
        full_name: registration.fullName,
        source: "mobile_device"
      })
    });

    const syncedRegistration: DevicePatientRegistration = {
      ...registration,
      syncStatus: "synced",
      lastSyncAttemptAt: nowIso(),
      remoteId: response.data?.id ?? response.id ?? registration.remoteId
    };

    await saveDeviceRegistration(syncedRegistration);

    return syncedRegistration;
  } catch {
    const failedRegistration: DevicePatientRegistration = {
      ...registration,
      syncStatus: "failed",
      lastSyncAttemptAt: nowIso()
    };

    await saveDeviceRegistration(failedRegistration);

    return failedRegistration;
  }
}
