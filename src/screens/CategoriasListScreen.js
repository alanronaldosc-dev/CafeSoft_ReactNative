// CategoriasListScreen.js
// CRUD de categorías + modal para asignar productos

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import CategoriaService from '../services/CategoriaService';
import ProductoService from '../services/ProductoService';

export default function CategoriasListScreen({ navigation }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal asignar productos
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [todosProductos, setTodosProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [guardando, setGuardando] = useState(null);

  useFocusEffect(
    useCallback(() => { loadCategorias(); }, [])
  );

  const loadCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoriaService.getAll();
      setCategorias(data);
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, nombre) => {
    Alert.alert('Eliminar Categoría', `¿Eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await CategoriaService.delete(id);
            loadCategorias();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la categoría');
          }
        },
      },
    ]);
  };

  const handleAgregarProductos = async (categoria) => {
    setCategoriaSeleccionada(categoria);
    setModalVisible(true);
    setLoadingProductos(true);
    try {
      const data = await ProductoService.getAll();
      setTodosProductos(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar los productos');
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleToggleCategoria = async (producto) => {
    const yaAsignado = producto.categoriaId === categoriaSeleccionada.id;
    const nuevaCategoriaId = yaAsignado ? null : categoriaSeleccionada.id;
    setGuardando(producto.id);
    try {
      await ProductoService.update(producto.id, {
        nombre: producto.nombre,
        precio: producto.precio,
        descripcion: producto.descripcion,
        imagen: producto.imagen,
        categoriaId: nuevaCategoriaId,
        insumos: producto.insumos?.map(i => ({
          insumoId: i.insumoId,
          cantidad: i.cantidad,
          unidadMedida: i.unidadMedida,
        })) || [],
      });
      setTodosProductos(prev =>
        prev.map(p =>
          p.id === producto.id
            ? { ...p, categoriaId: nuevaCategoriaId, categoriaNombre: nuevaCategoriaId ? categoriaSeleccionada.nombre : null }
            : p
        )
      );
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setGuardando(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemTop}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.nombre}</Text>
          {item.descripcion ? (
            <Text style={styles.itemDesc}>{item.descripcion}</Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, item.activo ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.statusText}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.btnProductos} onPress={() => handleAgregarProductos(item)}>
          <Text style={styles.btnProductosText}>📋 Agregar Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnEdit} onPress={() => navigation.navigate('CategoriaForm', { categoria: item })}>
          <Text style={styles.btnEditText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id, item.nombre)}>
          <Text style={styles.btnDeleteText}>🗑</Text>
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
          <Text style={styles.headerEmoji}>🏷️</Text>
          <Text style={styles.headerTitle}>Categorías</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CategoriaForm', { categoria: null })}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCategorias}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categorias}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyEmoji}>🏷️</Text>
              <Text style={styles.emptyText}>No hay categorías registradas</Text>
            </View>
          }
        />
      )}

      {/* Modal asignar productos */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📋 {categoriaSeleccionada?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Toca un producto para asignarlo o quitarlo</Text>

            {loadingProductos ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.secondary} />
              </View>
            ) : (
              <ScrollView style={styles.modalList}>
                {todosProductos.map(producto => {
                  const asignado = producto.categoriaId === categoriaSeleccionada?.id;
                  return (
                    <TouchableOpacity
                      key={producto.id}
                      style={[styles.productoItem, asignado && styles.productoItemAsignado]}
                      onPress={() => handleToggleCategoria(producto)}
                      disabled={guardando === producto.id}
                    >
                      <View style={styles.productoInfo}>
                        <Text style={styles.productoNombre}>{producto.nombre}</Text>
                        <Text style={styles.productoPrecio}>${producto.precio} MXN</Text>
                        {producto.categoriaNombre && !asignado && (
                          <Text style={styles.categoriaActual}>En: {producto.categoriaNombre}</Text>
                        )}
                      </View>
                      <View style={[styles.checkBox, asignado && styles.checkBoxActive]}>
                        {guardando === producto.id
                          ? <ActivityIndicator size="small" color={colors.white} />
                          : asignado && <Text style={styles.checkMark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 55, paddingBottom: 16, paddingHorizontal: 20,
  },
  backButton: { color: colors.textLight, fontSize: 24 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmoji: { fontSize: 20 },
  headerTitle: { color: colors.textLight, fontSize: 18, fontWeight: 'bold' },
  addButton: {
    width: 36, height: 36, backgroundColor: colors.secondary,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  addButtonText: { color: colors.white, fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  list: { padding: 16, paddingBottom: 40 },
  item: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  itemTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 3 },
  itemDesc: { fontSize: 13, color: colors.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
  badgeActive: { backgroundColor: '#D1FAE5' },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.textPrimary },
  actionsRow: {
    flexDirection: 'row', gap: 8,
    borderTopWidth: 1, borderTopColor: colors.background, paddingTop: 10,
  },
  btnProductos: {
    flex: 1, backgroundColor: colors.primary, borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  btnProductosText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  btnEdit: {
    width: 36, height: 36, backgroundColor: colors.surface,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  btnEditText: { fontSize: 16 },
  btnDelete: {
    width: 36, height: 36, backgroundColor: '#FEE2E2',
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  btnDeleteText: { fontSize: 16 },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: colors.surface,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  modalClose: { fontSize: 20, color: colors.textSecondary, padding: 4 },
  modalSubtitle: {
    fontSize: 13, color: colors.textSecondary,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4,
  },
  modalList: { paddingHorizontal: 16, paddingTop: 8 },
  productoItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 12, padding: 14,
    marginBottom: 8,
  },
  productoItemAsignado: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#22C55E' },
  productoInfo: { flex: 1 },
  productoNombre: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  productoPrecio: { fontSize: 13, color: colors.secondary, marginTop: 2 },
  categoriaActual: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  checkBox: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2,
    borderColor: colors.textSecondary, alignItems: 'center', justifyContent: 'center',
  },
  checkBoxActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  checkMark: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: colors.textSecondary },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: colors.white, fontWeight: '600' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
