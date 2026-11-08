import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '../config/api';

const CANAL_PEDIDOS = 'pedidos';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configurarCanalAndroid() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CANAL_PEDIDOS, {
    name: 'Estado de pedidos',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3D1A00',
    sound: 'default',
  });
}

export async function obtenerExpoPushToken() {
  const actual = await Notifications.getPermissionsAsync();
  let status = actual.status;

  if (status !== 'granted') {
    const solicitado = await Notifications.requestPermissionsAsync();
    status = solicitado.status;
  }

  if (status !== 'granted') {
    return { ok: false, motivo: 'PERMISO_DENEGADO' };
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    return { ok: false, motivo: 'SIN_PROJECT_ID' };
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { ok: true, token: data };
  } catch (error) {
    console.error('[FCM ERROR DETALLE]', String(error));
    return { ok: false, motivo: 'ERROR_TOKEN', error: String(error) };
  }
}

export async function registrarToken(usuarioId) {
  try {
    await configurarCanalAndroid();
  } catch (error) {
    return { ok: false, motivo: 'ERROR_CANAL', error: String(error) };
  }

  const resultado = await obtenerExpoPushToken();
  if (!resultado.ok) return resultado;

  try {
    await api.put(`/usuarios/${usuarioId}/push-token`, {
      pushToken: resultado.token,
    });

    return resultado;
  } catch (error) {
    return { ok: false, motivo: 'ERROR_BACKEND', error: String(error) };
  }
}

export async function eliminarToken(usuarioId) {
  try {
    await api.put(`/usuarios/${usuarioId}/push-token`, { pushToken: null });
  } catch {
    // No bloquear el cierre de sesión si falla la red.
  }
}

export function escucharNotificaciones({ onRecibida, onAbierta }) {
  const subRecibida = Notifications.addNotificationReceivedListener(onRecibida);
  const subAbierta =
    Notifications.addNotificationResponseReceivedListener(onAbierta);

  return () => {
    subRecibida.remove();
    subAbierta.remove();
  };
}