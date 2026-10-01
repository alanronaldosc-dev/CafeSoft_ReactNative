import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function PedidosScreen() {
  const { usuario } = useAuth();

  const repartidorId =
    usuario?.id ?? usuario?.idUsuario ?? usuario?.id_usuario;

  const [pedidos, setPedidos] = useState([]);
  const [resumenHoy, setResumenHoy] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [garrafones, setGarrafones] = useState('1');
  const [envasesVacios, setEnvasesVacios] = useState('0');
  const [metodoCobro, setMetodoCobro] = useState('EFECTIVO');
  const [montoCobrado, setMontoCobrado] = useState('0');
  const [observaciones, setObservaciones] = useState('');

  const cargarResumenHoy = async () => {
    if (!repartidorId) return;

    try {
      const res = await api.get(
        `/liquidaciones/repartidor/${repartidorId}/resumen`
      );
      setResumenHoy(res.data);
    } catch (error) {
      console.log('No se pudo cargar el resumen del día:', error?.message);
    }
  };

  const cargarPedidos = async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargando(true);

      const res = await api.get('/ventas/pedidos/pendientes');
      setPedidos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudieron cargar los pedidos.'
      );
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
      cargarResumenHoy();
    }, [])
  );

  const abrirConfirmacion = (pedido) => {
    setPedidoSeleccionado(pedido);
    setGarrafones('1');
    setEnvasesVacios('0');
    setMetodoCobro('EFECTIVO');
    setMontoCobrado(String(Number(pedido.total || 0).toFixed(2)));
    setObservaciones('');
    setModalVisible(true);
  };

  const confirmarEntrega = async () => {
    if (!repartidorId) {
      Alert.alert('Error', 'No se pudo identificar al repartidor.');
      return;
    }

    const cantidad = Number(garrafones);
    const vacios = Number(envasesVacios);
    const cobrado = Number(montoCobrado);

    if (!cantidad || cantidad <= 0) {
      Alert.alert('Dato inválido', 'Ingresa los garrafones entregados.');
      return;
    }

    if (vacios < 0 || cobrado < 0) {
      Alert.alert('Dato inválido', 'Los valores no pueden ser negativos.');
      return;
    }

    try {
      setGuardando(true);

      // Validar primero que el repartidor tenga una carga aceptada
      // y suficientes garrafones disponibles. Esto evita un 400 poco claro.
      const cargasRes = await api.get(`/cargas/repartidor/${repartidorId}`);
      const cargasData = cargasRes?.data;
      const listaCargas = Array.isArray(cargasData)
        ? cargasData
        : Array.isArray(cargasData?.data)
          ? cargasData.data
          : Array.isArray(cargasData?.cargas)
            ? cargasData.cargas
            : [];

      const cargasActivas = listaCargas.filter((carga) => {
        const estado = String(carga?.estado || '')
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return estado === 'CARGA EN TRANSITO';
      });

      const disponibleTotal = cargasActivas.reduce((total, carga) => {
        const disponible = Number(
          carga?.cantidadDisponible ?? carga?.cantidad ?? 0
        );
        return total + (Number.isFinite(disponible) ? disponible : 0);
      }, 0);

      if (disponibleTotal + 0.0001 < cantidad) {
        Alert.alert(
          'Carga insuficiente',
          disponibleTotal > 0
            ? `Tienes ${disponibleTotal} garrafón(es) disponibles y quieres entregar ${cantidad}.`
            : 'No tienes una carga activa. Ve a Cargas, acepta una carga y vuelve a intentar.'
        );
        return;
      }

      const payload = {
        repartidorId: Number(repartidorId),
        garrafonesEntregados: cantidad,
        envasesVaciosRecibidos: vacios,
        metodoCobro,
        montoCobrado: cobrado,
        observaciones: observaciones.trim(),
      };

      console.log('Confirmando entrega:', {
        pedidoId: pedidoSeleccionado.id,
        ...payload,
      });

      await api.put(
        `/ventas/${pedidoSeleccionado.id}/confirmar-entrega`,
        payload
      );

      setPedidos((actuales) =>
        actuales.filter((p) => p.id !== pedidoSeleccionado.id)
      );
      setModalVisible(false);
      cargarResumenHoy();

      Alert.alert(
        'Entrega confirmada',
        'Se descontó la carga y se registró el cobro correctamente.'
      );
    } catch (error) {
      const data = error?.response?.data;

      // Usamos console.log en lugar de console.error para evitar que Expo
      // muestre la pantalla roja por un error HTTP controlado (400).
      console.log('Entrega rechazada por la API:', data || error?.message);

      let mensaje =
        data?.error ||
        data?.message ||
        data?.mensaje ||
        'No se pudo confirmar la entrega.';

      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        mensaje =
          data.errors[0]?.defaultMessage ||
          data.errors[0]?.message ||
          mensaje;
      }

      Alert.alert('No se pudo confirmar', mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const reportarIncidencia = (pedido) => {
    if (!repartidorId) {
      Alert.alert('Error', 'No se pudo identificar al repartidor.');
      return;
    }

    const enviar = async (motivo) => {
      try {
        await api.put(`/ventas/${pedido.id}/reportar-incidencia`, {
          repartidorId: Number(repartidorId),
          motivo,
          observaciones: '',
        });

        setPedidos((actuales) => actuales.filter((p) => p.id !== pedido.id));
        Alert.alert('Incidencia registrada', 'El reporte quedó guardado.');
      } catch (error) {
        Alert.alert(
          'Error',
          error.response?.data?.error || 'No se pudo registrar la incidencia.'
        );
      }
    };

    Alert.alert(
      'Reportar incidencia',
      `Pedido ${pedido.folio || pedido.id}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cliente ausente',
          onPress: () => enviar('CLIENTE_AUSENTE'),
        },
        {
          text: 'Sin envases',
          onPress: () => enviar('SIN_ENVASES'),
        },
      ]
    );
  };

  const moneda = (valor) => `$${Number(valor || 0).toFixed(2)}`;

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Pedidos por entregar</Text>
        <Text style={styles.headerSubtitle}>HU-015 · Confirma entrega y cobro</Text>
      </View>

      {resumenHoy && (
        <View style={styles.balanceBar}>
          <View>
            <Text style={styles.balanceLabel}>Cobrado hoy</Text>
            <Text style={styles.balanceValue}>{moneda(resumenHoy.totalCobrado)}</Text>
          </View>
          <View style={styles.balanceRight}>
            <Text style={styles.balanceSmall}>💵 {moneda(resumenHoy.totalEfectivo)}</Text>
            <Text style={styles.balanceSmall}>🏦 {moneda(resumenHoy.totalTransferencias)}</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              setRefrescando(true);
              cargarPedidos(false);
            }}
          />
        }
      >
        {pedidos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>No hay pedidos pendientes</Text>
            <Text style={styles.emptyText}>
              Cuando exista un pedido aparecerá aquí.
            </Text>
          </View>
        ) : (
          pedidos.map((pedido) => (
            <View key={pedido.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.folio}>{pedido.folio || `Pedido #${pedido.id}`}</Text>
                  <Text style={styles.client}>
                    👤 {pedido.nombreCliente || 'Cliente sin nombre'}
                  </Text>
                </View>
                <Text style={styles.total}>{moneda(pedido.total)}</Text>
              </View>

              <View style={styles.divider} />

              {pedido.detalles?.map((detalle, index) => (
                <Text key={detalle.id || index} style={styles.itemText}>
                  {detalle.cantidad} × {detalle.productoNombre}
                </Text>
              ))}

              <Text style={styles.meta}>
                Pago del pedido: {pedido.metodoPago || 'Sin dato'}
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => abrirConfirmacion(pedido)}
              >
                <Text style={styles.primaryButtonText}>✅ Confirmar entrega</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => reportarIncidencia(pedido)}
              >
                <Text style={styles.secondaryButtonText}>⚠️ Reportar incidencia</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar entrega</Text>
            <Text style={styles.modalSubtitle}>
              {pedidoSeleccionado?.folio || ''} · {pedidoSeleccionado?.nombreCliente || 'Cliente'}
            </Text>

            <Text style={styles.label}>Garrafones entregados</Text>
            <TextInput
              value={garrafones}
              onChangeText={setGarrafones}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Ej. 4"
            />

            <Text style={styles.label}>Envases vacíos recibidos</Text>
            <TextInput
              value={envasesVacios}
              onChangeText={setEnvasesVacios}
              keyboardType="numeric"
              style={styles.input}
              placeholder="Ej. 4"
            />

            <Text style={styles.label}>Forma de cobro</Text>
            <View style={styles.methodRow}>
              {['EFECTIVO', 'TRANSFERENCIA'].map((metodo) => (
                <TouchableOpacity
                  key={metodo}
                  style={[
                    styles.methodButton,
                    metodoCobro === metodo && styles.methodButtonActive,
                  ]}
                  onPress={() => setMetodoCobro(metodo)}
                >
                  <Text
                    style={[
                      styles.methodText,
                      metodoCobro === metodo && styles.methodTextActive,
                    ]}
                  >
                    {metodo === 'EFECTIVO' ? '💵 Efectivo' : '🏦 Transferencia'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Pago cobrado</Text>
            <TextInput
              value={montoCobrado}
              onChangeText={setMontoCobrado}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="0.00"
            />

            <Text style={styles.label}>Observaciones</Text>
            <TextInput
              value={observaciones}
              onChangeText={setObservaciones}
              style={[styles.input, styles.multiline]}
              multiline
              placeholder="Opcional"
            />

            <TouchableOpacity
              style={[styles.primaryButton, guardando && styles.disabled]}
              onPress={confirmarEntrega}
              disabled={guardando}
            >
              <Text style={styles.primaryButtonText}>
                {guardando ? 'Guardando...' : 'Confirmar entrega'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              disabled={guardando}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#E9D8C8',
  },
  balanceBar: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  balanceValue: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  balanceRight: {
    alignItems: 'flex-end',
  },
  balanceSmall: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    marginVertical: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  folio: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  client: {
    marginTop: 5,
    color: colors.textSecondary,
  },
  total: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E7DDD4',
    marginVertical: 12,
  },
  itemText: {
    color: colors.textPrimary,
    marginBottom: 5,
  },
  meta: {
    marginTop: 8,
    color: colors.textSecondary,
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 9,
    borderWidth: 1,
    borderColor: '#D1A381',
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 42,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 19,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 6,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    marginTop: 4,
    marginBottom: 12,
    color: colors.textSecondary,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7C9BD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FFFDF9',
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D7C9BD',
    borderRadius: 10,
    padding: 11,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  methodTextActive: {
    color: colors.white,
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
});
