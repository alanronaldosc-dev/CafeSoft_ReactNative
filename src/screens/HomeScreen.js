import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { useCart } from '../context/CartContext';
import { AnimatedPressable, Reveal, SectionHeader } from '../components/ui';
import { radius, shadow, spacing, typography } from '../theme/metrics';

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

const STATS = [
  { num: '+500', label: 'Clientes' },
  { num: '15+', label: 'Productos' },
  { num: '4.9★', label: 'Valoración' },
];

export default function HomeScreen({ navigation }) {
  const { addToCart, totalItems } = useCart();
  const insets = useSafeAreaInsets();

  const orbDrift = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(totalItems > 0 ? 1 : 0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbDrift, { toValue: 1, duration: 9000, useNativeDriver: true }),
        Animated.timing(orbDrift, { toValue: 0, duration: 9000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.spring(badgeScale, {
      toValue: totalItems > 0 ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [totalItems]);

  const orbStyle = {
    transform: [
      { translateY: orbDrift.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
      { translateX: orbDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
    ],
    opacity: orbDrift.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.17] }),
  };

  const badgeStyle = {
    transform: [{ scale: badgeScale }],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#043A4C', '#07556B', '#008FB5']}
        style={[styles.header, { paddingTop: insets.top + 18 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.orb, styles.orbLarge, orbStyle]} />
        <Animated.View style={[styles.orb, styles.orbSmall, orbStyle]} />

        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerGreeting}>Hola de nuevo</Text>
            <Text style={styles.headerTitle}>CafeSoft</Text>
            <Text style={styles.headerSub}>Tu agua y café, sin esperas</Text>
          </View>

          <AnimatedPressable
            onPress={() => navigation?.navigate('Cart')}
            accessibilityRole="button"
            accessibilityLabel={`Abrir carrito, ${totalItems} artículos`}
            style={styles.cartButton}
            contentStyle={styles.pressFill}
            scaleTo={0.92}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {totalItems > 0 && (
              <Animated.View style={[styles.badge, badgeStyle]}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </Animated.View>
            )}
          </AnimatedPressable>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: spacing.huge + insets.bottom },
        ]}
      >
        <Reveal index={0}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.banner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bannerCircle} />
            <View style={styles.bannerText}>
              <Text style={styles.bannerKicker}>ENTREGA DEL DÍA</Text>
              <Text style={styles.bannerTitle}>
                Tu pedido favorito,{'\n'}donde quieras
              </Text>
              <Text style={styles.bannerSub}>
                Pedí desde la app y retirá sin esperas
              </Text>
            </View>
            <Text style={styles.bannerEmoji}>💧</Text>
          </LinearGradient>
        </Reveal>

        <Reveal index={1}>
          <View style={styles.statsRow}>
            {STATS.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statNumber}>{stat.num}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Reveal>

        <Reveal index={2}>
          <SectionHeader title="Destacados del día" />
        </Reveal>

        {FEATURED.map((product, index) => (
          <Reveal key={product.id} index={3 + index}>
            <View style={styles.featuredCard}>
              <View style={styles.featuredEmojiContainer}>
                <Text style={styles.featuredEmoji}>{product.emoji}</Text>
              </View>

              <View style={styles.featuredInfo}>
                <Text style={styles.featuredName}>{product.name}</Text>
                <Text style={styles.featuredPrice}>
                  ${product.price} MXN
                </Text>
              </View>

              <AnimatedPressable
                onPress={() => addToCart({ ...product, price: product.price })}
                accessibilityRole="button"
                accessibilityLabel={`Agregar ${product.name} al carrito`}
                style={styles.addButtonWrapper}
                contentStyle={styles.pressFill}
                scaleTo={0.9}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.primary]}
                  style={styles.addButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </Reveal>
        ))}

        <Reveal index={6}>
          <SectionHeader title="Novedades" />
        </Reveal>

        {NEWS.map((item, index) => (
          <Reveal key={item.id} index={7 + index}>
            <View style={styles.newsCard}>
              <View style={styles.newsIconContainer}>
                <Text style={styles.newsEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.newsInfo}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.newsArrow}>›</Text>
            </View>
          </Reveal>
        ))}

        <Reveal index={10}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Encontranos</Text>
            <Text style={styles.infoText}>Av. Principal 123, Centro</Text>
            <Text style={styles.infoText}>Lun–Vie: 7:00 – 22:00</Text>
            <Text style={styles.infoText}>Sáb–Dom: 8:00 – 22:00</Text>
            <Text style={styles.infoText}>+52 000 000 0000</Text>
          </View>
        </Reveal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
  },
  orbLarge: { width: 220, height: 220, top: -80, right: -50 },
  orbSmall: { width: 120, height: 120, top: 40, left: -30 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  headerText: { flex: 1 },
  headerGreeting: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerTitle: {
    ...typography.display,
    color: colors.white,
    marginTop: 2,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    marginTop: 4,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: { fontSize: 21 },
  pressFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    minWidth: 21,
    height: 21,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#07556B',
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  scroll: { padding: spacing.xl, paddingTop: spacing.xxl },
  banner: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    ...shadow.raised,
  },
  bannerCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -40,
    top: -50,
  },
  bannerText: { flex: 1 },
  bannerKicker: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 25,
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12.5 },
  bannerEmoji: { fontSize: 46 },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '600',
  },

  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  featuredEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  featuredEmoji: { fontSize: 28 },
  featuredInfo: { flex: 1 },
  featuredName: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  featuredPrice: {
    fontSize: 13.5,
    color: colors.primary,
    marginTop: 3,
    fontWeight: '700',
  },
  addButtonWrapper: { borderRadius: radius.md },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 26,
  },

  newsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newsIconContainer: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  newsEmoji: { fontSize: 22 },
  newsInfo: { flex: 1 },
  newsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  newsDesc: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  newsArrow: { fontSize: 24, color: colors.textMuted },

  infoCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoText: { fontSize: 13.5, color: colors.textSecondary },
});
