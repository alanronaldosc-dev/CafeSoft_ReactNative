import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import colors from '../theme/colors';

export default function ActionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Acciones</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Gestión de Inventario</Text>

        {/* Insumos */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>🧂</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Insumos</Text>
              <Text style={styles.cardSub}>Catálogo de materias primas</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('InsumosList')}>
            <Text style={styles.cardButtonText}>Ver Lista de Insumos →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardButton, styles.cardButtonSecondary]} onPress={() => navigation.navigate('InsumoForm', { insumo: null })}>
            <Text style={[styles.cardButtonText, styles.cardButtonTextSecondary]}>+ Registrar Nuevo Insumo</Text>
          </TouchableOpacity>
        </View>

        {/* Inventario (Lotes) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>📦</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Inventario</Text>
              <Text style={styles.cardSub}>Registro de lotes de insumos</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('LotesList')}>
            <Text style={styles.cardButtonText}>Ver Lista de Inventario →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardButton, styles.cardButtonSecondary]} onPress={() => navigation.navigate('LoteForm')}>
            <Text style={[styles.cardButtonText, styles.cardButtonTextSecondary]}>+ Agregar Insumo a Inventario</Text>
          </TouchableOpacity>
        </View>

        {/* Productos */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>☕</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Productos</Text>
              <Text style={styles.cardSub}>Catálogo de productos del menú</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('ProductosList')}>
            <Text style={styles.cardButtonText}>Ver Lista de Productos →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardButton, styles.cardButtonSecondary]} onPress={() => navigation.navigate('ProductoForm', { producto: null })}>
            <Text style={[styles.cardButtonText, styles.cardButtonTextSecondary]}>+ Crear Nuevo Producto</Text>
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>🏷️</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Categorías</Text>
              <Text style={styles.cardSub}>Organiza los productos del menú</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('CategoriasList')}>
            <Text style={styles.cardButtonText}>Ver Lista de Categorías →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardButton, styles.cardButtonSecondary]} onPress={() => navigation.navigate('CategoriaForm', { categoria: null })}>
            <Text style={[styles.cardButtonText, styles.cardButtonTextSecondary]}>+ Nueva Categoría</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 55, paddingBottom: 16, paddingHorizontal: 20,
  },
  headerTitle: { color: colors.textLight, fontSize: 22, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: colors.textSecondary,
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1,
  },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardIconContainer: {
    width: 48, height: 48, backgroundColor: colors.surface,
    borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cardButton: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', marginBottom: 8,
  },
  cardButtonSecondary: { backgroundColor: colors.surface, marginBottom: 0 },
  cardButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  cardButtonTextSecondary: { color: colors.secondary },
});
