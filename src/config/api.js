import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL =
  'http://192.168.100.3:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agregar JWT automáticamente a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token =
      await SecureStore.getItemAsync(
        'jwt_token'
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;