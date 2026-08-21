import React, { useState, useEffect } from 'react';
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
import ProveedorService from '../services/ProveedorService';

const UNIDADES = ['litros', 'kilogramos', 'piezas'];

export default function InsumoFormScreen({ route, navigation }) {
  const insumoEdit = route.params?.insumo || null;
  const isEditing = insumoEdit !== null;

  const [nombre, setNombre] = useState(insumoEdit?.nombre || '');
  const [tipo, setTipo] = useState(insumoEdit?.tipo || '');
  const [unidadMedida, setUnidadMedida] = useState(insumoEdit?.unidadMedida || 'litros');
  const [proveedorId, setProveedorId] = useState(
    insumoEdit?.proveedorId != null ? String(insumoEdit.proveedorId) : null
  );
  const [precio, setPrecio] = useState(insumoEdit?.precio?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ProveedorService.getActivos();
        setProveedores(data);
      } catch (e) {
        Alert.alert('Aviso', 'No se pudieron cargar los proveedores');
      } finally {
        setLoadingProveedores(false);
      }
    };
    load();
  }, []);

  const selectedProveedor = proveedores.find(
    (p) => String(p.id) === String(proveedorId)
  );

  const validate = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return false;
    }
    if (nombre.length > 100) {
      Alert.alert('Error', 'El nombre no puede exceder 100 caracteres');
      return false;
    }
    if (!tipo.trim()) {
      Alert.alert('Error', 'El tipo es obligatorio');
      return false;
    }
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) < 0) {
      Alert.alert('Error', 'El precio debe ser un número válido mayor o igual a 0');
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
      proveedorId: proveedorId ? parseInt(proveedorId, 10) : null,
      precio: parseFloat(precio),
    };

    try {
      setLoading(true);
      if (isEditing) {
        await InsumoService.update(insumoEdit.id, data);
        Alert.alert('Éxito', 'Insumo actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await InsumoService.create(data);
        Alert.alert('Éxito', 'Insumo creado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar el insumo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Insumo' : 'Nuevo Insumo'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>NOMBRE</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Café en grano"
            placeholderTextColor={colors.textSecondary}
            maxLength={100}
          />
        </View>

        <Text style={styles.label}>TIPO</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            value={tipo}
            onChangeText={setTipo}
            placeholder="Ej: Materia prima"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <Text style={styles.label}>UNIDAD DE MEDIDA</Text>
        <View style={styles.unidadRow}>
          {UNIDADES.map((u) => (
            <TouchableOpacity
              key={u}
              style={[
                styles.unidadButton,
                unidadMedida === u && styles.unidadButtonActive,
              ]}
              onPress={() => setUnidadMedida(u)}
            >
              <Text
                style={[
                  styles.unidadText,
                  unidadMedida === u && styles.unidadTextActive,
                ]}
              >
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>PROVEEDOR</Text>
        {loadingProveedores ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
        ) : (
          <>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text
                style={[
                  styles.textInput,
                  !selectedProveedor && { color: colors.textSecondary },
                ]}
              >
                {selectedProveedor
                  ? selectedProveedor.nombreEmpresa
                  : '-- Sin proveedor / seleccionar --'}
              </Text>
              <Text style={{ color: colors.textSecondary }}>▾</Text>
            </TouchableOpacity>
            {showDropdown && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setProveedorId(null);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>Sin proveedor</Text>
                </TouchableOpacity>
                {proveedores.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setProveedorId(String(p.id));
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{p.nombreEmpresa}</Text>
                    {p.insumoPrincipal ? (
                      <Text style={styles.dropdownSub}>{p.insumoPrincipal}</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <Text style={styles.label}>PRECIO UNITARIO</Text>
        <View style={styles.input}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.textInput}
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
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
              {isEditing ? 'Guardar Cambios' : 'Crear Insumo'}
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
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: { color: colors.textLight, fontSize: 24 },
  headerTitle: { color: colors.textLight, fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },
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
  textInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  currencySymbol: { fontSize: 15, color: colors.textSecondary, marginRight: 8 },
  unidadRow: { flexDirection: 'row', gap: 8 },
  unidadButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  unidadButtonActive: { backgroundColor: colors.primary },
  unidadText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  unidadTextActive: { color: colors.white, fontWeight: '700' },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownText: { fontSize: 15, color: colors.textPrimary },
  dropdownSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});