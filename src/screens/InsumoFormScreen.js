// InsumoFormScreen.js
// Formulario para crear y editar insumos.
// Si recibe un insumo por parámetro, es edición. Si no, es creación.
// Equivalente a InsumoController@create + @store + @edit + @update en Laravel.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import colors from '../theme/colors';
import InsumoService from '../services/InsumoService';

// Unidades válidas según el modelo Java
const UNIDADES = ['litros', 'kilogramos', 'piezas'];

export default function InsumoFormScreen({ route, navigation }) {
  // route.params.insumo viene de la pantalla anterior
  // Si es null, es un formulario de creación. Si tiene datos, es edición.
  // Equivalente a: $insumo = Insumo::findOrNew($id);
  const insumoEdit = route.params?.insumo || null;
  const isEditing = insumoEdit !== null;

  // Inicializamos los estados con los datos del insumo si es edición
  const [nombre, setNombre] = useState(insumoEdit?.nombre || '');
  const [tipo, setTipo] = useState(insumoEdit?.tipo || '');
  const [unidadMedida, setUnidadMedida] = useState(insumoEdit?.unidadMedida || 'litros');
  const [proveedor, setProveedor] = useState(insumoEdit?.proveedor || '');
  const [precio, setPrecio] = useState(insumoEdit?.precio?.toString() || '');
  const [loading, setLoading] = useState(false);

  // Validación básica — equivalente a $request->validate() en Laravel
  const validate = () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre es obligatorio'); return false; }
    if (nombre.length > 20) { Alert.alert('Error', 'El nombre no puede exceder 20 caracteres'); return false; }
    if (!tipo.trim()) { Alert.alert('Error', 'El tipo es obligatorio'); return false; }
    if (!proveedor.trim()) { Alert.alert('Error', 'El proveedor es obligatorio'); return false; }
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) < 0) {
      Alert.alert('Error', 'El precio debe ser un número válido mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = {
      nombre: nombre.trim(),
      tipo: tipo.trim(),
      unidadMedida,
      proveedor: proveedor.trim(),
      precio: parseFloat(precio),
    };

    try {
      setLoading(true);
      if (isEditing) {
        await InsumoService.update(insumoEdit.id, data);
        Alert.alert('Éxito', 'Insumo actualizado correctamente');
      } else {
        await InsumoService.create(data);
        Alert.alert('Éxito', 'Insumo creado correctamente');
      }
      navigation.goBack(); // Vuelve a la lista
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Insumo' : 'Nuevo Insumo'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Nombre */}
        <Text style={styles.label}>NOMBRE *</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Café molido"
            placeholderTextColor={colors.textSecondary}
            value={nombre}
            onChangeText={setNombre}
            maxLength={20}
          />
        </View>
        <Text style={styles.hint}>{nombre.length}/20 caracteres</Text>

        {/* Tipo */}
        <Text style={styles.label}>TIPO *</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Bebida, Alimento, Limpieza"
            placeholderTextColor={colors.textSecondary}
            value={tipo}
            onChangeText={setTipo}
          />
        </View>

        {/* Unidad de medida — selector de opciones */}
        {/* Equivalente a un <select> en HTML */}
        <Text style={styles.label}>UNIDAD DE MEDIDA *</Text>
        <View style={styles.unidadRow}>
          {UNIDADES.map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.unidadButton, unidadMedida === u && styles.unidadButtonActive]}
              onPress={() => setUnidadMedida(u)}
            >
              <Text style={[styles.unidadText, unidadMedida === u && styles.unidadTextActive]}>
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Proveedor */}
        <Text style={styles.label}>PROVEEDOR *</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Distribuidora Norte"
            placeholderTextColor={colors.textSecondary}
            value={proveedor}
            onChangeText={setProveedor}
          />
        </View>

        {/* Precio */}
        <Text style={styles.label}>PRECIO (MXN) *</Text>
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
              {isEditing ? 'Guardar Cambios' : 'Crear Insumo'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
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
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  currencySymbol: {
    fontSize: 15,
    color: colors.textSecondary,
    marginRight: 8,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  unidadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unidadButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  unidadButtonActive: {
    backgroundColor: colors.primary,
  },
  unidadText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  unidadTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
