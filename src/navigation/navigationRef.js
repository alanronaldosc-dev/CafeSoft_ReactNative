import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navega a la pantalla adecuada cuando el usuario toca una
 * notificación push. Si la pantalla no está disponible para el
 * rol actual (por ejemplo, un ADMIN), se abre la pantalla principal.
 */
export function navegarDesdeNotificacion(data) {
  if (!navigationRef.isReady() || !data) return;

  const rutaSolicitada =
    data.pantalla === 'PedidosRepartidor' && data.pedidoId
      ? 'PedidosRepartidor'
      : 'Main';

  try {
    const rutasDisponibles =
      navigationRef.getRootState()?.routeNames ?? [];

    if (!rutasDisponibles.includes(rutaSolicitada)) {
      navigationRef.navigate('Main');
      return;
    }

    if (rutaSolicitada === 'PedidosRepartidor') {
      navigationRef.navigate('PedidosRepartidor', {
        pedidoId: data.pedidoId,
      });
      return;
    }

    navigationRef.navigate('Main');
  } catch (error) {
    // Puede ocurrir si la notificación se abre antes de iniciar sesión
    // o si la pantalla destino no está registrada para el rol actual.
    console.warn('No se pudo navegar desde la notificación:', error?.message);
  }
}
