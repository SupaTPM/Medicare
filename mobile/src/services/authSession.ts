import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { UserProfile } from "@/types";

const AUTH_SESSION_KEY = "medflow.auth.session";

type StoredAuthSession = {
  token: string;
  user: UserProfile;
};

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

async function deleteStoredValue(key: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function loadAuthSession() {
  const rawValue = await getStoredValue(AUTH_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as StoredAuthSession;
}

export async function saveAuthSession(session: StoredAuthSession) {
  await setStoredValue(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function clearAuthSession() {
  await deleteStoredValue(AUTH_SESSION_KEY);
}
