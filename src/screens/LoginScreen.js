import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_URL } from '../config/api';

const { width, height } = Dimensions.get('window');
const ROLES = ['Cliente', 'Administrador', 'Empleado'];

export default function LoginScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState('Cliente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert(
      'Campos obligatorios',
      'Ingresa tu correo y contraseña.'
    );
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/usuarios/login`,
      {
        email: email.trim().toLowerCase(),
        password: password,
      }
    );

    const usuario = response.data.usuario;

    console.log('Usuario autenticado:', usuario);

    navigation.navigate('Main', {
      usuario: usuario,
    });

  } catch (error) {
    console.error(
      'Error de login:',
      error.response?.data || error.message
    );

    const mensaje =
      error.response?.data?.error ||
      'No fue posible iniciar sesión.';

    Alert.alert(
      'No se puede iniciar sesión',
      mensaje
    );
  }
};

  return (
    <View style={styles.container}>

      {/* Fondo con gradiente — equivalente a background: linear-gradient en CSS */}
      <LinearGradient
        colors={['#3D1A00', '#6B3A1F', '#3D1A00']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Círculos decorativos de fondo */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />
      <View style={[styles.decorCircle, styles.decorCircle3]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección ilustrativa superior */}
        <View style={styles.illustrationSection}>
          <View style={styles.illustrationMain}>
            <Text style={styles.illustrationEmoji}>☕</Text>
          </View>
          {/* Elementos flotantes decorativos */}
          <View style={[styles.floatingEl, styles.floatingEl1]}>
            <Text style={{ fontSize: 20 }}>✨</Text>
          </View>
          <View style={[styles.floatingEl, styles.floatingEl2]}>
            <Text style={{ fontSize: 16 }}>🫘</Text>
          </View>
          <View style={[styles.floatingEl, styles.floatingEl3]}>
            <Text style={{ fontSize: 18 }}>🍂</Text>
          </View>
          <Text style={styles.appName}>CafeSoft</Text>
          <Text style={styles.appTagline}>Tu café favorito, donde quieras</Text>
        </View>

        {/* Card del formulario con efecto glassmorphism */}
        <View style={styles.formCard}>

          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>

          {/* Selector de rol */}
          <Text style={styles.label}>ROL DE ACCESO</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            activeOpacity={0.8}
          >
            <View style={styles.roleDot} />
            <Text style={styles.inputText}>{selectedRole}</Text>
            <Text style={styles.dropdownArrow}>{showRoleDropdown ? '▴' : '▾'}</Text>
          </TouchableOpacity>

          {showRoleDropdown && (
            <View style={styles.dropdown}>
              {ROLES.map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.dropdownItem, selectedRole === role && styles.dropdownItemActive]}
                  onPress={() => { setSelectedRole(role); setShowRoleDropdown(false); }}
                >
                  <Text style={[styles.dropdownText, selectedRole === role && styles.dropdownTextActive]}>
                    {role}
                  </Text>
                  {selectedRole === role && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Email */}
          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
          <View style={styles.input}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Contraseña */}
          <Text style={styles.label}>CONTRASEÑA</Text>
          <View style={styles.input}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidé mi contraseña?</Text>
          </TouchableOpacity>

          {/* Botón con gradiente */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} style={styles.buttonWrapper}>
            <LinearGradient
              colors={[colors.secondary, '#A0522D', colors.primary]}
              style={styles.loginButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              <Text style={styles.loginButtonArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Link registro */}
          <View style={styles.registerLink}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLinkText}>Regístrate</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  gradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  // Círculos decorativos de fondo
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  decorCircle1: {
    width: 300, height: 300,
    backgroundColor: '#C8763A',
    top: -80, right: -80,
  },
  decorCircle2: {
    width: 200, height: 200,
    backgroundColor: '#3D1A00',
    top: 100, left: -60,
  },
  decorCircle3: {
    width: 150, height: 150,
    backgroundColor: '#3D1A00',
    top: 220, right: 20,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // Sección ilustrativa
  illustrationSection: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 30,
    position: 'relative',
  },
  illustrationMain: {
    width: 110, height: 110, borderRadius: 35,
    backgroundColor: 'rgba(245, 166, 35, 0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(245, 166, 35, 0.5)',
    marginBottom: 16,
  },
  illustrationEmoji: {
    fontSize: 56,
  },
  floatingEl: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 8,
  },
  floatingEl1: { top: 60, right: 60 },
  floatingEl2: { top: 130, left: 50 },
  floatingEl3: { top: 80, left: 80 },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.textLight,
    letterSpacing: 2,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  // Card del formulario
  formCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 28,
    paddingTop: 36,
    // Sombra — equivalente a box-shadow en CSS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
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
    // Sombra suave en los inputs
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  roleDot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    marginRight: 10,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
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
    shadowOffset: { width: 0, height: 4 },
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
    borderBottomColor: colors.background,
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
    // Sombra del botón
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
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
