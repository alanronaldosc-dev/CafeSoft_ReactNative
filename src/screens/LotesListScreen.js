// LotesListScreen.js
// Lista todos los lotes registrados en el inventario.
// Muestra: ID, Insumo, Cantidad, Fecha Entrada, Fecha Caducidad, Observaciones

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import LoteService from '../services/LoteService';

export default function LotesListScreen({ navigation }) {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recarga cada vez que volvés a esta pantalla
  useFocusEffect(
    useCallback(() => {
      loadLotes();
    }, [])
  );

  const loadLotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LoteService.getAll();
      setLotes(data);
    } catch (e) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar Lote',
      '¿Estás seguro de eliminar este lote del inventario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await LoteService.delete(id);
              loadLotes();
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar el lote');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {/* Fila: ID + Nombre insumo */}
      <View style={styles.itemHeader}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>{item.id}</Text>
        </View>
        <Text style={styles.itemName}>{item.insumoNombre}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteIcon}>🗑</Text>
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
      {item.proveedorNombre ? (
  <Text style={styles.proveedorLabel}>🏢 {item.proveedorNombre}</Text>
) : null}

      {/* Detalle del lote */}
      <View style={styles.itemDetails}>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>CANTIDAD</Text>
          <Text style={styles.detailValue}>
            {item.cantidad} {item.insumoUnidad}
          </Text>
        </View>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>FECHA ENTRADA</Text>
          <Text style={styles.detailValue}>{item.fechaEntrada}</Text>
        </View>
        <View style={styles.detailCol}>
          <Text style={styles.detailLabel}>FECHA CADUCIDAD</Text>
          <Text style={styles.detailValue}>{item.fechaCaducidad}</Text>
        </View>
      </View>

      {/* Observaciones */}
      <View style={styles.obsRow}>
        <Text style={styles.detailLabel}>OBSERVACIONES</Text>
        <Text style={styles.detailValue}>
          {item.observaciones || 'Ninguna'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>📦</Text>
          <Text style={styles.headerTitle}>Lotes de Insumos</Text>
        </View>
        {/* Botón registrar nuevo lote */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('LoteForm')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Botón grande de registrar (como en el Figma) */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('LoteForm')}
      >
        <Text style={styles.registerButtonText}>+ Registrar Lote</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Cargando lotes...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLotes}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lotes}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No hay lotes registrados</Text>
            </View>
          }
        />
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.secondary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  registerButton: {
    backgroundColor: colors.secondary,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  idBadge: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  idText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  deleteIcon: {
    fontSize: 14,
  },
  deleteText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  obsRow: {
    borderTopWidth: 1,
    borderTopColor: colors.background,
    paddingTop: 8,
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
  },
  proveedorLabel: {
  fontSize: 13,
  color: colors.textSecondary,
  marginHorizontal: 16,
  marginBottom: 4,
},
});
