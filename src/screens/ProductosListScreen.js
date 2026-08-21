
// ProductosListScreen.js
// HU-017 - Visualización de productos en tarjetas
// Muestra nombre, precio, imagen y categoría.
// La vista se adapta al ancho disponible.

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
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import ProductoService from '../services/ProductoService';

export default function ProductosListScreen({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { width } = useWindowDimensions();

  // En pantallas pequeñas se muestra una tarjeta por fila.
  // En pantallas más anchas se muestran dos columnas.
  const numColumns = width >= 600 ? 2 : 1;

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

      setProductos(Array.isArray(data) ? data : []);
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
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProductoService.delete(id);
              loadProductos();
            } catch (e) {
              Alert.alert(
                'Error',
                'No se pudo eliminar el producto'
              );
            }
          },
        },
      ]
    );
  };

  // Obtiene la categoría aunque la API utilice diferentes estructuras.
  const getCategoria = (producto) => {
  return producto.categoriaNombre || 'Sin categoría';
};

  const renderItem = ({ item }) => {
    const categoria = getCategoria(item);

    return (
      <View
        style={[
          styles.card,
          numColumns === 2 && styles.cardTwoColumns,
        ]}
      >
        {/* Imagen del producto */}
        {item.imagen ? (
          <Image
            source={{
              uri: `data:image/jpeg;base64,${item.imagen}`,
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>📦</Text>
            <Text style={styles.placeholderText}>
              Sin imagen
            </Text>
          </View>
        )}

        {/* Información principal */}
        <View style={styles.cardContent}>
          <Text
            style={styles.productName}
            numberOfLines={2}
          >
            {item.nombre}
          </Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {categoria}
            </Text>
          </View>

          <Text style={styles.productPrice}>
            ${item.precio} MXN
          </Text>

          {item.descripcion ? (
            <Text
              style={styles.productDescription}
              numberOfLines={2}
            >
              {item.descripcion}
            </Text>
          ) : null}

          {/* Insumos */}
          {item.insumos && item.insumos.length > 0 && (
            <View style={styles.insumosContainer}>
              <Text style={styles.insumosTitle}>
                INSUMOS
              </Text>

              {item.insumos.slice(0, 3).map((pi, index) => (
                <Text
                  key={index}
                  style={styles.insumoText}
                  numberOfLines={1}
                >
                  • {pi.insumoNombre} — {pi.cantidad}{' '}
                  {pi.unidadMedida}
                </Text>
              ))}

              {item.insumos.length > 3 && (
                <Text style={styles.moreText}>
                  +{item.insumos.length - 3} insumos más
                </Text>
              )}
            </View>
          )}

          {/* Acciones */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate('ProductoForm', {
                  producto: item,
                })
              }
            >
              <Text style={styles.editButtonText}>
                ✏️ Editar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                handleDelete(item.id, item.nombre)
              }
            >
              <Text style={styles.deleteButtonText}>
                🗑 Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Regresar"
        >
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>📦</Text>

          <Text style={styles.headerTitle}>
            Productos
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('ProductoForm', {
              producto: null,
            })
          }
          accessibilityLabel="Agregar producto"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={colors.secondary}
          />

          <Text style={styles.loadingText}>
            Cargando productos...
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
            onPress={loadProductos}
          >
            <Text style={styles.retryText}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={productos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          columnWrapperStyle={
            numColumns === 2
              ? styles.columnWrapper
              : undefined
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyEmoji}>📦</Text>

              <Text style={styles.emptyText}>
                No hay productos registrados
              </Text>
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
    fontSize: 28,
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

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  columnWrapper: {
    gap: 12,
  },

  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  cardTwoColumns: {
    maxWidth: '50%',
  },

  productImage: {
    width: '100%',
    height: 170,
    backgroundColor: colors.surface,
  },

  imagePlaceholder: {
    width: '100%',
    height: 170,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderEmoji: {
    fontSize: 42,
    marginBottom: 6,
  },

  placeholderText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  cardContent: {
    padding: 14,
  },

  productName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 8,
  },

  productDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 10,
  },

  insumosContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.background,
    paddingTop: 10,
    marginBottom: 10,
  },

  insumosTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  insumoText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  moreText: {
    fontSize: 11,
    color: colors.secondary,
    marginTop: 3,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.background,
    paddingTop: 10,
  },

  editButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 9,
  },

  editButtonText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  deleteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 9,
  },

  deleteButtonText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
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
});
