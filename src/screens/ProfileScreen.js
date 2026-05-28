// ProfileScreen.js
// Pantalla de perfil del usuario activo.
// Muestra info del usuario, opciones de configuración y accesibilidad.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import colors from '../theme/colors';

// Datos mock del usuario activo
// En el futuro vendrán del Context de autenticación o de la API
const USER = {
  name: 'María García',
  role: 'Cliente',
  since: '2023',
  orders: 24,
  points: 340,
  reviews: 7,
};

const TEXT_SIZES = ['Pequeño', 'Mediano', 'Grande'];

export default function ProfileScreen({ navigation }) {
  // Estado de accesibilidad
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('Mediano');
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  // Simula el cierre de sesión, vuelve al Login
  // En Laravel sería Auth::logout() + redirect()->route('login')
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header con info del usuario */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {USER.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{USER.name}</Text>
          <View style={styles.roleRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{USER.role}</Text>
            </View>
            <Text style={styles.sinceText}>desde {USER.since}</Text>
          </View>
        </View>
      </View>

      {/* Estadísticas del usuario */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{USER.orders}</Text>
          <Text style={styles.statLabel}>Pedidos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{USER.points}</Text>
          <Text style={styles.statLabel}>Puntos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{USER.reviews}</Text>
          <Text style={styles.statLabel}>Reseñas</Text>
        </View>
      </View>

      {/* Opciones del menú */}
      <View style={styles.section}>

        {/* Mis Pedidos */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>☰</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Mis Pedidos</Text>
            <Text style={styles.menuSub}>3 activos</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Favoritos */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>♥</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Favoritos</Text>
            <Text style={styles.menuSub}>8 items</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Configuración */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>⚙</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Configuración</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

      </View>

      {/* Sección de Accesibilidad — se expande/colapsa al tocar */}
      {/* Equivalente a un accordion en Bootstrap/Blade */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.menuItem, styles.accessibilityHeader]}
          onPress={() => setAccessibilityOpen(!accessibilityOpen)}
        >
          <View style={[styles.menuIconContainer, styles.accessibilityIconContainer]}>
            <Text style={styles.menuIcon}>♿</Text>
          </View>
          <Text style={styles.accessibilityTitle}>Accesibilidad</Text>
          <Text style={styles.menuArrow}>{accessibilityOpen ? '∧' : '∨'}</Text>
        </TouchableOpacity>

        {/* Contenido del accordion, solo visible si accessibilityOpen es true */}
        {accessibilityOpen && (
          <View style={styles.accessibilityContent}>

            {/* Toggle de alto contraste */}
            {/* Switch es el componente nativo de toggle on/off */}
            <View style={styles.accessibilityItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🖥</Text>
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>Alto Contraste</Text>
                <Text style={styles.menuSub}>Mejora visibilidad</Text>
              </View>
              <Switch
                value={highContrast}
                onValueChange={setHighContrast}
                trackColor={{ false: colors.surface, true: colors.secondary }}
                thumbColor={colors.white}
              />
            </View>

            {/* Selector de tamaño de texto */}
            <View style={styles.accessibilityItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>T</Text>
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>Tamaño de Texto</Text>
                <Text style={styles.menuSub}>Actual: {textSize}</Text>
              </View>
            </View>
            <View style={styles.textSizeRow}>
              {TEXT_SIZES.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.textSizeButton, textSize === size && styles.textSizeButtonActive]}
                  onPress={() => setTextSize(size)}
                >
                  <Text style={[styles.textSizeText, textSize === size && styles.textSizeTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>
        )}
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  sinceText: {
    color: colors.textLight,
    fontSize: 13,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.8,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
    gap: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: colors.surface,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  menuSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  accessibilityHeader: {
    backgroundColor: colors.primary,
    borderBottomWidth: 0,
  },
  accessibilityIconContainer: {
    backgroundColor: colors.secondary,
  },
  accessibilityTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  accessibilityContent: {
    backgroundColor: colors.white,
  },
  accessibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
    gap: 12,
  },
  textSizeRow: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  textSizeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  textSizeButtonActive: {
    backgroundColor: colors.primary,
  },
  textSizeText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textSizeTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
});
