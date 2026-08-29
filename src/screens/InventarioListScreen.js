import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import InventarioService from '../services/InventarioService';

export default function InventarioListScreen({ navigation }) {
  const [inventario, setInventario] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadInventario();
    }, [])
  );

  const loadInventario = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await InventarioService.getAll();
      setInventario(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar existencias por nombre
  const inventarioFiltrado = inventario.filter((item) =>
    item.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Determinar si el producto está bajo stock
  const esBajoStock = (item) =>
    Number(item.cantidad) <= Number(item.cantidadMinima);

  const renderItem = ({ item }) => {
    const bajoStock = esBajoStock(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <Text style={styles.itemType}>{item.tipo}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              bajoStock
                ? styles.statusLow
                : styles.statusNormal,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                bajoStock
                  ? styles.statusLowText
                  : styles.statusNormalText,
              ]}
            >
              {bajoStock ? '⚠️ Bajo stock' : '✓ Disponible'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.stockRow}>
          <View style={styles.stockColumn}>
            <Text style={styles.label}>EXISTENCIA ACTUAL</Text>
            <Text
              style={[
                styles.stockValue,
                bajoStock && styles.stockValueLow,
              ]}
            >
              {item.cantidad} {item.unidadMedida}
            </Text>
          </View>

          <View style={styles.stockColumn}>
            <Text style={styles.label}>STOCK MÍNIMO</Text>
            <Text style={styles.minimumValue}>
              {item.cantidadMinima} {item.unidadMedida}
            </Text>
          </View>
        </View>

        {bajoStock && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Se requiere reabastecimiento
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Existencias
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={colors.secondary}
          />
          <Text style={styles.loadingText}>
            Cargando existencias...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadInventario}
          >
            <Text style={styles.retryText}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔎</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar insumo..."
              placeholderTextColor={colors.textSecondary}
              value={busqueda}
              onChangeText={setBusqueda}
            />

            {busqueda.length > 0 && (
              <TouchableOpacity
                onPress={() => setBusqueda('')}
              >
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Resumen */}
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {inventarioFiltrado.length} existencia
              {inventarioFiltrado.length !== 1 ? 's' : ''}
            </Text>

            <Text style={styles.summaryLow}>
              {
                inventarioFiltrado.filter(esBajoStock).length
              } bajo stock
            </Text>
          </View>

          {/* Lista */}
          <FlatList
            data={inventarioFiltrado}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyEmoji}>📦</Text>

                <Text style={styles.emptyText}>
                  {busqueda
                    ? 'No se encontraron existencias'
                    : 'No hay existencias registradas'}
                </Text>
              </View>
            }
          />
        </>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },

  backButton: {
    color: colors.textLight,
    fontSize: 24,
  },

  headerTitle: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: 'bold',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },

  clearButton: {
    fontSize: 16,
    color: colors.textSecondary,
    padding: 5,
  },

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  summaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  summaryLow: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '600',
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  nameContainer: {
    flex: 1,
    marginRight: 10,
  },

  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  itemType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },

  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusLow: {
    backgroundColor: '#FEE2E2',
  },

  statusNormal: {
    backgroundColor: '#DCFCE7',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  statusLowText: {
    color: '#B91C1C',
  },

  statusNormalText: {
    color: '#15803D',
  },

  divider: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: 12,
  },

  stockRow: {
    flexDirection: 'row',
    gap: 12,
  },

  stockColumn: {
    flex: 1,
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  stockValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  stockValueLow: {
    color: '#B91C1C',
  },

  minimumValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 9,
    marginTop: 12,
  },

  warningText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },

  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },

  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  errorText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryText: {
    color: colors.white,
    fontWeight: '600',
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
