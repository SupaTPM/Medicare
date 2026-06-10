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

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

// Si el backend no responde (apagado, IP incorrecta, firewall bloqueando el
// puerto), fetch() puede quedarse colgado indefinidamente. Forzamos un
// timeout para que el error aparezca rapido en vez de dejar la pantalla
// "cargando" para siempre.
const REQUEST_TIMEOUT_MS = 10000;
const MULTIPART_REQUEST_TIMEOUT_MS = 60000;

function getApiErrorMessage(payload: ApiErrorPayload, fallback: string) {
  if (payload.errors) {
    const firstValidationError = Object.values(payload.errors).flat()[0];

    if (firstValidationError) {
      return firstValidationError;
    }
  }

  return payload.message ?? fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> | undefined)
      },
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`No se pudo conectar con ${API_URL}. Verifica que el backend este encendido y accesible en la red.`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      message = getApiErrorMessage(payload, message);
    } catch {
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function apiMultipartRequest<T>(path: string, formData: FormData, token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MULTIPART_REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`La carga del archivo tardó demasiado. Verifica que el backend siga encendido y vuelve a intentar.`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      message = getApiErrorMessage(payload, message);
    } catch {
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export { API_URL };
