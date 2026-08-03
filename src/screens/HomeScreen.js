/**
 * HomeScreen.js
 * Pantalla principal de la app que muestra información de bienvenida.
 * - Presenta saludos, métricas rápidas, productos destacados y novedades.
 * - Utiliza contexto de carrito para mostrar la cantidad de artículos.
 * - Incluye botones para agregar productos al carrito con addToCart().
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import colors from '../theme/colors';
import { useCart } from '../context/CartContext';

// Datos mock de productos destacados
const FEATURED = [
  { id: '1', name: 'Espresso Clásico', price: 2.50, emoji: '☕' },
  { id: '2', name: 'Cappuccino Artesanal', price: 3.80, emoji: '🍵' },
  { id: '3', name: 'Cold Brew 24h', price: 4.20, emoji: '🧊' },
];

// Novedades o anuncios de la cafetería
const NEWS = [
  { id: '1', title: 'Nueva carta de temporada', desc: 'Descubrí nuestros sabores de otoño', emoji: '🍂' },
  { id: '2', title: 'Programa de puntos', desc: 'Acumulá puntos con cada compra', emoji: '⭐' },
  { id: '3', title: 'Horario extendido', desc: 'Ahora abrimos hasta las 22hs', emoji: '🕙' },
];

export default function HomeScreen() {
  // Traemos el carrito del Context para mostrar el total de ítems
  const { addToCart, totalItems } = useCart();

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Buenos días ☀️</Text>
          <Text style={styles.headerTitle}>CafeSoft</Text>
        </View>
        {/* Badge del carrito — muestra cuántos ítems hay */}
        <View style={styles.cartBadgeContainer}>
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Banner de bienvenida */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>☕</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Tu café favorito,{'\n'}donde quieras</Text>
            <Text style={styles.bannerSub}>Pedí desde la app y retirá sin esperas</Text>
          </View>
        </View>

        {/* Estadísticas rápidas */}
        {/* Equivalente a las "cards de métricas" de un dashboard en Laravel */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>+500</Text>
            <Text style={styles.statLabel}>Clientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>15+</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.9⭐</Text>
            <Text style={styles.statLabel}>Valoración</Text>
          </View>
        </View>

        {/* Productos destacados */}
        <Text style={styles.sectionTitle}>Destacados del día</Text>
        {FEATURED.map(product => (
          <View key={product.id} style={styles.featuredCard}>
            <Text style={styles.featuredEmoji}>{product.emoji}</Text>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName}>{product.name}</Text>
              <Text style={styles.featuredPrice}>${product.price.toFixed(2)} MXN
</Text>
            </View>
            {/* Al tocar "+", agrega al carrito usando el Context */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(product)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Novedades */}
        <Text style={styles.sectionTitle}>Novedades</Text>
        {NEWS.map(item => (
          <View key={item.id} style={styles.newsCard}>
            <View style={styles.newsIconContainer}>
              <Text style={styles.newsEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.newsInfo}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        {/* Info de contacto */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Encontranos</Text>
          <Text style={styles.infoText}>Av. Principal 123, Centro</Text>
          <Text style={styles.infoText}>🕐 Lun–Vie: 7:00 – 22:00</Text>
          <Text style={styles.infoText}>🕐 Sáb–Dom: 8:00 – 22:00</Text>
          <Text style={styles.infoText}>📞 +34 600 000 000</Text>
        </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerGreeting: {
    color: colors.textLight,
    fontSize: 13,
    opacity: 0.8,
  },
  headerTitle: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: 'bold',
  },
  cartBadgeContainer: {
    position: 'relative',
    padding: 4,
  },
  cartIcon: {
    fontSize: 26,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  bannerEmoji: {
    fontSize: 48,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    marginBottom: 6,
  },
  bannerSub: {
    color: colors.textLight,
    fontSize: 13,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  featuredCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  featuredEmoji: {
    fontSize: 32,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  featuredPrice: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  newsCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  newsIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsEmoji: {
    fontSize: 22,
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  newsDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    gap: 6,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
