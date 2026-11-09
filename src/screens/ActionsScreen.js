import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../theme/colors';
import Reveal from '../components/ui/Reveal';
import { radius, shadow, spacing } from '../theme/metrics';

export default function ActionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>

      {/* ============================================
          ENCABEZADO
      ============================================ */}

      <LinearGradient
        colors={['#043A4C', '#07556B', '#008FB5']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerEyebrow}>CAFESOFT · OPERACIÓN</Text>
        <Text style={styles.headerTitle}>Acciones</Text>
        <Text style={styles.headerSub}>
          Gestiona inventario, catálogo y entregas desde un solo lugar.
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: spacing.huge + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Reveal index={0}>
          <View>
        <Text style={styles.sectionTitle}>
          Gestión de Inventario
        </Text>

        {/* ============================================
            INSUMOS
        ============================================ */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>🧂</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Insumos
              </Text>

              <Text style={styles.cardSub}>
                Catálogo de materias primas
              </Text>
            </View>

          </View>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('InsumosList')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardButtonText}>
              Ver Lista de Insumos →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardButton,
              styles.cardButtonSecondary,
            ]}
            onPress={() =>
              navigation.navigate('InsumoForm', {
                insumo: null,
              })
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.cardButtonText,
                styles.cardButtonTextSecondary,
              ]}
            >
              + Registrar Nuevo Insumo
            </Text>
          </TouchableOpacity>

        </View>

        {/* ============================================
            INVENTARIO / LOTES
        ============================================ */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>📦</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Inventario
              </Text>

              <Text style={styles.cardSub}>
                Registro de lotes de insumos
              </Text>
            </View>

          </View>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('LotesList')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardButtonText}>
              Ver Lista de Inventario →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardButton,
              styles.cardButtonSecondary,
            ]}
            onPress={() => navigation.navigate('LoteForm')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.cardButtonText,
                styles.cardButtonTextSecondary,
              ]}
            >
              + Agregar Insumo a Inventario
            </Text>
          </TouchableOpacity>

        </View>

        {/* ============================================
            PRODUCTOS
        ============================================ */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>☕</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Productos
              </Text>

              <Text style={styles.cardSub}>
                Catálogo de productos del menú
              </Text>
            </View>

          </View>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('ProductosList')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardButtonText}>
              Ver Lista de Productos →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardButton,
              styles.cardButtonSecondary,
            ]}
            onPress={() =>
              navigation.navigate('ProductoForm', {
                producto: null,
              })
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.cardButtonText,
                styles.cardButtonTextSecondary,
              ]}
            >
              + Crear Nuevo Producto
            </Text>
          </TouchableOpacity>

        </View>

        {/* ============================================
            CATEGORÍAS
        ============================================ */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>🏷️</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Categorías
              </Text>

              <Text style={styles.cardSub}>
                Organiza los productos del menú
              </Text>
            </View>

          </View>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate('CategoriasList')}
            activeOpacity={0.8}
          >
            <Text style={styles.cardButtonText}>
              Ver Lista de Categorías →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardButton,
              styles.cardButtonSecondary,
            ]}
            onPress={() =>
              navigation.navigate('CategoriaForm', {
                categoria: null,
              })
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.cardButtonText,
                styles.cardButtonTextSecondary,
              ]}
            >
              + Nueva Categoría
            </Text>
          </TouchableOpacity>

        </View>

        {/* ============================================
            HU-013 - PROVEEDORES
        ============================================ */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>🚚</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Proveedores
              </Text>

              <Text style={styles.cardSub}>
                Gestión y catálogo de proveedores
              </Text>
            </View>

          </View>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() =>
              navigation.navigate('ProveedoresList')
            }
            activeOpacity={0.8}
          >
            <Text style={styles.cardButtonText}>
              Ver Lista de Proveedores →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardButton,
              styles.cardButtonSecondary,
            ]}
            onPress={() =>
              navigation.navigate('ProveedorForm')
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.cardButtonText,
                styles.cardButtonTextSecondary,
              ]}
            >
              + Registrar Nuevo Proveedor
            </Text>
          </TouchableOpacity>

        </View>

        {/* ============================================
            HU-006 - CARGAS DEL REPARTIDOR
        ============================================ */}

        <View style={styles.card}>

          <View style={styles.cardHeader}>

            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>🚰</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Mis cargas
              </Text>

              <Text style={styles.cardSub}>
                Confirma los garrafones asignados
              </Text>
            </View>

          </View>

          <View style={styles.huInfo}>

            <Text style={styles.huInfoIcon}>
              📋
            </Text>

            <Text style={styles.huInfoText}>
              Revisa la cantidad de garrafones
              asignados antes de iniciar tu ruta.
            </Text>

          </View>

          <TouchableOpacity
            style={styles.cargaButton}
            onPress={() =>
              navigation.navigate('CargasRepartidor')
            }
            activeOpacity={0.8}
          >
            <Text style={styles.cargaButtonText}>
              🚚 Ver mis cargas →
            </Text>
          </TouchableOpacity>

        </View>

          </View>
        </Reveal>
      </ScrollView>
    </View>
  );
}

// ==================================================
// ESTILOS
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ================================================
  // HEADER
  // ================================================

  header: {
    backgroundColor: colors.primary,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  headerTitle: {
    color: colors.textLight,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 4,
  },

  // ================================================
  // SCROLL
  // ================================================

  scroll: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },

  // ================================================
  // SECCIÓN
  // ================================================

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ================================================
  // CARD
  // ================================================

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  cardIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardIcon: {
    fontSize: 24,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ================================================
  // BOTONES GENERALES
  // ================================================

  cardButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },

  cardButtonSecondary: {
    backgroundColor: colors.surface,
    marginBottom: 0,
  },

  cardButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  cardButtonTextSecondary: {
    color: colors.secondary,
  },

  // ================================================
  // HU-006
  // ================================================

  huInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  huInfoIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  huInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  cargaButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cargaButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

});