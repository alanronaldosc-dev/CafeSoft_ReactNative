import * as SecureStore from 'expo-secure-store';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  AppState,
} from 'react-native';

const AuthContext = createContext(null);

// Tiempo de sesión.
// Se mantienen 30 segundos porque así estaba configurado
// en tus cambios para probar la expiración.
const TIEMPO_MAXIMO_SESION = 30 * 1000;

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const temporizadorSesion = useRef(null);
  const expiracionSesion = useRef(null);
  const appState = useRef(AppState.currentState);

  // ============================================
  // LIMPIAR TEMPORIZADOR
  // ============================================

  const limpiarTemporizador = () => {
    if (temporizadorSesion.current) {
      clearTimeout(temporizadorSesion.current);
      temporizadorSesion.current = null;
    }
  };

  // ============================================
  // EXPIRAR SESIÓN
  // ============================================

  const expirarSesion = async () => {
    limpiarTemporizador();

    expiracionSesion.current = null;

    await SecureStore.deleteItemAsync('jwt_token');

    setUsuario(null);

    Alert.alert(
      'Sesión expirada',
      'Tu sesión terminó por seguridad. Inicia sesión nuevamente.'
    );
  };

  // ============================================
  // PROGRAMAR EXPIRACIÓN
  // ============================================

  const programarExpiracion = () => {
    limpiarTemporizador();

    if (!expiracionSesion.current) {
      return;
    }

    const tiempoRestante =
      expiracionSesion.current - Date.now();

    if (tiempoRestante <= 0) {
      expirarSesion();
      return;
    }

    temporizadorSesion.current = setTimeout(() => {
      expirarSesion();
    }, tiempoRestante);
  };

  // ============================================
  // INICIAR SESIÓN
  // ============================================

  const iniciarSesion = async (usuarioData, token) => {
    if (token) {
      await SecureStore.setItemAsync(
        'jwt_token',
        token
      );
    } else {
      await SecureStore.deleteItemAsync(
        'jwt_token'
      );
    }

    setUsuario(usuarioData);

    expiracionSesion.current =
      Date.now() + TIEMPO_MAXIMO_SESION;

    programarExpiracion();
  };

  // ============================================
  // CERRAR SESIÓN
  // ============================================

  const cerrarSesion = async () => {
    limpiarTemporizador();

    expiracionSesion.current = null;

    await SecureStore.deleteItemAsync(
      'jwt_token'
    );

    setUsuario(null);
  };

  // ============================================
  // OBTENER TOKEN
  // ============================================

  const getToken = async () => {
    return await SecureStore.getItemAsync(
      'jwt_token'
    );
  };

  // ============================================
  // CONTROLAR SEGUNDO PLANO
  // ============================================

  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        (nextAppState) => {
          const regresoAApp =
            appState.current.match(
              /inactive|background/
            ) &&
            nextAppState === 'active';

          appState.current = nextAppState;

          if (regresoAApp && usuario) {
            if (
              expiracionSesion.current &&
              Date.now() >=
                expiracionSesion.current
            ) {
              expirarSesion();
            } else {
              programarExpiracion();
            }
          }
        }
      );

    return () => {
      subscription.remove();
    };
  }, [usuario]);

  // ============================================
  // LIMPIEZA AL CERRAR PROVIDER
  // ============================================

  useEffect(() => {
    return () => {
      limpiarTemporizador();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        iniciarSesion,
        cerrarSesion,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe usarse dentro de AuthProvider'
    );
  }

  return context;
}