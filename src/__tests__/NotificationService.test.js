// Pruebas unitarias del registro de notificaciones push.
// Se mockean Expo y la API para no depender de un dispositivo real.

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { HIGH: 4 },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        eas: { projectId: 'proyecto-de-prueba' },
      },
    },
  },
}));

jest.mock('../config/api', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
  },
}));

import * as Notifications from 'expo-notifications';
import api from '../config/api';
import {
  eliminarToken,
  obtenerExpoPushToken,
  registrarToken,
} from '../services/NotificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.put.mockResolvedValue({ data: {} });
  });

  it('no registra token cuando el permiso fue denegado', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const resultado = await registrarToken(7);

    expect(resultado).toEqual({
      ok: false,
      motivo: 'PERMISO_DENEGADO',
    });
    expect(api.put).not.toHaveBeenCalled();
  });

  it('obtiene el ExponentPushToken cuando hay permiso', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[token-de-prueba]',
    });

    const resultado = await obtenerExpoPushToken();

    expect(resultado).toEqual({
      ok: true,
      token: 'ExponentPushToken[token-de-prueba]',
    });
  });

  it('envía el token al backend con el id del usuario', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[token-de-prueba]',
    });

    const resultado = await registrarToken(7);

    expect(resultado.ok).toBe(true);
    expect(api.put).toHaveBeenCalledWith('/usuarios/7/push-token', {
      pushToken: 'ExponentPushToken[token-de-prueba]',
    });
  });

  it('reporta un error si el backend rechaza el token', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[token-de-prueba]',
    });
    api.put.mockRejectedValue(new Error('403'));

    const resultado = await registrarToken(7);

    expect(resultado.ok).toBe(false);
    expect(resultado.motivo).toBe('ERROR_BACKEND');
  });

  it('limpia el token al cerrar sesión', async () => {
    await eliminarToken(7);

    expect(api.put).toHaveBeenCalledWith('/usuarios/7/push-token', {
      pushToken: null,
    });
  });
});
