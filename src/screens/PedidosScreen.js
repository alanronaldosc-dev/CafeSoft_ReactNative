import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import colors from '../theme/colors';


import { BASE_URL } from '../config/api';


export default function PedidosScreen() {

  const [
    pedidos,
    setPedidos,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    entregandoId,
    setEntregandoId,
  ] = useState(null);


  // =========================================
  // CARGAR PEDIDOS
  // =========================================

  const cargarPedidos =
    async (mostrarCarga = true) => {

      try {

        if (mostrarCarga) {
          setLoading(true);
        }


        const response =
          await fetch(
            `${BASE_URL}/ventas/pedidos/pendientes`
          );


        if (!response.ok) {

          const errorTexto =
            await response.text();

          throw new Error(
            errorTexto ||
            'No se pudieron cargar los pedidos'
          );

        }


        const data =
          await response.json();


        console.log(
          'PEDIDOS PENDIENTES:',
          data
        );


        setPedidos(
          Array.isArray(data)
            ? data
            : []
        );


      } catch (error) {

        console.error(
          'ERROR PEDIDOS:',
          error
        );


        Alert.alert(
          'Error',
          error.message ||
          'No se pudieron cargar los pedidos'
        );


      } finally {

        if (mostrarCarga) {
          setLoading(false);
        }

        setRefreshing(false);

      }

    };


  // =========================================
  // CUANDO ENTRA A LA PANTALLA
  // =========================================

  useFocusEffect(

    useCallback(() => {

      cargarPedidos();


      const intervalo =
        setInterval(() => {

          cargarPedidos(false);

        }, 5000);


      return () => {

        clearInterval(
          intervalo
        );

      };

    }, [])

  );


  // =========================================
  // ACTUALIZAR DESLIZANDO
  // =========================================

  const onRefresh = () => {

    setRefreshing(true);

    cargarPedidos(false);

  };


  // =========================================
  // MARCAR ENTREGADO
  // =========================================

  const marcarEntregado =
    async (pedido) => {

      Alert.alert(
        'Confirmar entrega',
        `¿Marcar el pedido ${pedido.folio} como entregado?`,
        [

          {
            text: 'Cancelar',
            style: 'cancel',
          },

          {
            text: 'Entregar',

            onPress:
              async () => {

                try {

                  setEntregandoId(
                    pedido.id
                  );


                  const response =
                    await fetch(
                      `${BASE_URL}/ventas/${pedido.id}/entregar`,
                      {
                        method:
                          'PUT',

                        headers: {
                          Accept:
                            'application/json',
                        },
                      }
                    );


                  if (
                    !response.ok
                  ) {

                    const errorTexto =
                      await response.text();

                    throw new Error(
                      errorTexto ||
                      'No se pudo entregar el pedido'
                    );

                  }


                  // Lo quitamos inmediatamente
                  // de la lista de pendientes

                  setPedidos(
                    (prev) =>
                      prev.filter(
                        (p) =>
                          p.id !==
                          pedido.id
                      )
                  );


                  Alert.alert(
                    'Pedido entregado',
                    `${pedido.folio} fue marcado como entregado`
                  );


                } catch (error) {

                  console.error(
                    'ERROR ENTREGAR:',
                    error
                  );


                  Alert.alert(
                    'Error',
                    error.message ||
                    'No se pudo marcar el pedido como entregado'
                  );


                } finally {

                  setEntregandoId(
                    null
                  );

                }

              },

          },

        ]
      );

    };


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

          <Text
            style={
              styles.headerTitle
            }
          >
            Pedidos
          </Text>

        </LinearGradient>


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
            Cargando pedidos...
          </Text>

        </View>

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
          style={
            styles.headerContent
          }
        >

          <Text
            style={
              styles.headerTitle
            }
          >
            🍽️ Pedidos
          </Text>


          <Text
            style={
              styles.headerSubtitle
            }
          >
            Pedidos pendientes
          </Text>

        </View>


        <View
          style={
            styles.counter
          }
        >

          <Text
            style={
              styles.counterText
            }
          >
            {pedidos.length}
          </Text>

        </View>

      </LinearGradient>


      <ScrollView

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


        {
          pedidos.length === 0

            ? (

              <View
                style={
                  styles.emptyContainer
                }
              >

                <Text
                  style={
                    styles.emptyEmoji
                  }
                >
                  ✅
                </Text>


                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No hay pedidos pendientes
                </Text>


                <Text
                  style={
                    styles.emptySubtitle
                  }
                >
                  Todos los pedidos han sido entregados
                </Text>

              </View>

            )

            : (

              pedidos.map(
                (pedido) => (

                  <View

                    key={
                      pedido.id
                    }

                    style={
                      styles.pedidoCard
                    }

                  >


                    {/* CABECERA */}

                    <View
                      style={
                        styles.pedidoHeader
                      }
                    >

                      <View>

                        <Text
                          style={
                            styles.folio
                          }
                        >
                          {pedido.folio}
                        </Text>


                        <Text
                          style={
                            styles.fecha
                          }
                        >
                          {formatearFecha(
                            pedido.fecha
                          )}
                        </Text>

                      </View>


                      <View
                        style={
                          styles.estadoBadge
                        }
                      >

                        <Text
                          style={
                            styles.estadoText
                          }
                        >
                          ⏳ PENDIENTE
                        </Text>

                      </View>

                    </View>


                    {/* CLIENTE */}

                    <View
                      style={
                        styles.section
                      }
                    >

                      <Text
                        style={
                          styles.sectionLabel
                        }
                      >
                        👤 CLIENTE
                      </Text>


                      <Text
                        style={
                          styles.clienteNombre
                        }
                      >
                        {pedido.nombreCliente ||
                          'Sin nombre'}
                      </Text>

                    </View>


                    {/* PRODUCTOS */}

                    <View
                      style={
                        styles.section
                      }
                    >

                      <Text
                        style={
                          styles.sectionLabel
                        }
                      >
                        ☕ PRODUCTOS
                      </Text>


                      {
                        pedido.detalles?.map(
                          (
                            detalle,
                            index
                          ) => (

                            <View

                              key={
                                detalle.id ||
                                index
                              }

                              style={
                                styles.productoRow
                              }

                            >

                              <View
                                style={
                                  styles.productoInfo
                                }
                              >

                                <Text
                                  style={
                                    styles.productoNombre
                                  }
                                >
                                  {detalle.cantidad}x{' '}
                                  {
                                    detalle.productoNombre
                                  }
                                </Text>


                                <Text
                                  style={
                                    styles.productoPrecioUnitario
                                  }
                                >
                                  $
                                  {Number(
                                    detalle.precioUnitario ||
                                    0
                                  ).toFixed(2)}
                                  {' '}c/u
                                </Text>

                              </View>


                              <Text
                                style={
                                  styles.productoSubtotal
                                }
                              >
                                $
                                {Number(
                                  detalle.subtotal ||
                                  0
                                ).toFixed(2)}
                              </Text>

                            </View>

                          )
                        )
                      }

                    </View>


                    {/* RESUMEN */}

                    <View
                      style={
                        styles.resumen
                      }
                    >

                      <View
                        style={
                          styles.resumenRow
                        }
                      >

                        <Text
                          style={
                            styles.resumenLabel
                          }
                        >
                          Subtotal
                        </Text>


                        <Text
                          style={
                            styles.resumenValue
                          }
                        >
                          $
                          {Number(
                            pedido.subtotal ||
                            0
                          ).toFixed(2)}
                        </Text>

                      </View>


                      <View
                        style={
                          styles.resumenRow
                        }
                      >

                        <Text
                          style={
                            styles.resumenLabel
                          }
                        >
                          IVA
                        </Text>


                        <Text
                          style={
                            styles.resumenValue
                          }
                        >
                          $
                          {Number(
                            pedido.impuestos ||
                            0
                          ).toFixed(2)}
                        </Text>

                      </View>


                      <View

                        style={[
                          styles.resumenRow,
                          styles.totalRow,
                        ]}

                      >

                        <Text
                          style={
                            styles.totalLabel
                          }
                        >
                          TOTAL
                        </Text>


                        <Text
                          style={
                            styles.totalValue
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


                    {/* INFO */}

                    <View
                      style={
                        styles.infoBox
                      }
                    >

                      <Text
                        style={
                          styles.infoText
                        }
                      >
                        💳 Pago:{' '}
                        {
                          pedido.metodoPago ===
                          'efectivo'

                            ? 'Efectivo'

                            : 'Tarjeta'
                        }
                      </Text>


                      <Text
                        style={
                          styles.infoText
                        }
                      >
                        👨‍💼 Cajero:{' '}
                        {
                          pedido.usuarioNombre ||
                          'Sin información'
                        }
                      </Text>

                    </View>


                    {/* ENTREGAR */}

                    <TouchableOpacity

                      style={[
                        styles.entregarButton,

                        entregandoId ===
                          pedido.id && {
                          opacity: 0.6,
                        },
                      ]}

                      disabled={
                        entregandoId ===
                        pedido.id
                      }

                      onPress={() =>
                        marcarEntregado(
                          pedido
                        )
                      }

                    >

                      {
                        entregandoId ===
                        pedido.id

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
                                styles.entregarButtonText
                              }
                            >
                              ✅ Marcar como entregado
                            </Text>

                          )
                      }

                    </TouchableOpacity>

                  </View>

                )
              )

            )
        }

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


    header: {

      paddingTop: 55,

      paddingBottom: 18,

      paddingHorizontal: 20,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

    },


    headerContent: {

      flex: 1,

    },


    headerTitle: {

      color:
        colors.white,

      fontSize: 24,

      fontWeight:
        'bold',

    },


    headerSubtitle: {

      color:
        'rgba(255,255,255,0.7)',

      marginTop: 3,

      fontSize: 13,

    },


    counter: {

      minWidth: 42,

      height: 42,

      borderRadius: 21,

      backgroundColor:
        'rgba(255,255,255,0.15)',

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    counterText: {

      color:
        colors.white,

      fontSize: 17,

      fontWeight:
        'bold',

    },


    scroll: {

      padding: 16,

      paddingBottom: 40,

    },


    centered: {

      flex: 1,

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


    emptyContainer: {

      paddingTop: 100,

      alignItems:
        'center',

      paddingHorizontal: 30,

    },


    emptyEmoji: {

      fontSize: 60,

      marginBottom: 15,

    },


    emptyTitle: {

      color:
        colors.textPrimary,

      fontSize: 20,

      fontWeight:
        'bold',

      textAlign:
        'center',

    },


    emptySubtitle: {

      color:
        colors.textSecondary,

      fontSize: 14,

      textAlign:
        'center',

      marginTop: 6,

    },


    pedidoCard: {

      backgroundColor:
        colors.white,

      borderRadius: 20,

      padding: 17,

      marginBottom: 16,

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity: 0.08,

      shadowRadius: 10,

      elevation: 3,

    },


    pedidoHeader: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'flex-start',

      marginBottom: 14,

    },


    folio: {

      color:
        colors.primary,

      fontSize: 19,

      fontWeight:
        'bold',

    },


    fecha: {

      color:
        colors.textSecondary,

      fontSize: 11,

      marginTop: 3,

    },


    estadoBadge: {

      backgroundColor:
        '#FFF4E5',

      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 20,

    },


    estadoText: {

      color: '#B26A00',

      fontSize: 11,

      fontWeight:
        'bold',

    },


    section: {

      borderTopWidth: 1,

      borderTopColor:
        colors.surface,

      paddingTop: 12,

      marginTop: 4,

      marginBottom: 10,

    },


    sectionLabel: {

      color:
        colors.textSecondary,

      fontSize: 10,

      fontWeight:
        'bold',

      letterSpacing: 1,

      marginBottom: 7,

    },


    clienteNombre: {

      color:
        colors.textPrimary,

      fontSize: 17,

      fontWeight:
        '600',

    },


    productoRow: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      paddingVertical: 6,

    },


    productoInfo: {

      flex: 1,

    },


    productoNombre: {

      color:
        colors.textPrimary,

      fontSize: 14,

      fontWeight:
        '600',

    },


    productoPrecioUnitario: {

      color:
        colors.textSecondary,

      fontSize: 11,

      marginTop: 2,

    },


    productoSubtotal: {

      color:
        colors.textPrimary,

      fontWeight:
        'bold',

      marginLeft: 10,

    },


    resumen: {

      backgroundColor:
        colors.background,

      borderRadius: 14,

      padding: 12,

      marginTop: 5,

    },


    resumenRow: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      marginBottom: 6,

    },


    resumenLabel: {

      color:
        colors.textSecondary,

      fontSize: 13,

    },


    resumenValue: {

      color:
        colors.textPrimary,

      fontSize: 13,

    },


    totalRow: {

      borderTopWidth: 1,

      borderTopColor:
        colors.surface,

      paddingTop: 8,

      marginTop: 3,

    },


    totalLabel: {

      color:
        colors.textPrimary,

      fontSize: 15,

      fontWeight:
        'bold',

    },


    totalValue: {

      color:
        colors.secondary,

      fontSize: 16,

      fontWeight:
        'bold',

    },


    infoBox: {

      marginTop: 12,

      marginBottom: 13,

    },


    infoText: {

      color:
        colors.textSecondary,

      fontSize: 12,

      marginBottom: 4,

    },


    entregarButton: {

      backgroundColor:
        colors.success,

      borderRadius: 14,

      paddingVertical: 14,

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    entregarButtonText: {

      color:
        colors.white,

      fontSize: 14,

      fontWeight:
        'bold',

    },

  });