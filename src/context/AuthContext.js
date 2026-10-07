import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const iniciarSesion = async (usuarioData, token) => {
    if (token) {
      await SecureStore.setItemAsync('jwt_token', token);
    }
    setUsuario(usuarioData);
  };

  const cerrarSesion = async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    setUsuario(null);
  };

  const getToken = async () => {
    return await SecureStore.getItemAsync('jwt_token');
  };

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
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
