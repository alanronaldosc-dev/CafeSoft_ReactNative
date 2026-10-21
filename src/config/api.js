
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ============================================
// CONFIGURACIÓN DE LA API
// ============================================

export const BASE_URL =
  "http://192.168.100.7:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// AGREGAR JWT AUTOMÁTICAMENTE
// ============================================

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(
      "jwt_token"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    if (__DEV__) {
      console.log(
        "[API REQUEST]",
        config.method?.toUpperCase(),
        config.url,
        "JWT presente:",
        Boolean(token)
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// MANEJO DE RESPUESTAS
// ============================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (__DEV__) {
      console.log(
        "[API RESPONSE ERROR]",
        "HTTP:",
        status ?? "Sin respuesta",
        "URL:",
        url
      );
    }

    // 401: La autenticación no fue aceptada.
    // No eliminar automáticamente la sesión:
    // primero debemos conocer la causa exacta.
    if (status === 401) {
      console.warn(
        "HTTP 401: autenticación no aceptada."
      );
    }

    // 403: Acceso prohibido.
    // NO borrar el JWT por este motivo.
    if (status === 403) {
      console.warn(
        "HTTP 403: acceso rechazado por el servidor."
      );
    }

    return Promise.reject(error);
  }
);

export default api;
