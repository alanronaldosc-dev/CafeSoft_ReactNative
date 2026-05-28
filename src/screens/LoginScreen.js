// LoginScreen.js
// Equivalente a: AuthController@showLoginForm + resources/views/auth/login.blade.php
// Todo junto en un solo archivo, así funciona React Native.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import colors from '../theme/colors';

// Los roles disponibles para el selector
const ROLES = ['Cliente', 'Administrador', 'Empleado'];

export default function LoginScreen({ navigation }) {
  // useState es como una variable reactiva: cuando cambia, la pantalla se actualiza.
  // En Laravel sería como $request->input('email'), pero en tiempo real.
  const [selectedRole, setSelectedRole] = useState('Cliente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Función que simula el login (por ahora solo navega al Main)
  // En Laravel sería el método login() del AuthController
  const handleLogin = () => {
    // Aquí irá la validación y llamada a la API en el futuro
    navigation.navigate('Main');
  };

  return (
    // ScrollView permite hacer scroll si el contenido no entra en pantalla
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

      {/* Header marrón oscuro con el ícono y título */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>☕</Text>
        </View>
        <Text style={styles.headerSubtitle}>Paso 2 — Iniciar Sesión</Text>
      </View>

      {/* Contenedor del formulario */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Bienvenido de nuevo</Text>

        {/* --- SELECTOR DE ROL --- */}
        <Text style={styles.label}>ROL DE ACCESO</Text>
        {/* TouchableOpacity es un botón que responde al toque, como un <button> en HTML */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowRoleDropdown(!showRoleDropdown)}
        >
          <Text style={styles.roleIndicator}>●</Text>
          <Text style={styles.inputText}>{selectedRole}</Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>

        {/* Dropdown de roles, solo se muestra si showRoleDropdown es true */}
        {showRoleDropdown && (
          <View style={styles.dropdown}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedRole(role);
                  setShowRoleDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{role}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* --- CAMPO EMAIL --- */}
        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <View style={styles.input}>
          <Text style={styles.inputIcon}>✉</Text>
          {/* TextInput es el equivalente al <input> de HTML */}
          <TextInput
            style={styles.textInput}
            placeholder="tu@correo.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail} // cada vez que el usuario escribe, actualiza el estado
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* --- CAMPO CONTRASEÑA --- */}
        <Text style={styles.label}>CONTRASEÑA</Text>
        <View style={styles.input}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.textInput}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // oculta el texto si es true
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        {/* Link de olvidé contraseña */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>¿Olvidé mi contraseña?</Text>
        </TouchableOpacity>

        {/* Botón principal de login */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        {/* Link para ir al registro */}
        <View style={styles.registerLink}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLinkText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Los estilos van siempre al final del archivo.
// En lugar de CSS, usás objetos JavaScript. Las propiedades son camelCase.
// padding: 16 equivale a padding: 16px en CSS.
const styles = StyleSheet.create({
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
    paddingTop: 60,
    paddingBottom: 30,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 32,
  },
  headerSubtitle: {
    color: colors.textLight,
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 28,
    paddingTop: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 24,
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
    flexDirection: 'row',      // los elementos internos van en fila (como flex-direction: row en CSS)
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    color: colors.textSecondary,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
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
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: colors.secondary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
