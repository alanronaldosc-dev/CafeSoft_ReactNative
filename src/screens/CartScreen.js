// CartScreen.js
// Catálogo de productos + carrito de compras.
// Usa useCart() para leer y modificar el carrito desde el Context,
// igual que session('cart') en Laravel pero reactivo.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import colors from '../theme/colors';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['Todos', 'Café Caliente', 'Cold Brew', 'Repostería'];

const PRODUCTS = [
  { id: '1', name: 'Espresso Clásico', price: 45, rating: 4.9, category: 'Café Caliente', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300' },
  { id: '2', name: 'Cappuccino Artesanal', price: 65, rating: 4.7, category: 'Café Caliente', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300' },
  { id: '3', name: 'Cold Brew 24h', price: 75, rating: 4.8, category: 'Cold Brew', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300' },
  { id: '4', name: 'Nitro Cold Brew', price: 85, rating: 4.6, category: 'Cold Brew', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300' },
  { id: '5', name: 'Croissant', price: 40, rating: 4.5, category: 'Repostería', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300' },
  { id: '6', name: 'Muffin de Arándanos', price: 50, rating: 4.4, category: 'Repostería', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300' },
];

// Impuesto del 16% (IVA México)
const IVA = 0.16;

export default function CartScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showCart, setShowCart] = useState(false);

  // Traemos todo lo necesario del Context
  const { cartItems, addToCart, removeFromCart, deleteFromCart, totalItems, totalPrice } = useCart();

  const filteredProducts = PRODUCTS.filter(p => {
    const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const iva = totalPrice * IVA;
  const total = totalPrice + iva;

  // Tarjeta de cada producto del catálogo
  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productRating}>⭐ {item.rating}</Text>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>${item.price} MXN</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Vista del carrito con resumen
  if (showCart) {
    return (
      <View style={styles.container}>
        {/* Header del carrito */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCart(false)}>
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Pedido</Text>
          <View style={styles.cartIconContainer}>
            <Text style={styles.cartIcon}>🛒</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.cartScroll}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartEmoji}>🛒</Text>
              <Text style={styles.emptyCartText}>Tu carrito está vacío</Text>
            </View>
          ) : (
            <>
              {/* Lista de productos en el carrito */}
              {cartItems.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                  </View>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>${item.price} MXN</Text>
                    {/* Controles de cantidad: — cantidad + */}
                    <View style={styles.quantityRow}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[styles.quantityButton, styles.quantityButtonDark]}
                        onPress={() => addToCart(item)}
                      >
                        <Text style={[styles.quantityButtonText, { color: colors.white }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.cartItemRight}>
                    <TouchableOpacity onPress={() => deleteFromCart(item.id)}>
                      <Text style={styles.deleteIcon}>🗑</Text>
                    </TouchableOpacity>
                    <Text style={styles.cartItemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Resumen de costos */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumen</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>${totalPrice.toFixed(2)} MXN</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>IVA (16%)</Text>
                  <Text style={styles.summaryValue}>${iva.toFixed(2)} MXN</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Envío</Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>Gratis</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${total.toFixed(2)} MXN</Text>
                </View>
              </View>

              {/* Botón de pago */}
              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutButtonText}>
                  Proceder al Pago → ${total.toFixed(2)} MXN
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // Vista del catálogo (por defecto)
  return (
    <View style={styles.container}>
      {/* Header con botón del carrito */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nuestro Catálogo</Text>
        <TouchableOpacity style={styles.cartIconContainer} onPress={() => setShowCart(true)}>
          <Text style={styles.cartIcon}>🛒</Text>
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Grilla de productos */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
      />
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
  headerTitle: {
    color: colors.textLight,
    fontSize: 22,
    fontWeight: 'bold',
  },
  backButton: {
    color: colors.textLight,
    fontSize: 16,
  },
  cartIconContainer: {
    position: 'relative',
    padding: 4,
  },
  cartIcon: {
    fontSize: 24,
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
  searchContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  categoriesScroll: {
    maxHeight: 56,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {},
  productImage: {
    width: '100%',
    height: 130,
  },
  productInfo: {
    padding: 10,
  },
  productRating: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  addButton: {
    width: 28,
    height: 28,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  // Estilos del carrito
  cartScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyCart: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyCartEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  cartItem: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cartItemImageContainer: {},
  cartItemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cartItemPrice: {
    fontSize: 13,
    color: colors.secondary,
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDark: {
    backgroundColor: colors.primary,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  cartItemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  cartItemTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
