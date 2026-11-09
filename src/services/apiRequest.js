export async function requestApi(operation, fallbackMessage) {
  try {
    return await operation();
  } catch (error) {
    if (!error?.isAxiosError) {
      throw new Error(
        error instanceof Error ? error.message : fallbackMessage
      );
    }

    if (!error.response) {
      throw new Error(
        'No se pudo conectar con el servidor. Verifica la URL y la red.'
      );
    }

    if (error.response.status === 401 || error.response.status === 403) {
      throw new Error('No tienes autorización para realizar esta operación.');
    }

    if (error.response.status === 400) {
      throw new Error('La solicitud fue rechazada. Revisa los datos capturados.');
    }

    if (error.response.status === 404) {
      throw new Error('No se encontró el recurso solicitado.');
    }

    throw new Error(fallbackMessage);
  }
}
