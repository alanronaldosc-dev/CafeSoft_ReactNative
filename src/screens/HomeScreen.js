import React from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { useCart } from '../context/CartContext';

const FEATURED = [
  { id: '1', name: 'Espresso Clásico', price: 45, emoji: '☕' },
  { id: '2', name: 'Cappuccino Artesanal', price: 65, emoji: '🍵' },
  { id: '3', name: 'Cold Brew 24h', price: 75, emoji: '🧊' },
];

const NEWS = [
  { id: '1', title: 'Nueva carta de temporada', desc: 'Descubrí nuestros sabores de otoño', emoji: '🍂' },
  { id: '2', title: 'Programa de puntos', desc: 'Acumulá puntos con cada compra', emoji: '⭐' },
  { id: '3', title: 'Horario extendido', desc: 'Ahora abrimos hasta las 22hs', emoji: '🕙' },
];

export default function HomeScreen() {
  const { addToCart, totalItems } = useCart();

  return (
    <View style={styles.container}>

      {/* Header con gradiente */}
      <LinearGradient
        colors={['#3D1A00', '#6B3A1F']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Círculos decorativos en el header */}
        <View style={[styles.headerCircle, styles.headerCircle1]} />
        <View style={[styles.headerCircle, styles.headerCircle2]} />

        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerGreeting}>Buenos días ☀️</Text>
            <Text style={styles.headerTitle}>CafeSoft</Text>
          </View>
          <View style={styles.cartBadgeContainer}>
            <View style={styles.cartButton}>
              <Text style={styles.cartIcon}>🛒</Text>
            </View>
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Banner principal */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.bannerCircle} />
          <Text style={styles.bannerEmoji}>☕</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Tu café favorito,{'\n'}donde quieras</Text>
            <Text style={styles.bannerSub}>Pedí desde la app y retirá sin esperas</Text>
          </View>
        </LinearGradient>
<TouchableOpacity
  onPress={() =>
    navigation.navigate('GestionEmpleados')
  }
>
  <Text>
    Gestionar empleados
  </Text>
</TouchableOpacity>

        {/* Estadísticas */}
        <View style={styles.statsRow}>
          {[
            { num: '+500', label: 'Clientes' },
            { num: '15+', label: 'Productos' },
            { num: '4.9⭐', label: 'Valoración' },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statNumber}>{stat.num}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Destacados */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destacados del día</Text>
          <View style={styles.sectionDot} />
        </View>

        {FEATURED.map(product => (
          <View key={product.id} style={styles.featuredCard}>
            <LinearGradient
              colors={['rgba(61,26,0,0.08)', 'rgba(61,26,0,0.02)']}
              style={styles.featuredEmojiContainer}
            >
              <Text style={styles.featuredEmoji}>{product.emoji}</Text>
            </LinearGradient>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName}>{product.name}</Text>
              <Text style={styles.featuredPrice}>${product.price} MXN</Text>
            </View>
            <TouchableOpacity
              onPress={() => addToCart({ ...product, price: product.price })}
              style={styles.addButtonWrapper}
            >
              <LinearGradient
                colors={[colors.secondary, colors.primary]}
                style={styles.addButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.addButtonText}>+</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))}

        {/* Novedades */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Novedades</Text>
          <View style={styles.sectionDot} />
        </View>

        {NEWS.map(item => (
          <View key={item.id} style={styles.newsCard}>
            <LinearGradient
              colors={[colors.secondary + '30', colors.primary + '10']}
              style={styles.newsIconContainer}
            >
              <Text style={styles.newsEmoji}>{item.emoji}</Text>
            </LinearGradient>
            <View style={styles.newsInfo}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.newsArrow}>›</Text>
          </View>
        ))}

        {/* Info de contacto */}
        <LinearGradient
          colors={[colors.surface, colors.background]}
          style={styles.infoCard}
        >
          <Text style={styles.infoTitle}>📍 Encontranos</Text>
          <Text style={styles.infoText}>Av. Principal 123, Centro</Text>
          <Text style={styles.infoText}>🕐 Lun–Vie: 7:00 – 22:00</Text>
          <Text style={styles.infoText}>🕐 Sáb–Dom: 8:00 – 22:00</Text>
          <Text style={styles.infoText}>📞 +52 000 000 0000</Text>
        </LinearGradient>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 55, paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  headerCircle: { position: 'absolute', borderRadius: 999, opacity: 0.1 },
  headerCircle1: { width: 200, height: 200, backgroundColor: colors.secondary, top: -60, right: -40 },
  headerCircle2: { width: 120, height: 120, backgroundColor: '#fff', top: 20, left: -30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerGreeting: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  headerTitle: { color: colors.textLight, fontSize: 26, fontWeight: 'bold', letterSpacing: 1 },
  cartBadgeContainer: { position: 'relative' },
  cartButton: {
    width: 44, height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  cartIcon: { fontSize: 22 },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: colors.secondary,
    borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },
  banner: {
    borderRadius: 24, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 20, gap: 16, overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  bannerCircle: {
    position: 'absolute', width: 150, height: 150,
    borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.06)',
    right: -30, top: -30,
  },
  bannerEmoji: { fontSize: 50 },
  bannerText: { flex: 1 },
  bannerTitle: { color: colors.textLight, fontSize: 17, fontWeight: 'bold', lineHeight: 24, marginBottom: 6 },
  bannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16,
    padding: 14, alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  sectionDot: { flex: 1, height: 2, backgroundColor: colors.surface, borderRadius: 2 },
  featuredCard: {
    backgroundColor: colors.white, borderRadius: 18,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', marginBottom: 10, gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  featuredEmojiContainer: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  featuredEmoji: { fontSize: 30 },
  featuredInfo: { flex: 1 },
  featuredName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  featuredPrice: { fontSize: 14, color: colors.secondary, marginTop: 2, fontWeight: '600' },
  addButtonWrapper: {
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  addButton: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: colors.white, fontSize: 22, fontWeight: 'bold', lineHeight: 26 },
  newsCard: {
    backgroundColor: colors.white, borderRadius: 18,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', marginBottom: 10, gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  newsIconContainer: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  newsEmoji: { fontSize: 24 },
  newsInfo: { flex: 1 },
  newsTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  newsDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  newsArrow: { fontSize: 24, color: colors.textSecondary },
  infoCard: {
    borderRadius: 20, padding: 18, marginTop: 8, gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  infoTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
  infoText: { fontSize: 14, color: colors.textSecondary },
});
