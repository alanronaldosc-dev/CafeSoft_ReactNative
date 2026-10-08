// ============================================
// HU-008 - INICIO DE SESIÓN MÓVIL
// Actividad 07 - Implementación de seguridad
// ============================================

import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

// ============================================
// ROLES
// ============================================

const ROLES = [
  'Cliente',
  'Administrador',
  'Empleado',
  'Repartidor',
];

// ============================================
// CONVERTIR userTipo A ROL
// ============================================

const obtenerRolPorTipo = (userTipo) => {
  const tipo = Number(userTipo);

  switch (tipo) {
    case 0:
      return 'Administrador';

    case 1:
      return 'Empleado';

    case 2:
      return 'Cliente';

    case 4:
      return 'Repartidor';

    default:
      return null;
  }
};

// ============================================
// LOGIN
// ============================================

export default function LoginScreen({ navigation }) {
  const { iniciarSesion } = useAuth();

  const [selectedRole, setSelectedRole] =
    useState('Cliente');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showRoleDropdown, setShowRoleDropdown] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ============================================
  // OBTENER USUARIO DESDE LA RESPUESTA
  // ============================================

  const obtenerUsuario = (
    responseData,
    fallbackEmail
  ) => {
    const source =
      responseData?.usuario ??
      responseData?.user ??
      responseData?.data?.usuario ??
      responseData?.data?.user ??
      responseData?.data ??
      responseData?.result ??
      {};

    const usuario = Array.isArray(source)
      ? source[0]
      : source;

    const userTipo =
      usuario?.userTipo ??
      usuario?.tipoUsuario ??
      responseData?.userTipo ??
      responseData?.tipoUsuario;

    const rolBackend =
      usuario?.rol ??
      usuario?.role ??
      usuario?.tipoRol ??
      obtenerRolPorTipo(userTipo);

    return {
      ...usuario,

      id:
        usuario?.id ??
        usuario?.idUsuario ??
        usuario?.userId ??
        responseData?.id ??
        responseData?.idUsuario,

      nombre:
        usuario?.nombre ??
        usuario?.name ??
        usuario?.username ??
        'Usuario',

      email:
        usuario?.email ??
        usuario?.correo ??
        fallbackEmail,

      userTipo,

      // El rol del servidor tiene prioridad.
      // Nunca damos permisos únicamente porque
      // el usuario eligió un rol en la pantalla.
      rol:
        rolBackend ??
        selectedRole,
    };
  };

  // ============================================
  // INICIAR SESIÓN
  // ============================================

  const handleLogin = async () => {
    const trimmedEmail =
      email.trim().toLowerCase();

    // No usamos trim() en la contraseña porque
    // los espacios pueden formar parte de ella.
    const passwordValue = password;

    // ==========================================
    // SEGURIDAD 1
    // VALIDACIÓN DE ENTRADAS
    // ==========================================

    if (!trimmedEmail || !passwordValue) {
      Alert.alert(
        'Datos incompletos',
        'El correo y la contraseña son obligatorios.'
      );

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        'Correo inválido',
        'Ingresa un correo electrónico válido.'
      );

      return;
    }

    if (passwordValue.length < 8) {
      Alert.alert(
        'Contraseña inválida',
        'La contraseña debe contener al menos 8 caracteres.'
      );

      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // UNA SOLA PETICIÓN DE LOGIN
      // ==========================================
      //
      // Esto es importante para el bloqueo
      // temporal por intentos fallidos.
      //
      // Cada toque en "Iniciar Sesión"
      // representa únicamente un intento.
      // ==========================================

      const response = await api.post(
        '/usuarios/login',
        {
          email: trimmedEmail,
          password: passwordValue,
        }
      );

      // ==========================================
      // VALIDAR RESPUESTA
      // ==========================================

      const usuario = obtenerUsuario(
        response.data,
        trimmedEmail
      );

      if (
        !usuario?.id &&
        !usuario?.email
      ) {
        Alert.alert(
          'Error',
          'No fue posible obtener la información del usuario.'
        );

        return;
      }

      // ==========================================
      // OBTENER JWT
      // ==========================================

      const token =
        response.data?.token ??
        response.data?.data?.token ??
        null;

      if (!token) {
        Alert.alert(
          'Error de seguridad',
          'El servidor no proporcionó un token de acceso.'
        );

        return;
      }

      // ==========================================
      // GUARDAR SESIÓN
      // ==========================================

      await iniciarSesion(
        usuario,
        token
      );

      /*
       * IMPORTANTE:
       *
       * Ya NO usamos:
       *
       * navigation.reset(...)
       *
       * AppNavigator detecta que existe un usuario
       * autenticado y automáticamente muestra:
       *
       * Repartidor -> RepartidorHome
       * Otros      -> Main
       */

    } catch (error) {
      const status =
        error?.response?.status;

      // ==========================================
      // SEGURIDAD 2
      // MANEJO SEGURO DE ERRORES
      // ==========================================

      if (status === 429) {
        Alert.alert(
          '🔒 Cuenta bloqueada',
          'Has realizado demasiados intentos fallidos. Intenta nuevamente más tarde.'
        );

        return;
      }

      if (status === 401) {
        Alert.alert(
          'Acceso denegado',
          'Correo o contraseña incorrectos.'
        );

        return;
      }

      if (status === 403) {
        Alert.alert(
          'Acceso no autorizado',
          'Tu usuario no tiene permiso para realizar esta operación.'
        );

        return;
      }

      if (status === 400) {
        Alert.alert(
          'Datos inválidos',
          'Verifica la información ingresada.'
        );

        return;
      }

      if (status >= 500) {
        Alert.alert(
          'Error del servidor',
          'Ocurrió un problema en el servidor. Intenta nuevamente.'
        );

        return;
      }

      if (!error?.response) {
        Alert.alert(
          'Error de conexión',
          'No fue posible conectarse con el servidor. Verifica tu conexión y que la API esté encendida.'
        );

        return;
      }

      Alert.alert(
        'Error de inicio de sesión',
        'No fue posible iniciar sesión. Intenta nuevamente.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RECUPERAR CONTRASEÑA
  // ============================================

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar contraseña',
      'La recuperación de contraseña aún no está disponible.'
    );
  };

  // ============================================
  // INTERFAZ
  // ============================================

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          '#3D1A00',
          '#6B3A1F',
          '#3D1A00',
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* CÍRCULOS DECORATIVOS */}

      <View
        style={[
          styles.decorCircle,
          styles.decorCircle1,
        ]}
      />

      <View
        style={[
          styles.decorCircle,
          styles.decorCircle2,
        ]}
      />

      <View
        style={[
          styles.decorCircle,
          styles.decorCircle3,
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ENCABEZADO */}

        <View style={styles.illustrationSection}>
          <View style={styles.illustrationMain}>
            <Text style={styles.illustrationEmoji}>
              ☕
            </Text>
          </View>

          <View
            style={[
              styles.floatingEl,
              styles.floatingEl1,
            ]}
          >
            <Text style={{ fontSize: 20 }}>
              ✨
            </Text>
          </View>

          <View
            style={[
              styles.floatingEl,
              styles.floatingEl2,
            ]}
          >
            <Text style={{ fontSize: 16 }}>
              🫘
            </Text>
          </View>

          <View
            style={[
              styles.floatingEl,
              styles.floatingEl3,
            ]}
          >
            <Text style={{ fontSize: 18 }}>
              🍂
            </Text>
          </View>

          <Text style={styles.appName}>
            CafeSoft
          </Text>

          <Text style={styles.appTagline}>
            Tu café favorito, donde quieras
          </Text>
        </View>

        {/* FORMULARIO */}

        <View style={styles.formCard}>
          <Text style={styles.title}>
            Bienvenido de nuevo
          </Text>

          <Text style={styles.subtitle}>
            Inicia sesión para continuar
          </Text>

          {/* ROL */}

          <Text style={styles.label}>
            ROL DE ACCESO
          </Text>

          <TouchableOpacity
            style={styles.input}
            activeOpacity={0.8}
            disabled={loading}
            onPress={() =>
              setShowRoleDropdown(
                (actual) => !actual
              )
            }
          >
            <View style={styles.roleDot} />

            <Text style={styles.inputText}>
              {selectedRole}
            </Text>

            <Text style={styles.dropdownArrow}>
              {showRoleDropdown
                ? '▴'
                : '▾'}
            </Text>
          </TouchableOpacity>

          {showRoleDropdown && (
            <View style={styles.dropdown}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  disabled={loading}
                  style={[
                    styles.dropdownItem,
                    selectedRole === role &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedRole(role);
                    setShowRoleDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      selectedRole === role &&
                        styles.dropdownTextActive,
                    ]}
                  >
                    {role}
                  </Text>

                  {selectedRole === role && (
                    <Text style={styles.checkIcon}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* CORREO */}

          <Text style={styles.label}>
            CORREO ELECTRÓNICO
          </Text>

          <View style={styles.input}>
            <Text style={styles.inputIcon}>
              ✉️
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="tu@correo.com"
              placeholderTextColor={
                colors.textSecondary
              }
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="next"
            />
          </View>

          {/* CONTRASEÑA */}

          <Text style={styles.label}>
            CONTRASEÑA
          </Text>

          <View style={styles.input}>
            <Text style={styles.inputIcon}>
              🔒
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={
                colors.textSecondary
              }
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              disabled={loading}
              onPress={() =>
                setShowPassword(
                  (actual) => !actual
                )
              }
            >
              <Text style={styles.passwordIcon}>
                {showPassword
                  ? '🙈'
                  : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* RECUPERAR CONTRASEÑA */}

          <TouchableOpacity
            style={styles.forgotPassword}
            disabled={loading}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* BOTÓN LOGIN */}

          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            style={[
              styles.buttonWrapper,
              loading && styles.buttonDisabled,
            ]}
            disabled={loading}
          >
            <LinearGradient
              colors={
                loading
                  ? [
                      '#8F6B54',
                      '#8F6B54',
                    ]
                  : [
                      colors.secondary,
                      '#A0522D',
                      colors.primary,
                    ]
              }
              style={styles.loginButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={colors.white}
                  />

                  <Text
                    style={
                      styles.loginButtonText
                    }
                  >
                    Iniciando...
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={
                      styles.loginButtonText
                    }
                  >
                    Iniciar Sesión
                  </Text>

                  <Text
                    style={
                      styles.loginButtonArrow
                    }
                  >
                    →
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* REGISTRO */}

          <View style={styles.registerLink}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{' '}
            </Text>

            <TouchableOpacity
              disabled={loading}
              onPress={() =>
                navigation.navigate('Register')
              }
            >
              <Text
                style={
                  styles.registerLinkText
                }
              >
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },

  decorCircle1: {
    width: 300,
    height: 300,
    backgroundColor: '#C8763A',
    top: -80,
    right: -80,
  },

  decorCircle2: {
    width: 200,
    height: 200,
    backgroundColor: '#3D1A00',
    top: 100,
    left: -60,
  },

  decorCircle3: {
    width: 150,
    height: 150,
    backgroundColor: '#3D1A00',
    top: 220,
    right: 20,
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  illustrationSection: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 30,
    position: 'relative',
  },

  illustrationMain: {
    width: 110,
    height: 110,
    borderRadius: 35,
    backgroundColor:
      'rgba(245, 166, 35, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor:
      'rgba(245, 166, 35, 0.5)',
    marginBottom: 16,
  },

  illustrationEmoji: {
    fontSize: 56,
  },

  floatingEl: {
    position: 'absolute',
    backgroundColor:
      'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 8,
  },

  floatingEl1: {
    top: 60,
    right: 60,
  },

  floatingEl2: {
    top: 130,
    left: 50,
  },

  floatingEl3: {
    top: 80,
    left: 80,
  },

  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.textLight,
    letterSpacing: 2,
  },

  appTagline: {
    fontSize: 14,
    color:
      'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  formCard: {
    backgroundColor:
      colors.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 28,
    paddingTop: 36,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  roleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    marginRight: 10,
  },

  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  passwordIcon: {
    fontSize: 16,
    marginLeft: 10,
  },

  inputText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },

  dropdownArrow: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor:
      colors.background,
  },

  dropdownItemActive: {
    backgroundColor: colors.surface,
  },

  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },

  dropdownTextActive: {
    fontWeight: '700',
    color: colors.secondary,
  },

  checkIcon: {
    color: colors.secondary,
    fontWeight: 'bold',
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 8,
  },

  forgotPasswordText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },

  buttonWrapper: {
    marginTop: 20,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  buttonDisabled: {
    opacity: 0.8,
  },

  loginButton: {
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  loginButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  loginButtonArrow: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },

  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },

  registerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  registerLinkText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});