function normalizeBackendUrl(value, allowHttp = false) {
  if (!value || !value.trim()) {
    throw new Error('Configura EXPO_PUBLIC_API_URL con la URL de la API terminada en /api.');
  }
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL no es una URL valida.');
  }
  if (url.protocol !== 'https:' && !(allowHttp && url.protocol === 'http:')) {
    throw new Error('La API debe usar HTTPS fuera del modo de desarrollo.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('La URL no debe incluir credenciales, parametros ni fragmentos.');
  }
  if (url.pathname.replace(/\/+$/, '') !== '/api') {
    throw new Error('EXPO_PUBLIC_API_URL debe terminar en /api.');
  }
  return url.toString().replace(/\/+$/, '');
}

module.exports = { normalizeBackendUrl };
