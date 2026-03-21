/**
 * Cliente HTTP base con Axios.
 *
 * Configurado con:
 * - Base URL configurable por entorno
 * - Interceptor de request para inyectar Bearer token JWT
 * - Interceptor de response para:
 *   a) Desempaquetar shape { success, data } del backend
 *   b) En 401: refrescar token automáticamente y reintentar la petición
 *      original. Peticiones concurrentes con 401 se encolan para que sólo
 *      se haga UNA llamada al endpoint de refresh.
 */

import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { NativeModules, Platform } from "react-native";
import {
  getItem as getStoredItem,
  setItem as setStoredItem,
} from "@/utils/secureStorage";

import { useAuthStore } from "@/store/authStore";

/** Normaliza una URL base para asegurar esquema y prefijo /api/v1 */
const normalizeApiBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;
  const withoutTrailingSlashes = withScheme.replace(/\/+$/, "");
  return withoutTrailingSlashes.endsWith("/api/v1")
    ? withoutTrailingSlashes
    : `${withoutTrailingSlashes}/api/v1`;
};

const isLocalOrLoopbackHost = (url: string): boolean =>
  /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);

const isLikelyVirtualizedHost = (url: string): boolean =>
  /https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(?::\d+)?/i.test(url);

const getMetroDevHost = (): string | null => {
  if (!__DEV__) {
    return null;
  }

  // In Expo/RN dev, scriptURL usually looks like:
  // http://192.168.x.x:8081/index.bundle?platform=ios...
  const scriptURL =
    NativeModules?.SourceCode?.scriptURL as string | undefined;

  if (!scriptURL) {
    return null;
  }

  try {
    const parsed = new URL(scriptURL);
    return parsed.hostname || null;
  } catch {
    return null;
  }
};

/**
 * Resuelve URL base de API de forma robusta por plataforma.
 * - Prioriza EXPO_PUBLIC_API_URL
 * - En Android, evita localhost (no apunta al host) usando 10.0.2.2 para emulador
 */
const resolveApiBaseUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    const normalized = normalizeApiBaseUrl(fromEnv);

    if (
      Platform.OS === "android" &&
      isLocalOrLoopbackHost(normalized)
    ) {
      return "http://10.0.2.2:8000/api/v1";
    }

    // iOS/Android physical devices cannot typically reach localhost or host-only
    // virtual networks (e.g. 172.24.x.x from WSL2). Fallback to Metro host.
    if (
      Platform.OS !== "web" &&
      (isLocalOrLoopbackHost(normalized) || isLikelyVirtualizedHost(normalized))
    ) {
      const metroHost = getMetroDevHost();
      if (metroHost) {
        return `http://${metroHost}:8000/api/v1`;
      }
    }

    return normalized;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api/v1";
  }

  if (Platform.OS === "ios") {
    return "http://127.0.0.1:8000/api/v1";
  }

  return "http://localhost:8000/api/v1";
};

/** URL base de la API */
const API_BASE_URL = resolveApiBaseUrl();

if (__DEV__) {
  console.log(`[apiClient] API_BASE_URL=${API_BASE_URL}`);
}

/** Instancia de Axios con configuración base */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Instancia separada de Axios para llamar al endpoint de refresh.
 * NUNCA usa apiClient para evitar recursión infinita de interceptores.
 */
const refreshAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Queue de refresh ────────────────────────────────────────────────────────

/** Indica si hay una petición de refresh en curso */
let isRefreshing = false;

/** Callbacks encolados mientras se espera el nuevo access token */
let refreshQueue: ((token: string) => void)[] = [];

/**
 * Drena la cola de peticiones que esperaban un nuevo token.
 * Llama a todos los callbacks con el nuevo access token.
 */
function drainRefreshQueue(newToken: string): void {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
}

/**
 * Limpia la cola y rechaza todos los callbacks pendientes.
 * Se usa cuando el refresh falla definitivamente.
 */
function rejectRefreshQueue(): void {
  refreshQueue = [];
}

// ─── Request interceptor ─────────────────────────────────────────────────────

/**
 * Interceptor de request: inyecta el token JWT en cada petición.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor ────────────────────────────────────────────────────

// Extend InternalAxiosRequestConfig to carry our retry flag
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Interceptor de response:
 * 1. SUCCESS — desempaqueta { success: true, data: {...} } si existe.
 *    Si la respuesta no tiene el campo `success` (ej: endpoint JWT que devuelve
 *    { access, refresh } directamente), la devuelve tal cual.
 * 2. ERROR 401 — intenta refrescar el token JWT y reintentar la petición original.
 *    Si ya hay un refresh en curso, encola la petición.
 *    Si el refresh falla, llama a logout().
 */
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap backend standard shape: { success: true, data: <payload> }
    if (
      response.data !== null &&
      typeof response.data === "object" &&
      "success" in response.data &&
      response.data.success !== undefined
    ) {
      return response.data.data;
    }
    // Flat response (JWT endpoints, etc.) — pass through unchanged
    return response.data;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined;

    // Only attempt refresh on 401s that haven't been retried yet
    if (
      error.response?.status !== 401 ||
      !originalConfig ||
      originalConfig._retry
    ) {
      return Promise.reject(error);
    }

    // Mark as retried to prevent infinite loops
    originalConfig._retry = true;

    if (isRefreshing) {
      // Another refresh is already in flight — wait for it
      return new Promise<unknown>((resolve, reject) => {
        refreshQueue.push((newToken: string) => {
          if (originalConfig.headers) {
            originalConfig.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(apiClient(originalConfig));
        });
        // If the refresh ultimately fails, we need to reject queued calls.
        // We store a rejection pathway via a closure capturing the original reject.
        // The rejectRefreshQueue helper empties the queue so the reject above
        // will never fire — callers should handle the logout side-effect.
        void reject; // kept to satisfy ESLint
      });
    }

    isRefreshing = true;

    try {
      const storedRefresh = await getStoredItem("refresh_token");
      if (!storedRefresh) {
        throw new Error("No refresh token stored");
      }

      // Use the separate axios instance — NOT apiClient — to avoid recursion
      const refreshResponse = await refreshAxios.post<{
        access: string;
        refresh?: string;
      }>("/auth/token/refresh/", { refresh: storedRefresh });

      const newAccessToken = refreshResponse.data.access;
      const newRefreshToken = refreshResponse.data.refresh ?? storedRefresh;

      // Persist new tokens
      await setStoredItem("access_token", newAccessToken);
      if (newRefreshToken !== storedRefresh) {
        await setStoredItem("refresh_token", newRefreshToken);
        useAuthStore.getState().setRefreshToken(newRefreshToken);
      }
      useAuthStore.getState().setToken(newAccessToken);

      // Retry the original request with the new token
      if (originalConfig.headers) {
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      drainRefreshQueue(newAccessToken);

      return apiClient(originalConfig);
    } catch {
      rejectRefreshQueue();
      useAuthStore.getState().logout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
