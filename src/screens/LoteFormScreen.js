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
import LoteService from '../services/LoteService';
import InsumoService from '../services/InsumoService';
import ProveedorService from '../services/ProveedorService';

export default function LoteFormScreen({ navigation }) {
  const [insumos, setInsumos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loadingInsumos, setLoadingInsumos] = useState(true);
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);
  const [showProveedorDropdown, setShowProveedorDropdown] = useState(false);

  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [insumosData, proveedoresData] = await Promise.all([
          InsumoService.getAll(),
          ProveedorService.getActivos(),
        ]);
        setInsumos(Array.isArray(insumosData) ? insumosData : []);
        setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
      } catch (e) {
        Alert.alert('Error', 'No se pudieron cargar insumos o proveedores');
      } finally {
        setLoadingInsumos(false);
      }
    };
    load();
  }, []);

  const onSelectInsumo = (insumo) => {
    setSelectedInsumo(insumo);
    setShowInsumoDropdown(false);
    if (insumo.proveedorId) {
      const prov = proveedores.find((p) => p.id === insumo.proveedorId);
      if (prov) setSelectedProveedor(prov);
    }
  };

  const validate = () => {
    if (!selectedInsumo) {
      Alert.alert('Error', 'Seleccioná un insumo');
      return false;
    }
    if (!cantidad || isNaN(parseFloat(cantidad)) || parseFloat(cantidad) <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return false;
    }
    if (!fechaCaducidad) {
      Alert.alert('Error', 'La fecha de caducidad es obligatoria');
      return false;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaCaducidad)) {
      Alert.alert('Error', 'La fecha debe tener el formato AAAA-MM-DD');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = {
      insumoId: selectedInsumo.id,
      proveedorId: selectedProveedor ? selectedProveedor.id : null,
      cantidad: parseFloat(cantidad),
      fechaCaducidad,
      observaciones: observaciones.trim() || null,
    };

    try {
      setLoading(true);
      await LoteService.create(data);
      Alert.alert('Éxito', 'Lote registrado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo registrar el lote');
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
        <Text style={styles.headerTitle}>Registrar Lote</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>INSUMO</Text>
        {loadingInsumos ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setShowInsumoDropdown(!showInsumoDropdown);
                setShowProveedorDropdown(false);
              }}
            >
              <Text style={selectedInsumo ? styles.selectedText : styles.placeholderText}>
                {selectedInsumo
                  ? `${selectedInsumo.nombre} (${selectedInsumo.unidadMedida})`
                  : '-- Selecciona un insumo --'}
              </Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>
            {showInsumoDropdown && (
              <View style={styles.dropdown}>
                {insumos.map((i) => (
                  <TouchableOpacity
                    key={i.id}
                    style={styles.dropdownItem}
                    onPress={() => onSelectInsumo(i)}
                  >
                    <Text style={styles.dropdownItemText}>{i.nombre}</Text>
                    <Text style={styles.dropdownItemSub}>
                      {i.unidadMedida}
                      {i.proveedorNombre ? ` · ${i.proveedorNombre}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <Text style={styles.label}>PROVEEDOR DEL LOTE</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => {
            setShowProveedorDropdown(!showProveedorDropdown);
            setShowInsumoDropdown(false);
          }}
        >
          <Text style={selectedProveedor ? styles.selectedText : styles.placeholderText}>
            {selectedProveedor
              ? selectedProveedor.nombreEmpresa
              : '-- Usar proveedor del insumo / sin especificar --'}
          </Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>
        {showProveedorDropdown && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedProveedor(null);
                setShowProveedorDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Sin especificar</Text>
            </TouchableOpacity>
            {proveedores.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedProveedor(p);
                  setShowProveedorDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{p.nombreEmpresa}</Text>
                {p.insumoPrincipal ? (
                  <Text style={styles.dropdownItemSub}>{p.insumoPrincipal}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>CANTIDAD</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            placeholder="0.000"
            placeholderTextColor={colors.textSecondary}
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="decimal-pad"
          />
          {selectedInsumo && (
            <Text style={styles.unitLabel}>{selectedInsumo.unidadMedida}</Text>
          )}
        </View>

        <Text style={styles.label}>FECHA DE CADUCIDAD</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.textInput}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={fechaCaducidad}
            onChangeText={setFechaCaducidad}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <Text style={styles.calendarIcon}>📅</Text>
        </View>
        <Text style={styles.hint}>Formato: 2026-12-31</Text>

        <Text style={styles.label}>OBSERVACIONES (OPCIONAL)</Text>
        <View style={[styles.input, styles.textAreaContainer]}>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Ej: Lote en buen estado"
            placeholderTextColor={colors.textSecondary}
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={3}
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
            <Text style={styles.submitButtonText}>Registrar Lote</Text>
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
  placeholderText: { flex: 1, fontSize: 15, color: colors.textSecondary },
  selectedText: { flex: 1, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  dropdownArrow: { color: colors.textSecondary, fontSize: 16 },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 14,
    marginTop: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surface || '#e5e7eb',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  dropdownItemText: { fontSize: 15, color: colors.textPrimary },
  dropdownItemSub: { fontSize: 12, color: colors.textSecondary },
  unitLabel: { fontSize: 13, color: colors.textSecondary, marginLeft: 8 },
  calendarIcon: { fontSize: 18 },
  hint: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  textAreaContainer: { alignItems: 'flex-start', paddingVertical: 10 },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
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