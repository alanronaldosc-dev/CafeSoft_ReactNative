import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function RepartidorHomeScreen({ navigation }) {
  const { usuario, cerrarSesion } = useAuth();

  // ============================================
  // CERRAR SESIÓN
  // ============================================

  const salir = async () => {
    await cerrarSesion();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🚚</Text>

        <Text style={styles.title}>
          Panel del repartidor
        </Text>

        <Text style={styles.subtitle}>
          Hola, {usuario?.nombre || 'Repartidor'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* CARGAS */}

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('CargasRepartidor')
          }
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>
            🚰
          </Text>

          <Text style={styles.cardTitle}>
            Mis cargas
          </Text>

          <Text style={styles.cardText}>
            Revisa y acepta los garrafones asignados
            antes de iniciar la ruta.
          </Text>

          <Text style={styles.link}>
            Ver cargas →
          </Text>
        </TouchableOpacity>

        {/* PEDIDOS */}

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate(
              'PedidosRepartidor'
            )
          }
          activeOpacity={0.85}
        >
          <Text style={styles.cardEmoji}>
            📦
          </Text>

          <Text style={styles.cardTitle}>
            Pedidos por entregar
          </Text>

          <Text style={styles.cardText}>
            Confirma garrafones entregados,
            envases recibidos y pago cobrado.
          </Text>

          <Text style={styles.link}>
            Ver pedidos →
          </Text>
        </TouchableOpacity>

        {/* CERRAR SESIÓN */}

        <TouchableOpacity
          style={styles.logout}
          onPress={salir}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    backgroundColor: colors.primary,
    paddingTop: 70,
    paddingBottom: 28,
    paddingHorizontal: 22,
  },

  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },

  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
  },

  subtitle: {
    color: '#E9D8C8',
    marginTop: 5,
    fontSize: 15,
  },

  content: {
    padding: 20,
    gap: 16,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    elevation: 2,
  },

  cardEmoji: {
    fontSize: 32,
  },

  cardTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  cardText: {
    marginTop: 8,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  link: {
    marginTop: 14,
    color: colors.secondary,
    fontWeight: '800',
  },

  logout: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },

  logoutText: {
    color: colors.error,
    fontWeight: '700',
  },
});