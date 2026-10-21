import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function RutasAsignadasScreen({ navigation }) {
  const { usuario, getToken } = useAuth();
  const repartidorId = usuario?.id;

  const [rutas, setRutas] = useState([]);
  const [clientesPorRuta, setClientesPorRuta] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aceptando, setAceptando] = useState(null);

  const cargar = async (mostrarCarga = true) => {
    if (!repartidorId) {
      setLoading(false);
      return;
    }
    try {
      if (mostrarCarga) setLoading(true);
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.get(`/rutas/repartidor/${repartidorId}/asignadas`, { headers });
      const lista = Array.isArray(res?.data) ? res.data : [];
      setRutas(lista);

      // cargar clientes de cada ruta
      const mapa = {};
      await Promise.all(
        lista.map(async (r) => {
          try {
            const cr = await api.get(`/rutas/${r.id}/clientes`, { headers });
            mapa[r.id] = Array.isArray(cr?.data) ? cr.data : [];
          } catch (e) {
            mapa[r.id] = [];
          }
        })
      );
      setClientesPorRuta(mapa);
    } catch (error) {
      console.log('Error cargando rutas asignadas:', error?.response?.status, error?.response?.data);
      Alert.alert('Error', error?.response?.data?.error || 'No se pudieron cargar las rutas asignadas.');
    } finally {
      if (mostrarCarga) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [repartidorId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar(false);
    setRefreshing(false);
  };

  const aceptarRuta = async (ruta) => {
    if (!repartidorId) return;
    setAceptando(ruta.id);
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.put(`/rutas/${ruta.id}/aceptar`, { repartidorId }, { headers });
      Alert.alert('Ruta aceptada', `La ruta "${ruta.nombre}" ahora está en curso.`);
      await cargar(false);
      navigation.navigate('PedidosRepartidor');
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.error || 'No se pudo aceptar la ruta.');
    } finally {
      setAceptando(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando rutas asignadas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Rutas asignadas</Text>
      <Text style={styles.subtitle}>
        Estas son las rutas que el encargado te asignó. Acepta una para iniciarla.
      </Text>

      {rutas.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No tienes rutas asignadas por el momento.</Text>
        </View>
      )}

      {rutas.map((ruta) => {
        const clientes = clientesPorRuta[ruta.id] || [];
        return (
          <View key={ruta.id} style={styles.card}>
            <Text style={styles.cardTitle}>{ruta.nombre}</Text>
            <Text style={styles.cardMeta}>
              Días: {ruta.diasReparto || '—'} · Clientes: {clientes.length}
            </Text>
            {ruta.fechaAsignacion && (
              <Text style={styles.cardFecha}>
                Asignada: {new Date(ruta.fechaAsignacion).toLocaleString('es-MX')}
              </Text>
            )}

            {clientes.map((c, idx) => (
              <View key={c.id} style={styles.clienteRow}>
                <Text style={styles.clienteIdx}>{idx + 1}.</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clienteNombre}>{c.nombre}</Text>
                  <Text style={styles.clienteDir}>{c.domicilio}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.acceptBtn, aceptando === ruta.id && styles.acceptBtnDisabled]}
              onPress={() => aceptarRuta(ruta)}
              disabled={aceptando !== null}
            >
              <Text style={styles.acceptBtnText}>
                {aceptando === ruta.id ? 'Aceptando...' : 'Aceptar ruta'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: colors.text },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { color: colors.textSecondary },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  cardMeta: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  cardFecha: { fontSize: 12, color: colors.textSecondary, marginBottom: 10, fontStyle: 'italic' },
  clienteRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  clienteIdx: { width: 22, color: colors.textSecondary },
  clienteNombre: { fontWeight: '600', color: colors.text },
  clienteDir: { fontSize: 12, color: colors.textSecondary },
  acceptBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBtnDisabled: { opacity: 0.6 },
  acceptBtnText: { color: '#fff', fontWeight: 'bold' },
});