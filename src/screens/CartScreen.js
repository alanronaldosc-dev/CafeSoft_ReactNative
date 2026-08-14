// CartScreen.js
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import colors from '../theme/colors';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import ProductoService from '../services/ProductoService';
import CategoriaService from '../services/CategoriaService';


const IVA = 0.16;

import { BASE_URL } from '../config/api';


export default function CartScreen() {

  // Usuario que inició sesión
  const { usuario } = useAuth();

  // Carrito
  const {
    cartItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    totalItems,
    totalPrice,
  } = useCart();


  // Vista actual
  const [view, setView] =
    useState('catalog');


  // Productos
  const [productos, setProductos] =
    useState([]);

  const [
    loadingProductos,
    setLoadingProductos,
  ] = useState(true);

  const [
    errorProductos,
    setErrorProductos,
  ] = useState(null);

  const [search, setSearch] =
    useState('');


  // Categorías
  const [
    categorias,
    setCategorias,
  ] = useState([]);

  const [
    categoriaActiva,
    setCategoriaActiva,
  ] = useState(null);


  // Pago
  const [
    metodoPago,
    setMetodoPago,
  ] = useState('efectivo');

  const [
    montoEfectivo,
    setMontoEfectivo,
  ] = useState('');

  const [
    nombreCliente,
    setNombreCliente,
  ] = useState('');

  const [
    loadingVenta,
    setLoadingVenta,
  ] = useState(false);

  const [ticket, setTicket] =
    useState(null);


  // =========================================
  // CARGAR PRODUCTOS
  // =========================================

  useFocusEffect(
    useCallback(() => {

      loadData();

    }, [])
  );


  const loadData = async () => {

    try {

      setLoadingProductos(true);

      setErrorProductos(null);


      const [
        productosData,
        categoriasData,
      ] = await Promise.all([

        ProductoService.getAll(),

        CategoriaService
          .getActivas()
          .catch(() => []),

      ]);


      setProductos(
        productosData
      );

      setCategorias(
        categoriasData
      );


    } catch {

      setErrorProductos(
        'No se pudo cargar el catálogo'
      );


    } finally {

      setLoadingProductos(false);

    }

  };


  // =========================================
  // FILTRAR PRODUCTOS
  // =========================================

  const productosFiltrados =
    productos.filter((p) => {

      const coincideBusqueda =
        p.nombre
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );


      const coincideCategoria =
        categoriaActiva === null ||
        p.categoriaId ===
          categoriaActiva;


      return (
        coincideBusqueda &&
        coincideCategoria
      );

    });


  // =========================================
  // TOTALES
  // =========================================

  const subtotal =
    totalPrice;

  const impuestos =
    subtotal * IVA;

  const total =
    subtotal + impuestos;


  const cambio =
    metodoPago === 'efectivo' &&
    parseFloat(montoEfectivo) > 0

      ? parseFloat(
          montoEfectivo
        ) - total

      : 0;


  // =========================================
  // CONFIRMAR VENTA
  // =========================================

  const handleConfirmarVenta =
    async () => {


      // Usuario
      if (!usuario) {

        Alert.alert(
          'Error',
          'No hay un usuario con sesión iniciada'
        );

        return;

      }


      // Nombre cliente
      if (
        !nombreCliente.trim()
      ) {

        Alert.alert(
          'Nombre requerido',
          'Escribe el nombre de la persona para el pedido'
        );

        return;

      }


      // Carrito vacío
      if (
        cartItems.length === 0
      ) {

        Alert.alert(
          'Error',
          'El carrito está vacío'
        );

        return;

      }


      // Validar efectivo
      if (
        metodoPago ===
        'efectivo'
      ) {

        if (
          !montoEfectivo ||
          parseFloat(
            montoEfectivo
          ) <= 0
        ) {

          Alert.alert(
            'Error',
            'Ingresa el monto recibido en efectivo'
          );

          return;

        }


        if (
          parseFloat(
            montoEfectivo
          ) < total
        ) {

          Alert.alert(
            'Error',
            `Monto insuficiente. Total: $${total.toFixed(
              2
            )} MXN`
          );

          return;

        }

      }


      // =====================================
      // DATOS QUE SE MANDAN A LA API
      // =====================================

      const ventaData = {

        usuarioId:
          usuario.id ||
          usuario.idUsuario,

        nombreCliente:
          nombreCliente.trim(),

        metodoPago,

        descuento: 0,


        detalles:
          cartItems.map(
            (item) => ({

              productoId:
                item.id,

              cantidad:
                item.quantity,

              precioUnitario:
                item.precio ??
                item.price,

            })
          ),


        ...(
          metodoPago ===
          'efectivo' && {

            montoEfectivo:
              parseFloat(
                montoEfectivo
              ),

          }
        ),

      };


      console.log(
        'VENTA ENVIADA:',
        ventaData
      );


      try {

        setLoadingVenta(true);


        const response =
          await fetch(
            `${BASE_URL}/ventas`,
            {

              method: 'POST',

              headers: {

                'Content-Type':
                  'application/json',

                Accept:
                  'application/json',

              },

              body:
                JSON.stringify(
                  ventaData
                ),

            }
          );


        if (
          !response.ok
        ) {

          const err =
            await response.text();


          throw new Error(

            err ||
            'Error al procesar la venta'

          );

        }


        const data =
          await response.json();


        console.log(
          'VENTA CREADA:',
          data
        );


        setTicket(data);

        setView(
          'ticket'
        );


      } catch (e) {

        console.error(
          'ERROR VENTA:',
          e
        );


        Alert.alert(

          'Error',

          e.message ||
          'No se pudo procesar la venta'

        );


      } finally {

        setLoadingVenta(
          false
        );

      }

    };


  // =========================================
  // NUEVA VENTA
  // =========================================

  const handleNuevaVenta =
    () => {


      cartItems.forEach(
        (item) =>
          deleteFromCart(
            item.id
          )
      );


      setMetodoPago(
        'efectivo'
      );

      setMontoEfectivo(
        ''
      );

      setNombreCliente(
        ''
      );

      setTicket(
        null
      );

      setView(
        'catalog'
      );

    };


  // =========================================
  // VISTA TICKET
  // =========================================

  if (
    view === 'ticket' &&
    ticket
  ) {

    return (

      <View
        style={
          styles.container
        }
      >


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


          <Text
            style={
              styles.headerTitle
            }
          >
            Ticket de Venta
          </Text>


          <View
            style={{
              width: 24,
            }}
          />

        </LinearGradient>


        <ScrollView

          contentContainerStyle={
            styles.scroll
          }

        >


          <View
            style={
              styles.ticketCard
            }
          >


            <Text
              style={
                styles.ticketLogo
              }
            >
              ☕ CafeSoft
            </Text>


            <Text
              style={
                styles.ticketFolio
              }
            >
              Folio: {ticket.folio}
            </Text>


            <Text
              style={
                styles.ticketFecha
              }
            >
              👤 Pedido para:{' '}
              {
                ticket.nombreCliente ||
                nombreCliente
              }
            </Text>


            <Text
              style={
                styles.ticketFecha
              }
            >
              ⏳ Estado:{' '}
              {
                ticket.estadoPedido ||
                'PENDIENTE'
              }
            </Text>


            <Text
              style={
                styles.ticketFecha
              }
            >

              {
                ticket.fecha
                  ? new Date(
                      ticket.fecha
                    ).toLocaleString(
                      'es-MX'
                    )
                  : ''
              }

            </Text>


            <View
              style={
                styles.ticketDivider
              }
            />


            {
              ticket.detalles?.map(
                (d, i) => (

                  <View

                    key={i}

                    style={
                      styles.ticketRow
                    }

                  >

                    <Text
                      style={
                        styles.ticketItem
                      }
                    >
                      {d.cantidad}x{' '}
                      {d.productoNombre}
                    </Text>


                    <Text
                      style={
                        styles.ticketItemPrice
                      }
                    >
                      $
                      {(
                        d.subtotal ||
                        0
                      ).toFixed(2)}
                    </Text>

                  </View>

                )
              )
            }


            <View
              style={
                styles.ticketDivider
              }
            />


            <View
              style={
                styles.ticketRow
              }
            >

              <Text
                style={
                  styles.ticketLabel
                }
              >
                Subtotal
              </Text>


              <Text
                style={
                  styles.ticketValue
                }
              >
                $
                {(
                  ticket.subtotal ||
                  0
                ).toFixed(2)}
                {' '}MXN
              </Text>

            </View>


            <View
              style={
                styles.ticketRow
              }
            >

              <Text
                style={
                  styles.ticketLabel
                }
              >
                IVA (16%)
              </Text>


              <Text
                style={
                  styles.ticketValue
                }
              >
                $
                {(
                  ticket.impuestos ||
                  0
                ).toFixed(2)}
                {' '}MXN
              </Text>

            </View>


            <View

              style={[
                styles.ticketRow,
                styles.ticketTotalRow,
              ]}

            >

              <Text
                style={
                  styles.ticketTotalLabel
                }
              >
                TOTAL
              </Text>


              <Text
                style={
                  styles.ticketTotalValue
                }
              >
                $
                {(
                  ticket.total ||
                  0
                ).toFixed(2)}
                {' '}MXN
              </Text>

            </View>


            <View
              style={
                styles.ticketDivider
              }
            />


            <View
              style={
                styles.ticketRow
              }
            >

              <Text
                style={
                  styles.ticketLabel
                }
              >
                Método de pago
              </Text>


              <Text
                style={
                  styles.ticketValue
                }
              >

                {
                  ticket.metodoPago ===
                  'efectivo'

                    ? '💵 Efectivo'

                    : '💳 Tarjeta'
                }

              </Text>

            </View>


            {
              ticket.metodoPago ===
              'efectivo' && (

                <>

                  <View
                    style={
                      styles.ticketRow
                    }
                  >

                    <Text
                      style={
                        styles.ticketLabel
                      }
                    >
                      Recibido
                    </Text>


                    <Text
                      style={
                        styles.ticketValue
                      }
                    >
                      $
                      {(
                        ticket.montoEfectivo ||
                        0
                      ).toFixed(2)}
                      {' '}MXN
                    </Text>

                  </View>


                  <View
                    style={
                      styles.ticketRow
                    }
                  >

                    <Text
                      style={
                        styles.ticketLabel
                      }
                    >
                      Cambio
                    </Text>


                    <Text

                      style={[
                        styles.ticketValue,

                        {
                          color:
                            colors.success,
                        },

                      ]}

                    >
                      $
                      {(
                        ticket.cambio ||
                        0
                      ).toFixed(2)}
                      {' '}MXN
                    </Text>

                  </View>

                </>

              )
            }


            <View
              style={
                styles.ticketDivider
              }
            />


            <Text
              style={
                styles.ticketGracias
              }
            >
              ¡Gracias por tu compra!
            </Text>

          </View>


          <TouchableOpacity

            onPress={
              handleNuevaVenta
            }

            style={
              styles.buttonWrapper
            }

          >

            <LinearGradient

              colors={[
                colors.secondary,
                '#A0522D',
                colors.primary,
              ]}

              style={
                styles.nuevaVentaButton
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

              <Text
                style={
                  styles.nuevaVentaButtonText
                }
              >
                Nueva Venta
              </Text>

            </LinearGradient>

          </TouchableOpacity>

        </ScrollView>

      </View>

    );

  }


  // =========================================
  // VISTA CARRITO
  // =========================================

  if (
    view === 'cart'
  ) {

    return (

      <View
        style={
          styles.container
        }
      >


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


          <TouchableOpacity

            onPress={() =>
              setView(
                'catalog'
              )
            }

          >

            <Text
              style={
                styles.backButton
              }
            >
              ←
            </Text>

          </TouchableOpacity>


          <Text
            style={
              styles.headerTitle
            }
          >
            Mi Pedido
          </Text>


          <View
            style={
              styles.cartIconContainer
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

        </LinearGradient>


        <ScrollView

          contentContainerStyle={
            styles.scroll
          }

        >


          {
            cartItems.length === 0

              ? (

                <View
                  style={
                    styles.centered
                  }
                >

                  <Text
                    style={
                      styles.emptyEmoji
                    }
                  >
                    🛒
                  </Text>


                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    Tu carrito está vacío
                  </Text>

                </View>

              )

              : (

                <>


                  {
                    cartItems.map(
                      (item) => (

                        <View

                          key={
                            item.id
                          }

                          style={
                            styles.cartItem
                          }

                        >


                          {
                            item.imagen

                              ? (

                                <Image

                                  source={{

                                    uri:
                                      `data:image/jpeg;base64,${item.imagen}`,

                                  }}

                                  style={
                                    styles.cartItemImage
                                  }

                                />

                              )

                              : (

                                <View
                                  style={
                                    styles.cartItemImagePlaceholder
                                  }
                                >

                                  <Text
                                    style={{
                                      fontSize: 24,
                                    }}
                                  >
                                    ☕
                                  </Text>

                                </View>

                              )
                          }


                          <View
                            style={
                              styles.cartItemInfo
                            }
                          >

                            <Text
                              style={
                                styles.cartItemName
                              }
                            >
                              {item.nombre}
                            </Text>


                            <Text
                              style={
                                styles.cartItemPrice
                              }
                            >
                              ${item.precio} MXN
                            </Text>


                            <View
                              style={
                                styles.quantityRow
                              }
                            >


                              <TouchableOpacity

                                style={
                                  styles.quantityButton
                                }

                                onPress={() =>
                                  removeFromCart(
                                    item.id
                                  )
                                }

                              >

                                <Text
                                  style={
                                    styles.quantityButtonText
                                  }
                                >
                                  −
                                </Text>

                              </TouchableOpacity>


                              <Text
                                style={
                                  styles.quantityText
                                }
                              >
                                {
                                  item.quantity
                                }
                              </Text>


                              <TouchableOpacity

                                style={[
                                  styles.quantityButton,
                                  styles.quantityButtonDark,
                                ]}

                                onPress={() =>
                                  addToCart(
                                    item
                                  )
                                }

                              >

                                <Text

                                  style={[
                                    styles.quantityButtonText,

                                    {
                                      color:
                                        colors.white,
                                    },

                                  ]}

                                >
                                  +
                                </Text>

                              </TouchableOpacity>

                            </View>

                          </View>


                          <View
                            style={
                              styles.cartItemRight
                            }
                          >


                            <TouchableOpacity

                              onPress={() =>
                                deleteFromCart(
                                  item.id
                                )
                              }

                            >

                              <Text
                                style={
                                  styles.deleteIcon
                                }
                              >
                                🗑
                              </Text>

                            </TouchableOpacity>


                            <Text
                              style={
                                styles.cartItemTotal
                              }
                            >
                              $
                              {(
                                item.precio *
                                item.quantity
                              ).toFixed(2)}
                            </Text>

                          </View>

                        </View>

                      )
                    )
                  }


                  {/* RESUMEN */}

                  <View
                    style={
                      styles.summaryCard
                    }
                  >

                    <Text
                      style={
                        styles.summaryTitle
                      }
                    >
                      Resumen
                    </Text>


                    <View
                      style={
                        styles.summaryRow
                      }
                    >

                      <Text
                        style={
                          styles.summaryLabel
                        }
                      >
                        Subtotal
                      </Text>


                      <Text
                        style={
                          styles.summaryValue
                        }
                      >
                        $
                        {subtotal.toFixed(
                          2
                        )}
                        {' '}MXN
                      </Text>

                    </View>


                    <View
                      style={
                        styles.summaryRow
                      }
                    >

                      <Text
                        style={
                          styles.summaryLabel
                        }
                      >
                        IVA (16%)
                      </Text>


                      <Text
                        style={
                          styles.summaryValue
                        }
                      >
                        $
                        {impuestos.toFixed(
                          2
                        )}
                        {' '}MXN
                      </Text>

                    </View>


                    <View

                      style={[
                        styles.summaryRow,
                        styles.totalRow,
                      ]}

                    >

                      <Text
                        style={
                          styles.totalLabel
                        }
                      >
                        Total
                      </Text>


                      <Text
                        style={
                          styles.totalValue
                        }
                      >
                        $
                        {total.toFixed(
                          2
                        )}
                        {' '}MXN
                      </Text>

                    </View>

                  </View>


                  {/* DATOS DEL PEDIDO */}

                  <View
                    style={
                      styles.pagoCard
                    }
                  >

                    <Text
                      style={
                        styles.pagoTitle
                      }
                    >
                      👤 Datos del Pedido
                    </Text>


                    <Text
                      style={
                        styles.efectivoLabel
                      }
                    >
                      NOMBRE PARA EL PEDIDO
                    </Text>


                    <View
                      style={
                        styles.input
                      }
                    >

                      <Text
                        style={
                          styles.inputIcon
                        }
                      >
                        👤
                      </Text>


                      <TextInput

                        style={
                          styles.textInput
                        }

                        placeholder="Ej. Alan"

                        placeholderTextColor={
                          colors.textSecondary
                        }

                        value={
                          nombreCliente
                        }

                        onChangeText={
                          setNombreCliente
                        }

                        autoCapitalize="words"

                      />

                    </View>

                  </View>


                  {/* MÉTODO DE PAGO */}

                  <View
                    style={
                      styles.pagoCard
                    }
                  >

                    <Text
                      style={
                        styles.pagoTitle
                      }
                    >
                      Método de Pago
                    </Text>


                    <View
                      style={
                        styles.pagoOptions
                      }
                    >


                      <TouchableOpacity

                        style={[
                          styles.pagoOption,

                          metodoPago ===
                            'efectivo' &&
                            styles.pagoOptionActive,
                        ]}

                        onPress={() =>
                          setMetodoPago(
                            'efectivo'
                          )
                        }

                      >

                        <Text
                          style={
                            styles.pagoOptionIcon
                          }
                        >
                          💵
                        </Text>


                        <Text

                          style={[
                            styles.pagoOptionText,

                            metodoPago ===
                              'efectivo' &&
                              styles.pagoOptionTextActive,
                          ]}

                        >
                          Efectivo
                        </Text>

                      </TouchableOpacity>


                      <TouchableOpacity

                        style={[
                          styles.pagoOption,

                          metodoPago ===
                            'tarjeta' &&
                            styles.pagoOptionActive,
                        ]}

                        onPress={() =>
                          setMetodoPago(
                            'tarjeta'
                          )
                        }

                      >

                        <Text
                          style={
                            styles.pagoOptionIcon
                          }
                        >
                          💳
                        </Text>


                        <Text

                          style={[
                            styles.pagoOptionText,

                            metodoPago ===
                              'tarjeta' &&
                              styles.pagoOptionTextActive,
                          ]}

                        >
                          Tarjeta
                        </Text>

                      </TouchableOpacity>

                    </View>


                    {
                      metodoPago ===
                      'efectivo' && (

                        <View
                          style={
                            styles.efectivoSection
                          }
                        >

                          <Text
                            style={
                              styles.efectivoLabel
                            }
                          >
                            MONTO RECIBIDO
                          </Text>


                          <View
                            style={
                              styles.input
                            }
                          >

                            <Text
                              style={
                                styles.currencySymbol
                              }
                            >
                              $
                            </Text>


                            <TextInput

                              style={
                                styles.textInput
                              }

                              placeholder="0.00"

                              placeholderTextColor={
                                colors.textSecondary
                              }

                              value={
                                montoEfectivo
                              }

                              onChangeText={
                                setMontoEfectivo
                              }

                              keyboardType="decimal-pad"

                            />

                          </View>


                          {
                            parseFloat(
                              montoEfectivo
                            ) >= total && (

                              <View
                                style={
                                  styles.cambioRow
                                }
                              >

                                <Text
                                  style={
                                    styles.cambioLabel
                                  }
                                >
                                  Cambio a devolver:
                                </Text>


                                <Text
                                  style={
                                    styles.cambioValue
                                  }
                                >
                                  $
                                  {cambio.toFixed(
                                    2
                                  )}
                                  {' '}MXN
                                </Text>

                              </View>

                            )
                          }

                        </View>

                      )
                    }

                  </View>


                  {/* CONFIRMAR */}

                  <TouchableOpacity

                    onPress={
                      handleConfirmarVenta
                    }

                    disabled={
                      loadingVenta
                    }

                    style={[
                      styles.buttonWrapper,

                      loadingVenta && {
                        opacity: 0.6,
                      },
                    ]}

                  >

                    <LinearGradient

                      colors={[
                        colors.secondary,
                        '#A0522D',
                        colors.primary,
                      ]}

                      style={
                        styles.checkoutButton
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

                      {
                        loadingVenta

                          ? (

                            <ActivityIndicator
                              color={
                                colors.white
                              }
                            />

                          )

                          : (

                            <Text
                              style={
                                styles.checkoutButtonText
                              }
                            >
                              Confirmar Venta → $
                              {total.toFixed(
                                2
                              )}
                              {' '}MXN
                            </Text>

                          )
                      }

                    </LinearGradient>

                  </TouchableOpacity>

                </>

              )
          }

        </ScrollView>

      </View>

    );

  }


  // =========================================
  // VISTA CATÁLOGO
  // =========================================

  return (

    <View
      style={
        styles.container
      }
    >


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


        <Text
          style={
            styles.headerTitle
          }
        >
          Catálogo
        </Text>


        <TouchableOpacity

          style={
            styles.cartIconContainer
          }

          onPress={() =>
            setView(
              'cart'
            )
          }

        >

          <Text
            style={
              styles.cartIcon
            }
          >
            🛒
          </Text>


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

      </LinearGradient>


      {/* BUSCADOR */}

      <View
        style={
          styles.searchContainer
        }
      >

        <View
          style={
            styles.searchBox
          }
        >

          <Text
            style={
              styles.searchIcon
            }
          >
            🔍
          </Text>


          <TextInput

            style={
              styles.searchInput
            }

            placeholder="Buscar productos..."

            placeholderTextColor={
              colors.textSecondary
            }

            value={
              search
            }

            onChangeText={
              setSearch
            }

          />

        </View>


        {/* CATEGORÍAS */}

        {
          categorias.length > 0 && (

            <ScrollView

              horizontal

              showsHorizontalScrollIndicator={
                false
              }

              style={
                styles.categoriaScroll
              }

              contentContainerStyle={
                styles.categoriaScrollContent
              }

            >


              <TouchableOpacity

                style={[
                  styles.categoriaChip,

                  categoriaActiva ===
                    null &&
                    styles.categoriaChipActive,
                ]}

                onPress={() =>
                  setCategoriaActiva(
                    null
                  )
                }

              >

                <Text

                  style={[
                    styles.categoriaChipText,

                    categoriaActiva ===
                      null &&
                      styles.categoriaChipTextActive,
                  ]}

                >
                  🍽️ Todos
                </Text>

              </TouchableOpacity>


              {
                categorias.map(
                  (cat) => (

                    <TouchableOpacity

                      key={
                        cat.id
                      }

                      style={[
                        styles.categoriaChip,

                        categoriaActiva ===
                          cat.id &&
                          styles.categoriaChipActive,
                      ]}

                      onPress={() =>
                        setCategoriaActiva(
                          cat.id
                        )
                      }

                    >

                      <Text

                        style={[
                          styles.categoriaChipText,

                          categoriaActiva ===
                            cat.id &&
                            styles.categoriaChipTextActive,
                        ]}

                      >
                        🏷️ {cat.nombre}
                      </Text>

                    </TouchableOpacity>

                  )
                )
              }

            </ScrollView>

          )
        }

      </View>


      {
        loadingProductos

          ? (

            <View
              style={
                styles.centered
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
                Cargando catálogo...
              </Text>

            </View>

          )

          : errorProductos

            ? (

              <View
                style={
                  styles.centered
                }
              >

                <Text
                  style={
                    styles.errorEmoji
                  }
                >
                  ⚠️
                </Text>


                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errorProductos}
                </Text>


                <TouchableOpacity

                  style={
                    styles.retryButton
                  }

                  onPress={
                    loadData
                  }

                >

                  <Text
                    style={
                      styles.retryText
                    }
                  >
                    Reintentar
                  </Text>

                </TouchableOpacity>

              </View>

            )

            : (

              <FlatList

                data={
                  productosFiltrados
                }

                keyExtractor={
                  (item) =>
                    item.id.toString()
                }

                numColumns={
                  2
                }

                columnWrapperStyle={
                  styles.row
                }

                contentContainerStyle={
                  styles.productList
                }

                showsVerticalScrollIndicator={
                  false
                }


                ListEmptyComponent={

                  <View
                    style={
                      styles.centered
                    }
                  >

                    <Text
                      style={
                        styles.emptyText
                      }
                    >

                      {
                        categoriaActiva

                          ? 'No hay productos en esta categoría'

                          : 'No hay productos disponibles'
                      }

                    </Text>

                  </View>

                }


                renderItem={({
                  item,
                }) => (

                  <View
                    style={
                      styles.productCard
                    }
                  >


                    {
                      item.imagen

                        ? (

                          <Image

                            source={{

                              uri:
                                `data:image/jpeg;base64,${item.imagen}`,

                            }}

                            style={
                              styles.productImage
                            }

                          />

                        )

                        : (

                          <View
                            style={
                              styles.productImagePlaceholder
                            }
                          >

                            <Text
                              style={
                                styles.productImagePlaceholderText
                              }
                            >
                              ☕
                            </Text>

                          </View>

                        )
                    }


                    <View
                      style={
                        styles.productInfo
                      }
                    >

                      <Text

                        style={
                          styles.productName
                        }

                        numberOfLines={
                          2
                        }

                      >
                        {item.nombre}
                      </Text>


                      <View
                        style={
                          styles.productFooter
                        }
                      >

                        <Text
                          style={
                            styles.productPrice
                          }
                        >
                          ${item.precio} MXN
                        </Text>


                        <TouchableOpacity

                          style={
                            styles.addButton
                          }

                          onPress={() =>
                            addToCart({

                              ...item,

                              price:
                                item.precio,

                            })
                          }

                        >

                          <Text
                            style={
                              styles.addButtonText
                            }
                          >
                            +
                          </Text>

                        </TouchableOpacity>

                      </View>

                    </View>

                  </View>

                )}

              />

            )
      }

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


    header: {

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingTop:
        55,

      paddingBottom:
        16,

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


    headerTitle: {

      color:
        colors.textLight,

      fontSize:
        22,

      fontWeight:
        'bold',

    },


    backButton: {

      color:
        colors.textLight,

      fontSize:
        24,

    },


    cartIconContainer: {

      position:
        'relative',

      padding:
        4,

    },


    cartIcon: {

      fontSize:
        24,

    },


    badge: {

      position:
        'absolute',

      top:
        0,

      right:
        0,

      backgroundColor:
        colors.secondary,

      borderRadius:
        10,

      minWidth:
        18,

      height:
        18,

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


    searchContainer: {

      backgroundColor:
        colors.primary,

      paddingHorizontal:
        20,

      paddingBottom:
        12,

    },


    searchBox: {

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        'rgba(255,255,255,0.15)',

      borderRadius:
        16,

      paddingHorizontal:
        14,

      paddingVertical:
        10,

      borderWidth:
        1,

      borderColor:
        'rgba(255,255,255,0.2)',

      marginBottom:
        10,

    },


    searchIcon: {

      fontSize:
        16,

      marginRight:
        8,

    },


    searchInput: {

      flex:
        1,

      fontSize:
        15,

      color:
        colors.white,

    },


    categoriaScroll: {

      marginBottom:
        4,

    },


    categoriaScrollContent: {

      gap:
        8,

      paddingRight:
        4,

    },


    categoriaChip: {

      paddingHorizontal:
        14,

      paddingVertical:
        6,

      borderRadius:
        20,

      backgroundColor:
        'rgba(255,255,255,0.12)',

      borderWidth:
        1,

      borderColor:
        'rgba(255,255,255,0.2)',

    },


    categoriaChipActive: {

      backgroundColor:
        colors.secondary,

      borderColor:
        colors.secondary,

    },


    categoriaChipText: {

      fontSize:
        13,

      color:
        'rgba(255,255,255,0.75)',

      fontWeight:
        '500',

    },


    categoriaChipTextActive: {

      color:
        colors.white,

      fontWeight:
        '700',

    },


    productList: {

      padding:
        16,

      paddingBottom:
        20,

    },


    row: {

      justifyContent:
        'space-between',

      marginBottom:
        16,

    },


    productCard: {

      width:
        '48%',

      backgroundColor:
        colors.white,

      borderRadius:
        18,

      overflow:
        'hidden',

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.08,

      shadowRadius:
        10,

      elevation:
        3,

    },


    productImage: {

      width:
        '100%',

      height:
        120,

    },


    productImagePlaceholder: {

      width:
        '100%',

      height:
        120,

      backgroundColor:
        colors.surface,

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    productImagePlaceholderText: {

      fontSize:
        40,

    },


    productInfo: {

      padding:
        10,

    },


    productName: {

      fontSize:
        13,

      fontWeight:
        '600',

      color:
        colors.textPrimary,

      marginBottom:
        8,

    },


    productFooter: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

    },


    productPrice: {

      fontSize:
        12,

      fontWeight:
        'bold',

      color:
        colors.secondary,

    },


    addButton: {

      width:
        30,

      height:
        30,

      borderRadius:
        12,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        colors.primary,

    },


    addButtonText: {

      color:
        colors.white,

      fontSize:
        20,

      fontWeight:
        'bold',

      lineHeight:
        24,

    },


    scroll: {

      padding:
        20,

      paddingBottom:
        40,

    },


    cartItem: {

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
        12,

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


    cartItemImage: {

      width:
        64,

      height:
        64,

      borderRadius:
        12,

    },


    cartItemImagePlaceholder: {

      width:
        64,

      height:
        64,

      borderRadius:
        12,

      backgroundColor:
        colors.surface,

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    cartItemInfo: {

      flex:
        1,

    },


    cartItemName: {

      fontSize:
        15,

      fontWeight:
        '600',

      color:
        colors.textPrimary,

    },


    cartItemPrice: {

      fontSize:
        13,

      color:
        colors.secondary,

      marginTop:
        2,

    },


    quantityRow: {

      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop:
        8,

      gap:
        10,

    },


    quantityButton: {

      width:
        28,

      height:
        28,

      borderRadius:
        14,

      backgroundColor:
        colors.surface,

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    quantityButtonDark: {

      backgroundColor:
        colors.primary,

    },


    quantityButtonText: {

      fontSize:
        18,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

      lineHeight:
        22,

    },


    quantityText: {

      fontSize:
        15,

      fontWeight:
        '600',

      color:
        colors.textPrimary,

      minWidth:
        20,

      textAlign:
        'center',

    },


    cartItemRight: {

      alignItems:
        'flex-end',

      gap:
        8,

    },


    deleteIcon: {

      fontSize:
        20,

    },


    cartItemTotal: {

      fontSize:
        15,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

    },


    summaryCard: {

      backgroundColor:
        colors.white,

      borderRadius:
        18,

      padding:
        16,

      marginBottom:
        16,

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
        2,

    },


    summaryTitle: {

      fontSize:
        16,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

      marginBottom:
        12,

    },


    summaryRow: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      marginBottom:
        8,

    },


    summaryLabel: {

      fontSize:
        14,

      color:
        colors.textSecondary,

    },


    summaryValue: {

      fontSize:
        14,

      color:
        colors.textPrimary,

    },


    totalRow: {

      borderTopWidth:
        1,

      borderTopColor:
        colors.surface,

      paddingTop:
        10,

      marginTop:
        4,

    },


    totalLabel: {

      fontSize:
        16,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

    },


    totalValue: {

      fontSize:
        16,

      fontWeight:
        'bold',

      color:
        colors.secondary,

    },


    pagoCard: {

      backgroundColor:
        colors.white,

      borderRadius:
        18,

      padding:
        16,

      marginBottom:
        16,

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
        2,

    },


    pagoTitle: {

      fontSize:
        15,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

      marginBottom:
        12,

    },


    pagoOptions: {

      flexDirection:
        'row',

      gap:
        10,

      marginBottom:
        12,

    },


    pagoOption: {

      flex:
        1,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        8,

      paddingVertical:
        12,

      borderRadius:
        12,

      backgroundColor:
        colors.surface,

      borderWidth:
        2,

      borderColor:
        'transparent',

    },


    pagoOptionActive: {

      borderColor:
        colors.secondary,

      backgroundColor:
        colors.background,

    },


    pagoOptionIcon: {

      fontSize:
        20,

    },


    pagoOptionText: {

      fontSize:
        14,

      fontWeight:
        '600',

      color:
        colors.textSecondary,

    },


    pagoOptionTextActive: {

      color:
        colors.secondary,

    },


    efectivoSection: {

      gap:
        8,

    },


    efectivoLabel: {

      fontSize:
        11,

      fontWeight:
        '700',

      color:
        colors.textSecondary,

      letterSpacing:
        1,

    },


    input: {

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        colors.surface,

      borderRadius:
        12,

      paddingHorizontal:
        14,

      paddingVertical:
        12,

    },


    currencySymbol: {

      fontSize:
        15,

      color:
        colors.textSecondary,

      marginRight:
        8,

    },


    inputIcon: {

      fontSize:
        16,

      marginRight:
        10,

    },


    textInput: {

      flex:
        1,

      fontSize:
        15,

      color:
        colors.textPrimary,

    },


    cambioRow: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      backgroundColor:
        '#F0FDF4',

      borderRadius:
        10,

      padding:
        12,

    },


    cambioLabel: {

      fontSize:
        14,

      color:
        colors.textSecondary,

    },


    cambioValue: {

      fontSize:
        15,

      fontWeight:
        'bold',

      color:
        colors.success,

    },


    checkoutButton: {

      borderRadius:
        18,

      paddingVertical:
        17,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    checkoutButtonText: {

      color:
        colors.white,

      fontSize:
        16,

      fontWeight:
        'bold',

    },


    ticketCard: {

      backgroundColor:
        colors.white,

      borderRadius:
        20,

      padding:
        20,

      marginBottom:
        20,

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity:
        0.1,

      shadowRadius:
        12,

      elevation:
        5,

    },


    ticketLogo: {

      fontSize:
        22,

      fontWeight:
        'bold',

      color:
        colors.primary,

      textAlign:
        'center',

      marginBottom:
        4,

    },


    ticketFolio: {

      fontSize:
        16,

      fontWeight:
        '600',

      color:
        colors.textPrimary,

      textAlign:
        'center',

    },


    ticketFecha: {

      fontSize:
        12,

      color:
        colors.textSecondary,

      textAlign:
        'center',

      marginBottom:
        12,

    },


    ticketDivider: {

      borderTopWidth:
        1,

      borderTopColor:
        colors.surface,

      marginVertical:
        10,

      borderStyle:
        'dashed',

    },


    ticketRow: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      marginBottom:
        6,

    },


    ticketItem: {

      fontSize:
        14,

      color:
        colors.textPrimary,

      flex:
        1,

    },


    ticketItemPrice: {

      fontSize:
        14,

      color:
        colors.textPrimary,

      fontWeight:
        '500',

    },


    ticketLabel: {

      fontSize:
        14,

      color:
        colors.textSecondary,

    },


    ticketValue: {

      fontSize:
        14,

      color:
        colors.textPrimary,

    },


    ticketTotalRow: {

      marginTop:
        4,

    },


    ticketTotalLabel: {

      fontSize:
        16,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

    },


    ticketTotalValue: {

      fontSize:
        16,

      fontWeight:
        'bold',

      color:
        colors.secondary,

    },


    ticketGracias: {

      fontSize:
        14,

      color:
        colors.textSecondary,

      textAlign:
        'center',

      marginTop:
        8,

    },


    nuevaVentaButton: {

      borderRadius:
        18,

      paddingVertical:
        17,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    nuevaVentaButtonText: {

      color:
        colors.white,

      fontSize:
        16,

      fontWeight:
        'bold',

    },


    buttonWrapper: {

      borderRadius:
        18,

      shadowColor:
        colors.primary,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity:
        0.35,

      shadowRadius:
        12,

      elevation:
        8,

    },


    centered: {

      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      padding:
        40,

    },


    loadingText: {

      marginTop:
        12,

      color:
        colors.textSecondary,

    },


    errorEmoji: {

      fontSize:
        48,

      marginBottom:
        12,

    },


    errorText: {

      fontSize:
        15,

      color:
        colors.textSecondary,

      textAlign:
        'center',

      marginBottom:
        16,

    },


    retryButton: {

      backgroundColor:
        colors.primary,

      paddingHorizontal:
        24,

      paddingVertical:
        10,

      borderRadius:
        10,

    },


    retryText: {

      color:
        colors.white,

      fontWeight:
        '600',

    },


    emptyEmoji: {

      fontSize:
        60,

      marginBottom:
        16,

    },


    emptyText: {

      fontSize:
        15,

      color:
        colors.textSecondary,

    },

  });