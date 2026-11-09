import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import AnimatedPressable from '../components/ui/AnimatedPressable';
import Reveal from '../components/ui/Reveal';
import colors from '../theme/colors';
import { radius, shadow, spacing, typography } from '../theme/metrics';

const OPCIONES = [
  {
    key: 'cargas',
    emoji: '🚰',
    title: 'Mis cargas',
    text: 'Revisa y acepta los garrafones asignados antes de iniciar la ruta.',
    action: 'Ver cargas →',
    screen: 'CargasRepartidor',
  },
  {
    key: 'pedidos',
    emoji: '🚛',
    title: 'Rutas en curso',
    text: 'Confirma garrafones entregados, envases recibidos y pago cobrado.',
    action: 'Ver pedidos →',
    screen: 'PedidosRepartidor',
  },
  {
    key: 'rutas',
    emoji: '📋',
    title: 'Rutas asignadas',
    text: 'Consulta las rutas que el encargado te asignó y acéptalas para iniciar.',
    action: 'Ver rutas asignadas →',
    screen: 'RutasAsignadas',
  },
];

export default function RepartidorHomeScreen({ navigation }) {
  const { usuario, cerrarSesion } = useAuth();
  const insets = useSafeAreaInsets();

  const salir = async () => {
    await cerrarSesion();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#043A4C', '#07556B', '#008FB5']}
        style={[styles.header, { paddingTop: insets.top + 28 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerCircle} />
        <View style={styles.badgeRow}>
          <Text style={styles.badgeIcon}>💧</Text>
          <Text style={styles.badgeText}>RUTA ACTIVA</Text>
        </View>

        <Text style={styles.title}>AquaRuta · Repartidor</Text>

        <Text style={styles.subtitle}>
          Agua pura, entregas seguras · {usuario?.nombre || 'Repartidor'}
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.huge + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {OPCIONES.map((opcion, index) => (
          <Reveal key={opcion.key} index={index}>
            <AnimatedPressable
              onPress={() => navigation.navigate(opcion.screen)}
              accessibilityRole="button"
              accessibilityLabel={opcion.title}
              style={styles.card}
              contentStyle={styles.cardContent}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.cardEmoji}>{opcion.emoji}</Text>
              </View>

              <Text style={styles.cardTitle}>{opcion.title}</Text>
              <Text style={styles.cardText}>{opcion.text}</Text>
              <Text style={styles.link}>{opcion.action}</Text>
            </AnimatedPressable>
          </Reveal>
        ))}

        <Reveal index={OPCIONES.length}>
          <AnimatedPressable
            onPress={salir}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            style={styles.logout}
            contentStyle={styles.logoutContent}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </AnimatedPressable>
        </Reveal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  headerCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -60,
    top: -40,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badgeIcon: { fontSize: 18 },
  badgeText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  title: {
    ...typography.title,
    color: colors.white,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    fontSize: 14,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardContent: {
    padding: spacing.xl,
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 24 },
  cardTitle: {
    marginTop: spacing.md,
    ...typography.heading,
    color: colors.textPrimary,
  },
  cardText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    ...typography.body,
  },
  link: {
    marginTop: spacing.md,
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13.5,
  },
  logout: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    backgroundColor: colors.errorLight,
  },
  logoutContent: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
});
