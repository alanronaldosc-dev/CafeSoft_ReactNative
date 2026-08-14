import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3D1A00', '#6B3A1F', '#3D1A00']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Círculos decorativos */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header ilustrativo */}
        <View style={styles.illustrationSection}>
          <View style={styles.illustrationMain}>
            <Text style={styles.illustrationEmoji}>☕</Text>
          </View>
          <View style={[styles.floatingEl, styles.floatingEl1]}>
            <Text style={{ fontSize: 18 }}>✨</Text>
          </View>
          <View style={[styles.floatingEl, styles.floatingEl2]}>
            <Text style={{ fontSize: 16 }}>🫘</Text>
          </View>
          <Text style={styles.appName}>Crear Cuenta</Text>
          <Text style={styles.appTagline}>Paso 1 de 2 — Registro</Text>
        </View>

        {/* Card del formulario */}
        <View style={styles.formCard}>
          <Text style={styles.title}>Únete a CafeSoft</Text>
          <Text style={styles.subtitle}>Completá tus datos para registrarte</Text>

          {/* Nombre */}
          <Text style={styles.label}>NOMBRE COMPLETO</Text>
          <View style={styles.input}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.textInput}
              placeholder="María García López"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
          <View style={styles.input}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.textInput}
              placeholder="maria@correo.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Teléfono */}
          <Text style={styles.label}>TELÉFONO</Text>
          <View style={styles.input}>
            <Text style={styles.inputIcon}>📞</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+52 000 000 0000"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
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

          {/* Confirmar contraseña */}
          <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
          <View style={styles.input}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Text style={styles.inputIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Checkbox términos */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptTerms(!acceptTerms)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={acceptTerms ? [colors.secondary, colors.primary] : ['transparent', 'transparent']}
              style={[styles.checkbox, !acceptTerms && styles.checkboxEmpty]}
            >
              {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </LinearGradient>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.termsLink}>Términos de Servicio</Text>
              {' '}y la{' '}
              <Text style={styles.termsLink}>Política de Privacidad</Text>
            </Text>
          </TouchableOpacity>

          {/* Botón con gradiente */}
          <TouchableOpacity onPress={handleRegister} activeOpacity={0.85} style={styles.buttonWrapper}>
            <LinearGradient
              colors={[colors.secondary, '#A0522D', colors.primary]}
              style={styles.registerButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              <Text style={styles.registerButtonArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Link login */}
          <View style={styles.loginLink}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  decorCircle: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  decorCircle1: { width: 250, height: 250, backgroundColor: colors.secondary, top: -60, right: -60 },
  decorCircle2: { width: 180, height: 180, backgroundColor: '#C8763A', top: 80, left: -50 },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  illustrationSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, position: 'relative' },
  illustrationMain: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: 'rgba(200, 118, 58, 0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(200, 118, 58, 0.5)',
    marginBottom: 14,
  },
  illustrationEmoji: { fontSize: 44 },
  floatingEl: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 8 },
  floatingEl1: { top: 50, right: 70 },
  floatingEl2: { top: 110, left: 60 },
  appName: { fontSize: 26, fontWeight: 'bold', color: colors.textLight, letterSpacing: 1 },
  appTagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  formCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    padding: 28, paddingTop: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  label: {
    fontSize: 11, fontWeight: '800', color: colors.textSecondary,
    letterSpacing: 1.5, marginBottom: 8, marginTop: 16,
  },
  input: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  textInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, gap: 12 },
  checkbox: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxEmpty: { borderWidth: 2, borderColor: colors.textSecondary },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: 'bold' },
  termsText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  termsLink: { color: colors.secondary, fontWeight: '600' },
  buttonWrapper: {
    marginTop: 24, borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  registerButton: {
    borderRadius: 18, paddingVertical: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  registerButtonText: { color: colors.white, fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  registerButtonArrow: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  loginLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 10 },
  loginText: { color: colors.textSecondary, fontSize: 14 },
  loginLinkText: { color: colors.secondary, fontSize: 14, fontWeight: 'bold' },
});
