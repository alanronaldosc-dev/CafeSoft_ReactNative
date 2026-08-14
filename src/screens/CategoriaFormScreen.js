// CategoriaFormScreen.js
// Crear y editar categorías

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Switch,
} from 'react-native';
import colors from '../theme/colors';
import CategoriaService from '../services/CategoriaService';

export default function CategoriaFormScreen({ route, navigation }) {
  const categoriaEdit = route.params?.categoria || null;
  const isEditing = categoriaEdit !== null;

  const [nombre, setNombre] = useState(categoriaEdit?.nombre || '');
  const [descripcion, setDescripcion] = useState(categoriaEdit?.descripcion || '');
  const [activo, setActivo] = useState(categoriaEdit?.activo !== undefined ? categoriaEdit.activo : true);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre es obligatorio'); return false; }
    if (nombre.length > 100) { Alert.alert('Error', 'El nombre no puede exceder 100 caracteres'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const data = { nombre: nombre.trim(), descripcion: descripcion.trim() || null, activo };
    try {
      setLoading(true);
      if (isEditing) {
        await CategoriaService.update(categoriaEdit.id, data);
        Alert.alert('Éxito', 'Categoría actualizada');
      } else {
        await CategoriaService.create(data);
        Alert.alert('Éxito', 'Categoría creada');
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
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>NOMBRE *</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Bebidas Calientes"
            placeholderTextColor={colors.textSecondary}
            value={nombre}
            onChangeText={setNombre}
            maxLength={100}
          />
        </View>
        <Text style={styles.hint}>{nombre.length}/100 caracteres</Text>

        <Text style={styles.label}>DESCRIPCIÓN</Text>
        <View style={[styles.input, { alignItems: 'flex-start', paddingVertical: 10 }]}>
          <TextInput
            style={[styles.textInput, { minHeight: 60, textAlignVertical: 'top' }]}
            placeholder="Descripción opcional de la categoría"
            placeholderTextColor={colors.textSecondary}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            maxLength={255}
          />
        </View>

        <Text style={styles.label}>ESTADO</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{activo ? 'Categoría activa' : 'Categoría inactiva'}</Text>
          <Switch
            value={activo}
            onValueChange={setActivo}
            trackColor={{ false: colors.surface, true: colors.secondary }}
            thumbColor={activo ? colors.white : colors.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
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
  hint: { fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  switchLabel: { fontSize: 15, color: colors.textPrimary },
  submitButton: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 28,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});
