// InsumosListScreen.js
// Lista todos los insumos desde la API.
// Equivalente a InsumoController@index en Laravel.

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
import InsumoService from '../services/InsumoService';

export default function InsumosListScreen({ navigation }) {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useFocusEffect recarga la lista cada vez que volvés a esta pantalla.
  // Equivalente a que el index() del controller siempre haga un fresh query.
  useFocusEffect(
    useCallback(() => {
      loadInsumos();
    }, [])
  );

  const loadInsumos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await InsumoService.getAll();
      setInsumos(data);
    } catch (e) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, nombre) => {
    // Alert.alert es el equivalente a un modal de confirmación
    Alert.alert(
      'Eliminar Insumo',
      `¿Estás seguro de eliminar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await InsumoService.delete(id);
              // Recarga la lista después de eliminar
              loadInsumos();
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar el insumo');
            }
          },
        },
      ]
    );
  };

  // Cada fila de la lista
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.nombre}</Text>
        <Text style={styles.itemDetail}>Tipo: {item.tipo}</Text>
        <Text style={styles.itemDetail}>Unidad: {item.unidadMedida}</Text>
        <Text style={styles.itemDetail}>
  Proveedor: {item.proveedorNombre || item.proveedor || '—'}
</Text>
        <Text style={styles.itemPrice}>${item.precio} MXN</Text>
      </View>
      <View style={styles.itemActions}>
        {/* Botón editar — navega al form con los datos del insumo */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('InsumoForm', { insumo: item })}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        {/* Botón eliminar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.nombre)}
        >
          <Text style={styles.deleteButtonText}>🗑</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Insumos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('InsumoForm', { insumo: null })}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Estados: cargando, error o lista */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Cargando insumos...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInsumos}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={insumos}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No hay insumos registrados</Text>
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
  headerTitle: {
    color: colors.textLight,
    fontSize: 20,
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
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: 4,
  },
  itemActions: {
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.surface,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FEE2E2',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
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
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
