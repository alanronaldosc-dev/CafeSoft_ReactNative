/**
 * ReportsScreen.js
 * Pantalla de reportes para administrador que muestra ventas y productos.
 * - Permite filtrar el periodo entre mensual, trimestral y anual.
 * - Presenta totales, gráficos de barras y una tabla de productos top.
 * - Usa estado local para controlar el periodo seleccionado.
 *
 * @param {object} navigation Navegación de React Navigation.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

// Datos mock de ventas por mes
const salesData = [
  { month: 'Ene', ventas: 4200 },
  { month: 'Feb', ventas: 3800 },
  { month: 'Mar', ventas: 5100 },
  { month: 'Abr', ventas: 6300 },
  { month: 'May', ventas: 5800 },
  { month: 'Jun', ventas: 7200 },
];

// Datos mock de productos más vendidos
const topProducts = [
  { name: 'Camisa Premium', units: 245, revenue: 7350 },
  { name: 'Pantalón Casual', units: 189, revenue: 5670 },
  { name: 'Zapatos Deportivos', units: 132, revenue: 5280 },
  { name: 'Gorra Edición', units: 98, revenue: 1960 },
];

export default function ReportsScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('Mensual'); // 'Mensual', 'Trimestral', 'Anual'

  // Calcular totales
  const totalVentas = salesData.reduce((sum, item) => sum + item.ventas, 0);
  const promedioVentas = Math.round(totalVentas / salesData.length);
  const maxVenta = Math.max(...salesData.map(item => item.ventas));

  // Función para dibujar una barra simple (proporcional)
  const renderBar = (value, maxValue = 8000) => {
    const barWidth = (value / maxValue) * (width - 100);
    return (
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: barWidth }]} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con gradiente simulado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filtros de período */}
      <View style={styles.filterContainer}>
        {['Mensual', 'Trimestral', 'Anual'].map(period => (
          <TouchableOpacity
            key={period}
            style={[styles.filterButton, selectedPeriod === period && styles.filterActive]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.filterText, selectedPeriod === period && styles.filterTextActive]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tarjetas de resumen */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ventas Totales</Text>
          <Text style={styles.summaryValue}>${totalVentas.toLocaleString()}</Text>
          <Text style={styles.summaryChange}>↑ 12% vs anterior</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Promedio Mensual</Text>
          <Text style={styles.summaryValue}>${promedioVentas.toLocaleString()}</Text>
          <Text style={styles.summaryChange}>↑ 5% vs anterior</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Mejor Mes</Text>
          <Text style={styles.summaryValue}>${maxVenta.toLocaleString()}</Text>
          <Text style={styles.summaryChange}>{salesData.find(d => d.ventas === maxVenta)?.month}</Text>
        </View>
      </View>

      {/* Gráfico de barras simple */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Ventas por Mes</Text>
        {salesData.map(item => (
          <View key={item.month} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{item.month}</Text>
            {renderBar(item.ventas)}
            <Text style={styles.chartValue}>${item.ventas}</Text>
          </View>
        ))}
      </View>

      {/* Tabla de productos más vendidos */}
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Productos Más Vendidos</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.productNameCell]}>Producto</Text>
          <Text style={[styles.tableCell, styles.tableNumber]}>Unidades</Text>
          <Text style={[styles.tableCell, styles.tableNumber]}>Ingresos</Text>
        </View>
        {topProducts.map((product, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.productNameCell]}>{product.name}</Text>
            <Text style={[styles.tableCell, styles.tableNumber]}>{product.units}</Text>
            <Text style={[styles.tableCell, styles.tableNumber]}>${product.revenue}</Text>
          </View>
        ))}
      </View>

      {/* Botón para exportar (mock) */}
      <TouchableOpacity style={styles.exportButton}>
        <Text style={styles.exportText}>Exportar Reporte (PDF)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  summaryChange: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 6,
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.textPrimary,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  chartLabel: {
    width: 35,
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  chartValue: {
    width: 55,
    fontSize: 12,
    textAlign: 'right',
    color: '#333',
    fontWeight: '500',
  },
  tableContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.textPrimary,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  tableCell: {
    fontSize: 13,
    color: '#444',
  },
  productNameCell: {
    flex: 2,
  },
  tableNumber: {
    flex: 1,
    textAlign: 'right',
  },
  exportButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  exportText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});