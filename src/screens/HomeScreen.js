import React, {
  useState,
  useCallback,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import {
  useFocusEffect,
} from '@react-navigation/native';

import colors from '../theme/colors';

import {
  useCart,
} from '../context/CartContext';

import {
  useAuth,
} from '../context/AuthContext';


import { BASE_URL } from '../config/api';


export default function HomeScreen({
  navigation,
}) {

  const {
    addToCart,
    totalItems,
  } = useCart();


  const {
    usuario,
  } = useAuth();


  // =========================================
  // ESTADOS
  // =========================================

  const [
    productos,
    setProductos,
  ] = useState([]);


  const [
    categorias,
    setCategorias,
  ] = useState([]);


  const [
    ventas,
    setVentas,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  // =========================================
  // ID DEL USUARIO
  // =========================================

  const usuarioId =
    usuario?.id ||
    usuario?.idUsuario;


  // =========================================
  // ROL
  // =========================================

  const obtenerRol =
    (userTipo) => {

      if (userTipo === 0) {
        return 'Administrador';
      }

      if (userTipo === 1) {
        return 'Empleado';
      }

      if (userTipo === 2) {
        return 'Cliente';
      }

      return 'Usuario';

    };


  const rol =
    obtenerRol(
      usuario?.userTipo
    );


  // =========================================
  // SALUDO SEGÚN HORA
  // =========================================

  const obtenerSaludo =
    () => {

      const hora =
        new Date().getHours();


      if (hora < 12) {
        return 'Buenos días ☀️';
      }


      if (hora < 19) {
        return 'Buenas tardes 🌤️';
      }


      return 'Buenas noches 🌙';

    };


  // =========================================
  // CARGAR DATOS REALES
  // =========================================

  const cargarDatos =
    async (
      mostrarCarga = true
    ) => {

      try {

        if (mostrarCarga) {
          setLoading(true);
        }


        // PRODUCTOS
        const productosRequest =
          fetch(
            `${BASE_URL}/productos`
          );


        // CATEGORÍAS
        const categoriasRequest =
          fetch(
            `${BASE_URL}/categorias/activas`
          );


        // VENTAS DEL USUARIO
        const ventasRequest =
          usuarioId

            ? fetch(
                `${BASE_URL}/ventas/usuario/${usuarioId}`
              )

            : Promise.resolve(
                null
              );


        const [
          productosResponse,
          categoriasResponse,
          ventasResponse,
        ] = await Promise.all([

          productosRequest,

          categoriasRequest,

          ventasRequest,

        ]);


        // =====================================
        // PRODUCTOS
        // =====================================

        if (
          productosResponse.ok
        ) {

          const productosData =
            await productosResponse.json();

          setProductos(
            Array.isArray(
              productosData
            )
              ? productosData
              : []
          );

        }


        // =====================================
        // CATEGORÍAS
        // =====================================

        if (
          categoriasResponse.ok
        ) {

          const categoriasData =
            await categoriasResponse.json();

          setCategorias(
            Array.isArray(
              categoriasData
            )
              ? categoriasData
              : []
          );

        }


        // =====================================
        // VENTAS DEL USUARIO
        // =====================================

        if (
          ventasResponse &&
          ventasResponse.ok
        ) {

          const ventasData =
            await ventasResponse.json();


          const ventasOrdenadas =
            Array.isArray(
              ventasData
            )

              ? [...ventasData].sort(
                  (a, b) => {

                    const fechaA =
                      new Date(
                        a.fecha ||
                        a.createdAt ||
                        0
                      );

                    const fechaB =
                      new Date(
                        b.fecha ||
                        b.createdAt ||
                        0
                      );


                    return (
                      fechaB -
                      fechaA
                    );

                  }
                )

              : [];


          setVentas(
            ventasOrdenadas
          );

        }


      } catch (error) {

        console.error(
          'ERROR HOME:',
          error
        );


      } finally {

        setLoading(false);

        setRefreshing(false);

      }

    };


  // =========================================
  // CARGAR AL ENTRAR
  // =========================================

  useFocusEffect(

    useCallback(() => {

      cargarDatos();

    }, [usuarioId])

  );


  // =========================================
  // REFRESH
  // =========================================

  const onRefresh =
    () => {

      setRefreshing(true);

      cargarDatos(false);

    };


  // =========================================
  // PRODUCTOS DESTACADOS
  // =========================================

  const productosDestacados =
    productos.slice(0, 3);


  // =========================================
  // ÚLTIMOS PEDIDOS
  // =========================================

  const pedidosRecientes =
    ventas.slice(0, 3);


  // =========================================
  // FORMATEAR FECHA
  // =========================================

  const formatearFecha =
    (fecha) => {

      if (!fecha) {
        return '';
      }


      try {

        return new Date(
          fecha
        ).toLocaleString(
          'es-MX'
        );

      } catch {

        return fecha;

      }

    };


  // =========================================
  // CARGANDO
  // =========================================

  if (loading) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator

          size="large"

          color={
            colors.secondary
          }

        />


        <Text
          style={
            styles.loadingText
          }
        >
          Cargando CafeSoft...
        </Text>

      </View>

    );

  }


  // =========================================
  // PANTALLA
  // =========================================

  return (

    <View
      style={
        styles.container
      }
    >


      {/* =====================================
          HEADER
      ===================================== */}

      <LinearGradient

        colors={[
          '#3D1A00',
          '#6B3A1F',
        ]}

        style={
          styles.header
        }

        start={{
          x: 0,
          y: 0,
        }}

        end={{
          x: 1,
          y: 1,
        }}

      >

        <View
          style={[
            styles.headerCircle,
            styles.headerCircle1,
          ]}
        />


        <View
          style={[
            styles.headerCircle,
            styles.headerCircle2,
          ]}
        />


        <View
          style={
            styles.headerContent
          }
        >

          <View
            style={{
              flex: 1,
            }}
          >

            <Text
              style={
                styles.headerGreeting
              }
            >
              {obtenerSaludo()}
            </Text>


            <Text
              style={
                styles.headerTitle
              }
            >

              {
                usuario?.nombre ||
                'Usuario'
              }

            </Text>


            <Text
              style={
                styles.headerRole
              }
            >
              {rol}
            </Text>

          </View>


          <TouchableOpacity

            style={
              styles.cartBadgeContainer
            }

            onPress={() =>
              navigation.navigate(
                'Cart'
              )
            }

          >

            <View
              style={
                styles.cartButton
              }
            >

              <Text
                style={
                  styles.cartIcon
                }
              >
                🛒
              </Text>

            </View>


            {
              totalItems > 0 && (

                <View
                  style={
                    styles.badge
                  }
                >

                  <Text
                    style={
                      styles.badgeText
                    }
                  >
                    {totalItems}
                  </Text>

                </View>

              )
            }

          </TouchableOpacity>

        </View>

      </LinearGradient>


      <ScrollView

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.scroll
        }

        refreshControl={

          <RefreshControl

            refreshing={
              refreshing
            }

            onRefresh={
              onRefresh
            }

            colors={[
              colors.secondary,
            ]}

          />

        }

      >


        {/* =====================================
            BANNER
        ===================================== */}

        <LinearGradient

          colors={[
            colors.primary,
            colors.secondary,
          ]}

          style={
            styles.banner
          }

          start={{
            x: 0,
            y: 0,
          }}

          end={{
            x: 1,
            y: 0,
          }}

        >

          <View
            style={
              styles.bannerCircle
            }
          />


          <Text
            style={
              styles.bannerEmoji
            }
          >
            ☕
          </Text>


          <View
            style={
              styles.bannerText
            }
          >

            <Text
              style={
                styles.bannerTitle
              }
            >
              Bienvenido a CafeSoft
            </Text>


            <Text
              style={
                styles.bannerSub
              }
            >
              {
                usuario?.email ||
                'Selecciona tus productos favoritos'
              }
            </Text>

          </View>

        </LinearGradient>


        {/* =====================================
            ESTADÍSTICAS REALES
        ===================================== */}

        <View
          style={
            styles.statsRow
          }
        >


          <View
            style={
              styles.statCard
            }
          >

            <Text
              style={
                styles.statNumber
              }
            >
              {productos.length}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Productos
            </Text>

          </View>


          <View
            style={
              styles.statCard
            }
          >

            <Text
              style={
                styles.statNumber
              }
            >
              {categorias.length}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Categorías
            </Text>

          </View>


          <View
            style={
              styles.statCard
            }
          >

            <Text
              style={
                styles.statNumber
              }
            >
              {ventas.length}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Mis compras
            </Text>

          </View>

        </View>


        {/* =====================================
            PRODUCTOS REALES
        ===================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Productos
          </Text>


          <View
            style={
              styles.sectionDot
            }
          />

        </View>


        {
          productosDestacados.length === 0

            ? (

              <View
                style={
                  styles.emptyCard
                }
              >

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  No hay productos registrados
                </Text>

              </View>

            )

            : (

              productosDestacados.map(
                (product) => (

                  <View

                    key={
                      product.id
                    }

                    style={
                      styles.featuredCard
                    }

                  >


                    {/* IMAGEN */}

                    {
                      product.imagen

                        ? (

                          <Image

                            source={{

                              uri:
                                `data:image/jpeg;base64,${product.imagen}`,

                            }}

                            style={
                              styles.productImage
                            }

                          />

                        )

                        : (

                          <LinearGradient

                            colors={[
                              'rgba(61,26,0,0.08)',
                              'rgba(61,26,0,0.02)',
                            ]}

                            style={
                              styles.featuredEmojiContainer
                            }

                          >

                            <Text
                              style={
                                styles.featuredEmoji
                              }
                            >
                              ☕
                            </Text>

                          </LinearGradient>

                        )
                    }


                    <View
                      style={
                        styles.featuredInfo
                      }
                    >

                      <Text
                        style={
                          styles.featuredName
                        }
                      >
                        {product.nombre}
                      </Text>


                      <Text
                        style={
                          styles.featuredPrice
                        }
                      >

                        $
                        {Number(
                          product.precio ||
                          0
                        ).toFixed(2)}
                        {' '}MXN

                      </Text>


                      {
                        product.descripcion && (

                          <Text

                            style={
                              styles.productDescription
                            }

                            numberOfLines={
                              1
                            }

                          >
                            {
                              product.descripcion
                            }
                          </Text>

                        )
                      }

                    </View>


                    <TouchableOpacity

                      onPress={() =>
                        addToCart({

                          ...product,

                          price:
                            Number(
                              product.precio ||
                              0
                            ),

                        })
                      }

                      style={
                        styles.addButtonWrapper
                      }

                    >

                      <LinearGradient

                        colors={[
                          colors.secondary,
                          colors.primary,
                        ]}

                        style={
                          styles.addButton
                        }

                        start={{
                          x: 0,
                          y: 0,
                        }}

                        end={{
                          x: 1,
                          y: 1,
                        }}

                      >

                        <Text
                          style={
                            styles.addButtonText
                          }
                        >
                          +
                        </Text>

                      </LinearGradient>

                    </TouchableOpacity>

                  </View>

                )
              )

            )
        }


        {/* VER CATÁLOGO */}

        {
          productos.length > 3 && (

            <TouchableOpacity

              style={
                styles.catalogButton
              }

              onPress={() =>
                navigation.navigate(
                  'Cart'
                )
              }

            >

              <Text
                style={
                  styles.catalogButtonText
                }
              >
                Ver catálogo completo →
              </Text>

            </TouchableOpacity>

          )
        }


        {/* =====================================
            PEDIDOS REALES
        ===================================== */}

        <View
          style={[
            styles.sectionHeader,

            {
              marginTop: 24,
            },
          ]}
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Mis pedidos recientes
          </Text>


          <View
            style={
              styles.sectionDot
            }
          />

        </View>


        {
          pedidosRecientes.length === 0

            ? (

              <View
                style={
                  styles.emptyCard
                }
              >

                <Text
                  style={{
                    fontSize: 30,
                  }}
                >
                  🛒
                </Text>


                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Aún no tienes compras
                </Text>

              </View>

            )

            : (

              pedidosRecientes.map(
                (pedido) => (

                  <View

                    key={
                      pedido.id
                    }

                    style={
                      styles.orderCard
                    }

                  >


                    <View
                      style={
                        styles.orderTop
                      }
                    >

                      <View>

                        <Text
                          style={
                            styles.orderFolio
                          }
                        >
                          {
                            pedido.folio ||
                            `Pedido #${pedido.id}`
                          }
                        </Text>


                        <Text
                          style={
                            styles.orderDate
                          }
                        >
                          {
                            formatearFecha(
                              pedido.fecha
                            )
                          }
                        </Text>

                      </View>


                      <View
                        style={[

                          styles.statusBadge,

                          pedido.estadoPedido ===
                            'PENDIENTE'

                            ? styles.statusPending

                            : styles.statusDelivered,

                        ]}
                      >

                        <Text
                          style={
                            styles.statusText
                          }
                        >

                          {
                            pedido.estadoPedido ===
                            'PENDIENTE'

                              ? '⏳ PENDIENTE'

                              : '✅ ENTREGADA'
                          }

                        </Text>

                      </View>

                    </View>


                    <View
                      style={
                        styles.orderBottom
                      }
                    >

                      <Text
                        style={
                          styles.orderClient
                        }
                      >

                        👤 {
                          pedido.nombreCliente ||
                          usuario?.nombre ||
                          'Cliente'
                        }

                      </Text>


                      <Text
                        style={
                          styles.orderTotal
                        }
                      >

                        $
                        {Number(
                          pedido.total ||
                          0
                        ).toFixed(2)}
                        {' '}MXN

                      </Text>

                    </View>

                  </View>

                )
              )

            )
        }


        {/* =====================================
            DATOS REALES DE LA CUENTA
        ===================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Mi cuenta
          </Text>


          <View
            style={
              styles.sectionDot
            }
          />

        </View>


        <LinearGradient

          colors={[
            colors.surface,
            colors.background,
          ]}

          style={
            styles.infoCard
          }

        >

          <Text
            style={
              styles.infoTitle
            }
          >
            👤 {
              usuario?.nombre ||
              'Usuario'
            }
          </Text>


          <Text
            style={
              styles.infoText
            }
          >
            🪪 Rol: {rol}
          </Text>


          <Text
            style={
              styles.infoText
            }
          >
            ✉️ {
              usuario?.email ||
              'Sin correo'
            }
          </Text>


          <Text
            style={
              styles.infoText
            }
          >
            📞 {
              usuario?.telefono ||
              'Sin teléfono'
            }
          </Text>


          <Text
            style={
              styles.infoText
            }
          >
            📍 {
              usuario?.direccion ||
              'Sin dirección'
            }
          </Text>

        </LinearGradient>


      </ScrollView>

    </View>

  );

}


// =========================================
// ESTILOS
// =========================================

const styles =
  StyleSheet.create({


    container: {

      flex: 1,

      backgroundColor:
        colors.background,

    },


    loadingContainer: {

      flex: 1,

      backgroundColor:
        colors.background,

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    loadingText: {

      marginTop: 12,

      color:
        colors.textSecondary,

    },


    header: {

      paddingTop:
        55,

      paddingBottom:
        24,

      paddingHorizontal:
        20,

      overflow:
        'hidden',

      position:
        'relative',

    },


    headerCircle: {

      position:
        'absolute',

      borderRadius:
        999,

      opacity:
        0.1,

    },


    headerCircle1: {

      width:
        200,

      height:
        200,

      backgroundColor:
        colors.secondary,

      top:
        -60,

      right:
        -40,

    },


    headerCircle2: {

      width:
        120,

      height:
        120,

      backgroundColor:
        '#fff',

      top:
        20,

      left:
        -30,

    },


    headerContent: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

    },


    headerGreeting: {

      color:
        'rgba(255,255,255,0.75)',

      fontSize:
        13,

    },


    headerTitle: {

      color:
        colors.textLight,

      fontSize:
        25,

      fontWeight:
        'bold',

      marginTop:
        2,

    },


    headerRole: {

      color:
        'rgba(255,255,255,0.7)',

      fontSize:
        12,

      marginTop:
        3,

    },


    cartBadgeContainer: {

      position:
        'relative',

    },


    cartButton: {

      width:
        44,

      height:
        44,

      backgroundColor:
        'rgba(255,255,255,0.15)',

      borderRadius:
        22,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        'rgba(255,255,255,0.25)',

    },


    cartIcon: {

      fontSize:
        22,

    },


    badge: {

      position:
        'absolute',

      top:
        -4,

      right:
        -4,

      backgroundColor:
        colors.secondary,

      borderRadius:
        10,

      minWidth:
        20,

      height:
        20,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        2,

      borderColor:
        colors.background,

    },


    badgeText: {

      color:
        colors.white,

      fontSize:
        11,

      fontWeight:
        'bold',

    },


    scroll: {

      padding:
        20,

      paddingBottom:
        40,

    },


    banner: {

      borderRadius:
        24,

      padding:
        20,

      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom:
        20,

      gap:
        16,

      overflow:
        'hidden',

      position:
        'relative',

      shadowColor:
        colors.primary,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity:
        0.3,

      shadowRadius:
        12,

      elevation:
        6,

    },


    bannerCircle: {

      position:
        'absolute',

      width:
        150,

      height:
        150,

      borderRadius:
        75,

      backgroundColor:
        'rgba(255,255,255,0.06)',

      right:
        -30,

      top:
        -30,

    },


    bannerEmoji: {

      fontSize:
        50,

    },


    bannerText: {

      flex:
        1,

    },


    bannerTitle: {

      color:
        colors.textLight,

      fontSize:
        17,

      fontWeight:
        'bold',

      lineHeight:
        24,

      marginBottom:
        6,

    },


    bannerSub: {

      color:
        'rgba(255,255,255,0.75)',

      fontSize:
        12,

    },


    statsRow: {

      flexDirection:
        'row',

      gap:
        10,

      marginBottom:
        24,

    },


    statCard: {

      flex:
        1,

      backgroundColor:
        colors.white,

      borderRadius:
        16,

      padding:
        14,

      alignItems:
        'center',

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.06,

      shadowRadius:
        8,

      elevation:
        3,

    },


    statNumber: {

      fontSize:
        18,

      fontWeight:
        'bold',

      color:
        colors.primary,

    },


    statLabel: {

      fontSize:
        11,

      color:
        colors.textSecondary,

      marginTop:
        4,

      textAlign:
        'center',

    },


    sectionHeader: {

      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom:
        12,

      gap:
        8,

    },


    sectionTitle: {

      fontSize:
        18,

      fontWeight:
        'bold',

      color:
        colors.primary,

    },


    sectionDot: {

      flex:
        1,

      height:
        2,

      backgroundColor:
        colors.surface,

      borderRadius:
        2,

    },


    featuredCard: {

      backgroundColor:
        colors.white,

      borderRadius:
        18,

      padding:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom:
        10,

      gap:
        12,

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.07,

      shadowRadius:
        10,

      elevation:
        3,

    },


    productImage: {

      width:
        56,

      height:
        56,

      borderRadius:
        18,

    },


    featuredEmojiContainer: {

      width:
        56,

      height:
        56,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    featuredEmoji: {

      fontSize:
        30,

    },


    featuredInfo: {

      flex:
        1,

    },


    featuredName: {

      fontSize:
        15,

      fontWeight:
        '700',

      color:
        colors.textPrimary,

    },


    featuredPrice: {

      fontSize:
        14,

      color:
        colors.secondary,

      marginTop:
        2,

      fontWeight:
        '600',

    },


    productDescription: {

      fontSize:
        11,

      color:
        colors.textSecondary,

      marginTop:
        3,

    },


    addButtonWrapper: {

      borderRadius:
        14,

      shadowColor:
        colors.primary,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.3,

      shadowRadius:
        6,

      elevation:
        4,

    },


    addButton: {

      width:
        36,

      height:
        36,

      borderRadius:
        14,

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    addButtonText: {

      color:
        colors.white,

      fontSize:
        22,

      fontWeight:
        'bold',

      lineHeight:
        26,

    },


    catalogButton: {

      alignSelf:
        'flex-end',

      paddingVertical:
        7,

      paddingHorizontal:
        4,

    },


    catalogButtonText: {

      color:
        colors.secondary,

      fontSize:
        13,

      fontWeight:
        '700',

    },


    orderCard: {

      backgroundColor:
        colors.white,

      borderRadius:
        18,

      padding:
        15,

      marginBottom:
        10,

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.05,

      shadowRadius:
        8,

      elevation:
        2,

    },


    orderTop: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'flex-start',

    },


    orderFolio: {

      color:
        colors.primary,

      fontSize:
        15,

      fontWeight:
        'bold',

    },


    orderDate: {

      color:
        colors.textSecondary,

      fontSize:
        10,

      marginTop:
        3,

    },


    statusBadge: {

      paddingHorizontal:
        8,

      paddingVertical:
        5,

      borderRadius:
        12,

    },


    statusPending: {

      backgroundColor:
        '#FFF4E5',

    },


    statusDelivered: {

      backgroundColor:
        '#F0FDF4',

    },


    statusText: {

      fontSize:
        10,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

    },


    orderBottom: {

      borderTopWidth:
        1,

      borderTopColor:
        colors.surface,

      marginTop:
        10,

      paddingTop:
        10,

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

    },


    orderClient: {

      color:
        colors.textSecondary,

      fontSize:
        12,

      flex:
        1,

    },


    orderTotal: {

      color:
        colors.secondary,

      fontSize:
        15,

      fontWeight:
        'bold',

    },


    emptyCard: {

      backgroundColor:
        colors.white,

      borderRadius:
        18,

      padding:
        24,

      alignItems:
        'center',

      marginBottom:
        10,

    },


    emptyText: {

      color:
        colors.textSecondary,

      fontSize:
        13,

      marginTop:
        5,

      textAlign:
        'center',

    },


    infoCard: {

      borderRadius:
        20,

      padding:
        18,

      marginTop:
        8,

      gap:
        7,

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.05,

      shadowRadius:
        8,

      elevation:
        2,

    },


    infoTitle: {

      fontSize:
        16,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

      marginBottom:
        6,

    },


    infoText: {

      fontSize:
        13,

      color:
        colors.textSecondary,

    },

  });