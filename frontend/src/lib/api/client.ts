import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../../types';
import { AppApiError } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Manejador común para normalizar errores de API en ambas instancias
const handleResponseError = (error: AxiosError<ApiErrorResponse>) => {
  if (error.response) {
    const data = error.response.data;
    const message =
      data?.message ||
      data?.error ||
      `Error en la petición (Código ${error.response.status})`;

    throw new AppApiError(
      message,
      error.response.status,
      data?.fieldErrors
    );
  } else if (error.request) {
    throw new AppApiError(
      'No se pudo conectar con el servidor. Comprueba la conexión o que el backend esté levantado.',
      0
    );
  } else {
    throw new AppApiError(error.message || 'Error desconocido al realizar la petición', 500);
  }
};

// =============================================================================
// Instancia 1: Cliente para Rutas Públicas (sin autenticación requerida)
// =============================================================================
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

publicApiClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

// =============================================================================
// Instancia 2: Cliente para Rutas de Administración (con JWT Bearer Token)
// =============================================================================
export const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Getter dinámico para el token JWT de Clerk
let authTokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  authTokenGetter = getter;
};

// Interceptor de Request para adjuntar siempre el token en rutas de administración
adminApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (authTokenGetter) {
      try {
        const token = await authTokenGetter();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error obteniendo el token de autenticación de Clerk:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApiClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

// Export por compatibilidad por defecto
export const apiClient = adminApiClient;
