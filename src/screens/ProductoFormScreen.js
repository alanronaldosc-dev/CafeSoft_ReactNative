// ProductoFormScreen.js
// Crear y editar productos con imagen desde la galería del celular.
// expo-image-picker permite acceder a la galería, igual que un <input type="file"> en HTML.
// La imagen se convierte a base64 para enviarla a la API.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import colors from '../theme/colors';
import ProductoService from '../services/ProductoService';
import InventarioService from '../services/InventarioService';

const UNIDADES = ['litros', 'kilogramos', 'piezas'];

export default function ProductoFormScreen({ route, navigation }) {
  const productoEdit = route.params?.producto || null;
  const isEditing = productoEdit !== null;

  const [nombre, setNombre] = useState(productoEdit?.nombre || '');
  const [precio, setPrecio] = useState(productoEdit?.precio?.toString() || '');
  const [descripcion, setDescripcion] = useState(productoEdit?.descripcion || '');
  // imagen guarda el base64 de la imagen seleccionada
  const [imagen, setImagen] = useState(productoEdit?.imagen || null);
  // imagenUri es solo para mostrar la preview en pantalla
  const [imagenUri, setImagenUri] = useState(
    productoEdit?.imagen ? `data:image/jpeg;base64,${productoEdit.imagen}` : null
  );

  const [insumosAgregados, setInsumosAgregados] = useState(
    productoEdit?.insumos?.map(i => ({
      insumoId: i.insumoId,
      insumoNombre: i.insumoNombre,
      cantidad: i.cantidad?.toString() || '',
      unidadMedida: i.unidadMedida || 'litros',
    })) || []
  );

  const [inventario, setInventario] = useState([]);
  const [loadingInventario, setLoadingInventario] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState(null);
  const [cantidadInsumo, setCantidadInsumo] = useState('');
  const [unidadInsumo, setUnidadInsumo] = useState('litros');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInventario = async () => {
      try {
        const data = await InventarioService.getAll();
        setInventario(data);
      } catch (e) {
        Alert.alert('Error', 'No se pudo cargar el inventario');
      } finally {
        setLoadingInventario(false);
      }
    };
    loadInventario();
  }, []);

  // Abre la galería del celular y convierte la imagen a base64
  // En web sería un <input type="file">, acá usamos expo-image-picker
  const handlePickImage = async () => {
    // Solicita permiso para acceder a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar una imagen');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,   // permite recortar
      aspect: [4, 3],        // proporción del recorte
      quality: 0.7,          // calidad (0-1), reducimos para no enviar archivos muy grandes
      base64: true,          // pedimos el base64 directamente
    });

    // Si el usuario no canceló
    if (!result.canceled && result.assets[0]) {
      setImagenUri(result.assets[0].uri);      // para la preview
      setImagen(result.assets[0].base64);      // para enviar a la API
    }
  };

  const handleAddInsumo = () => {
    if (!selectedInventario) { Alert.alert('Error', 'Seleccioná un insumo del inventario'); return; }
    if (!cantidadInsumo || parseFloat(cantidadInsumo) <= 0) { Alert.alert('Error', 'La cantidad debe ser mayor a 0'); return; }
    if (insumosAgregados.find(i => i.insumoId === selectedInventario.id)) { Alert.alert('Error', 'Este insumo ya fue agregado'); return; }
    setInsumosAgregados(prev => [...prev, {
      insumoId: selectedInventario.id,
      insumoNombre: selectedInventario.nombre,
      cantidad: cantidadInsumo,
      unidadMedida: unidadInsumo,
    }]);
    setSelectedInventario(null);
    setCantidadInsumo('');
    setUnidadInsumo('litros');
  };

  const handleRemoveInsumo = (insumoId) => {
    setInsumosAgregados(prev => prev.filter(i => i.insumoId !== insumoId));
  };

  const validate = () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre es obligatorio'); return false; }
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) < 0) {
      Alert.alert('Error', 'El precio debe ser un número válido'); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const data = {
      nombre: nombre.trim(),
      precio: parseFloat(precio),
      descripcion: descripcion.trim() || null,
      imagen: imagen || null,  // base64 o null si no se seleccionó
      insumos: insumosAgregados.map(i => ({
        insumoId: i.insumoId,
        cantidad: parseFloat(i.cantidad),
        unidadMedida: i.unidadMedida,
      })),
    };
    try {
      setLoading(true);
      if (isEditing) {
        await ProductoService.update(productoEdit.id, data);
        Alert.alert('Éxito', 'Producto actualizado');
      } else {
        await ProductoService.create(data);
        Alert.alert('Éxito', 'Producto creado');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Producto' : 'Crear Producto'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Nombre */}
        <Text style={styles.label}>NOMBRE DEL PRODUCTO *</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Café Latte"
            placeholderTextColor={colors.textSecondary}
            value={nombre}
            onChangeText={setNombre}
            maxLength={100}
          />
        </View>

        {/* Precio */}
        <Text style={styles.label}>PRECIO *</Text>
        <View style={styles.input}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Descripción */}
        <Text style={styles.label}>DESCRIPCIÓN</Text>
        <View style={[styles.input, { alignItems: 'flex-start', paddingVertical: 10 }]}>
          <TextInput
            style={[styles.textInput, { minHeight: 60, textAlignVertical: 'top' }]}
            placeholder="Descripción del producto"
            placeholderTextColor={colors.textSecondary}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            maxLength={500}
          />
        </View>

        {/* Imagen */}
        <Text style={styles.label}>IMAGEN</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          {imagenUri ? (
            // Preview de la imagen seleccionada
            <Image source={{ uri: imagenUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>📷</Text>
              <Text style={styles.imagePlaceholderText}>Seleccionar archivo</Text>
              <Text style={styles.imagePlaceholderSub}>Sin archivos seleccionados</Text>
            </View>
          )}
        </TouchableOpacity>
        {imagenUri && (
          // Botón para quitar la imagen seleccionada
          <TouchableOpacity onPress={() => { setImagen(null); setImagenUri(null); }}>
            <Text style={styles.removeImage}>✕ Quitar imagen</Text>
          </TouchableOpacity>
        )}

        {/* Agregar insumos */}
        <Text style={styles.label}>AGREGAR INSUMOS</Text>
        <View style={styles.insumoSelectorCard}>
          {loadingInventario ? (
            <View style={styles.input}>
              <ActivityIndicator size="small" color={colors.secondary} />
              <Text style={styles.placeholderText}> Cargando inventario...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.input} onPress={() => setShowDropdown(!showDropdown)}>
                <Text style={selectedInventario ? styles.selectedText : styles.placeholderText}>
                  {selectedInventario ? selectedInventario.nombre : '— Selecciona un insumo —'}
                </Text>
                <Text style={styles.dropdownArrow}>▾</Text>
              </TouchableOpacity>
              {showDropdown && (
                <View style={styles.dropdown}>
                  {inventario.map(inv => (
                    <TouchableOpacity
                      key={inv.id}
                      style={styles.dropdownItem}
                      onPress={() => { setSelectedInventario(inv); setUnidadInsumo(inv.unidadMedida || 'litros'); setShowDropdown(false); }}
                    >
                      <Text style={styles.dropdownItemText}>{inv.nombre}</Text>
                      <Text style={styles.dropdownItemSub}>{inv.unidadMedida}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={styles.insumoAddRow}>
            <View style={[styles.input, { flex: 1 }]}>
              <TextInput
                style={styles.textInput}
                placeholder="Cantidad"
                placeholderTextColor={colors.textSecondary}
                value={cantidadInsumo}
                onChangeText={setCantidadInsumo}
                keyboardType="decimal-pad"
              />
            </View>
            <TouchableOpacity style={styles.addInsumoButton} onPress={handleAddInsumo}>
              <Text style={styles.addInsumoButtonText}>+ Agregar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.unidadRow}>
            {UNIDADES.map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unidadButton, unidadInsumo === u && styles.unidadButtonActive]}
                onPress={() => setUnidadInsumo(u)}
              >
                <Text style={[styles.unidadText, unidadInsumo === u && styles.unidadTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lista de insumos agregados */}
        {insumosAgregados.length > 0 && (
          <View style={styles.insumosListCard}>
            <Text style={styles.insumosListTitle}>Insumos agregados</Text>
            {insumosAgregados.map((item, index) => (
              <View key={index} style={styles.insumoRow}>
                <Text style={styles.insumoRowText}>
                  • {item.insumoNombre} — {item.cantidad} {item.unidadMedida}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveInsumo(item.insumoId)}>
                  <Text style={styles.removeInsumo}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Botón submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Guardar Cambios' : 'Registrar Producto'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
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
  headerTitle: { color: colors.textLight, fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 11, fontWeight: '700', color: colors.textSecondary,
    letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  textInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  currencySymbol: { fontSize: 15, color: colors.textSecondary, marginRight: 8 },
  placeholderText: { flex: 1, fontSize: 15, color: colors.textSecondary },
  selectedText: { flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  dropdownArrow: { color: colors.textSecondary, fontSize: 16 },
  dropdown: {
    backgroundColor: colors.white, borderRadius: 14, marginTop: 4,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.surface,
  },
  dropdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  dropdownItemText: { fontSize: 15, color: colors.textPrimary },
  dropdownItemSub: { fontSize: 12, color: colors.textSecondary },
  // Estilos de imagen
  imagePicker: {
    backgroundColor: colors.white, borderRadius: 14,
    overflow: 'hidden', minHeight: 100,
  },
  imagePreview: { width: '100%', height: 180, resizeMode: 'cover' },
  imagePlaceholder: {
    alignItems: 'center', justifyContent: 'center',
    padding: 24, gap: 6,
  },
  imagePlaceholderIcon: { fontSize: 32 },
  imagePlaceholderText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  imagePlaceholderSub: { fontSize: 12, color: colors.textSecondary },
  removeImage: {
    color: colors.error, fontSize: 13, marginTop: 6, textAlign: 'right',
  },
  // Insumos
  insumoSelectorCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 12, gap: 10,
  },
  insumoAddRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addInsumoButton: {
    backgroundColor: colors.secondary, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  addInsumoButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  unidadRow: { flexDirection: 'row', gap: 6 },
  unidadButton: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.white, alignItems: 'center',
  },
  unidadButtonActive: { backgroundColor: colors.primary },
  unidadText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  unidadTextActive: { color: colors.white, fontWeight: '700' },
  insumosListCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14, marginTop: 10,
  },
  insumosListTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 },
  insumoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  insumoRowText: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  removeInsumo: { fontSize: 16, color: colors.error, paddingHorizontal: 8 },
  submitButton: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 28,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});
