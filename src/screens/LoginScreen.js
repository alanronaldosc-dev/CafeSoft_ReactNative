/**
 * LoginScreen.js
 * Pantalla de inicio de sesión conectada a la API de CafeSoft.
 */

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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import colors from '../theme/colors';
import api from '../services/api';

const ROLES = ['Cliente', 'Administrador', 'Empleado'];

const TIPOS_USUARIO = {
  Administrador: 0,
  Empleado: 1,
  Cliente: 2,
};

export default function LoginScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState('Cliente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    const emailLimpio = email.trim().toLowerCase();
    const passwordLimpia = password.trim();

    if (!emailLimpio || !passwordLimpia) {
      Alert.alert(
        'Campos incompletos',
        'Ingresa tu correo y contraseña.'
      );
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api.post('/usuarios/login', {
        email: emailLimpio,
        password: passwordLimpia,
      });

      const usuario = respuesta.data?.usuario;

      if (!usuario) {
        Alert.alert(
          'Error',
          'La API no devolvió los datos del usuario.'
        );
        return;
      }

      const tipoSeleccionado = TIPOS_USUARIO[selectedRole];

      if (usuario.userTipo !== tipoSeleccionado) {
        Alert.alert(
          'Rol incorrecto',
          `Este usuario no está registrado como ${selectedRole}.`
        );
        return;
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: {
              usuario,
            },
          },
        ],
      });
    } catch (error) {
      console.error(
        'Error al iniciar sesión:',
        error.response?.data || error.message
      );

      if (error.response?.status === 400) {
        Alert.alert(
          'Datos inválidos',
          error.response?.data?.error ||
            'Revisa los datos ingresados.'
        );
      } else if (error.response?.status === 401) {
        Alert.alert(
          'Inicio de sesión fallido',
          'Correo o contraseña incorrectos.'
        );
      } else if (error.response?.status === 403) {
        Alert.alert(
          'Acceso denegado',
          'Tu usuario no tiene permiso para ingresar.'
        );
      } else if (!error.response) {
        Alert.alert(
          'Sin conexión',
          'No se pudo conectar con la API. Revisa la IP, el Wi-Fi y que Spring Boot esté encendido.'
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error ||
            'No se pudo iniciar sesión.'
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>☕</Text>
          </View>

          <Text style={styles.headerTitle}>CafeSoft</Text>
          <Text style={styles.headerSubtitle}>
            Inicia sesión para continuar
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Bienvenido de nuevo</Text>

          <Text style={styles.description}>
            Ingresa tus datos para acceder al sistema.
          </Text>

          <Text style={styles.label}>ROL DE ACCESO</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() =>
              setShowRoleDropdown(!showRoleDropdown)
            }
            disabled={cargando}
          >
            <Text style={styles.roleIndicator}>●</Text>

            <Text style={styles.inputText}>
              {selectedRole}
            </Text>

            <Text style={styles.dropdownArrow}>
              {showRoleDropdown ? '▴' : '▾'}
            </Text>
          </TouchableOpacity>

          {showRoleDropdown && (
            <View style={styles.dropdown}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.dropdownItem,
                    selectedRole === role &&
                      styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedRole(role);
                    setShowRoleDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedRole === role &&
                        styles.dropdownItemTextSelected,
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>
            CORREO ELECTRÓNICO
          </Text>

          <View style={styles.input}>
            <Text style={styles.inputIcon}>✉</Text>

            <TextInput
              style={styles.textInput}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!cargando}
              returnKeyType="next"
            />
          </View>

          <Text style={styles.label}>CONTRASEÑA</Text>

          <View style={styles.input}>
            <Text style={styles.inputIcon}>🔒</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              editable={!cargando}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(!showPassword)
              }
              disabled={cargando}
            >
              <Text style={styles.passwordIcon}>
                {showPassword ? '🙈' : '👁'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            disabled={cargando}
            onPress={() =>
              Alert.alert(
                'Recuperar contraseña',
                'Esta opción todavía no está disponible.'
              )
            }
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              cargando && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={cargando}
            activeOpacity={0.8}
          >
            {cargando ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  color={colors.textLight}
                  size="small"
                />

                <Text style={styles.loginButtonText}>
                  Iniciando sesión...
                </Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>
                Iniciar sesión
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerLink}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{' '}
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Register')
              }
              disabled={cargando}
            >
              <Text style={styles.registerLinkText}>
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },

  iconContainer: {
    width: 68,
    height: 68,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  iconText: {
    fontSize: 34,
  },

  headerTitle: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  headerSubtitle: {
    color: colors.textLight,
    fontSize: 14,
    opacity: 0.85,
  },

  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 36,
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 54,
  },

  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    color: colors.textSecondary,
  },

  passwordIcon: {
    fontSize: 18,
    marginLeft: 10,
  },

  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 14,
  },

  inputText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },

  roleIndicator: {
    color: colors.secondary,
    marginRight: 10,
    fontSize: 12,
  },

  dropdownArrow: {
    color: colors.textSecondary,
    fontSize: 16,
  },

  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
  },

  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },

  dropdownItemSelected: {
    backgroundColor: colors.background,
  },

  dropdownItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },

  dropdownItemTextSelected: {
    fontWeight: 'bold',
    color: colors.secondary,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 6,
  },

  forgotPasswordText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },

  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  loginButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },

  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
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