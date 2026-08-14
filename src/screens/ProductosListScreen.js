// ProductosListScreen.js
// Lista todos los productos con sus insumos asociados.
// Columnas: ID, Nombre, Precio, Descripción, Insumos, Imagen, Acciones

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import ProductoService from '../services/ProductoService';

export default function ProductosListScreen({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadProductos();
    }, [])
  );

  const loadProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductoService.getAll();
      setProductos(data);
    } catch (e) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, nombre) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de eliminar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProductoService.delete(id);
              loadProductos();
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>

      {/* Fila principal */}
      <View style={styles.itemHeader}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>{item.id}</Text>
        </View>
        <View style={styles.itemMain}>
          <Text style={styles.itemName}>{item.nombre}</Text>
          <Text style={styles.itemPrice}>${item.precio} MXN</Text>
        </View>
        {/* Imagen del producto si tiene */}
        {item.imagen ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.imagen}` }}
            style={styles.itemImage}
          />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷</Text>
          </View>
        )}
      </View>

      {/* Descripción */}
      {item.descripcion ? (
        <Text style={styles.itemDesc}>{item.descripcion}</Text>
      ) : null}

      {/* Insumos asociados */}
      {item.insumos && item.insumos.length > 0 && (
        <View style={styles.insumosContainer}>
          <Text style={styles.insumosLabel}>INSUMOS</Text>
          {item.insumos.map((pi, index) => (
            <Text key={index} style={styles.insumoItem}>
              • {pi.insumoNombre} — {pi.cantidad} {pi.unidadMedida}
            </Text>
          ))}
        </View>
      )}

      {/* Acciones */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('ProductoForm', { producto: item })}
        >
          <Text style={styles.editButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.nombre)}
        >
          <Text style={styles.deleteButtonText}>🗑 Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>📦</Text>
          <Text style={styles.headerTitle}>Productos</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ProductoForm', { producto: null })}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProductos}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No hay productos registrados</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: { color: colors.textLight, fontSize: 24 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmoji: { fontSize: 20 },
  headerTitle: { color: colors.textLight, fontSize: 18, fontWeight: 'bold' },
  addButton: {
    width: 36, height: 36,
    backgroundColor: colors.secondary,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  addButtonText: { color: colors.white, fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  list: { padding: 16, paddingBottom: 40 },
  item: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  idBadge: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  idText: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary },
  itemMain: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
  itemPrice: { fontSize: 13, color: colors.secondary, marginTop: 2 },
  itemImage: { width: 50, height: 50, borderRadius: 8 },
  itemImagePlaceholder: {
    width: 50, height: 50, borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderText: { fontSize: 22 },
  itemDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  insumosContainer: { marginBottom: 10 },
  insumosLabel: {
    fontSize: 10, fontWeight: '700',
    color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 4,
  },
  insumoItem: { fontSize: 13, color: colors.textPrimary, marginBottom: 2 },
  actionsRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: colors.background, paddingTop: 10 },
  editButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: 8, paddingVertical: 8, gap: 4,
  },
  editButtonText: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  deleteButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.secondary, borderRadius: 8, paddingVertical: 8, gap: 4,
  },
  deleteButtonText: { fontSize: 13, color: colors.white, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: colors.textSecondary },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: colors.white, fontWeight: '600' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
