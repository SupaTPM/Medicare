import { NativeModules } from "react-native";

// Puerto del backend Laravel (php artisan serve).
const LARAVEL_PORT = 8000;

// En un dispositivo fisico, "127.0.0.1" apunta al propio telefono, no a la PC de desarrollo.
// Metro/Expo sirve el bundle desde la IP LAN de la PC, asi que la extraemos de la URL del
// bundle para apuntar el API a esa misma maquina automaticamente.
function resolveApiBaseUrl(): string {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  const host = scriptURL?.split("://")[1]?.split(/[:/]/)[0];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:${LARAVEL_PORT}/api`;
  }

  return `http://127.0.0.1:${LARAVEL_PORT}/api`;
}

const API_URL = resolveApiBaseUrl();

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined)
    }
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      message = payload.message ?? message;
    } catch {
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export { API_URL };
