// HU-015: Venta durante la ruta del repartidor

import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

import colors from "../theme/colors";
import api from "../config/api";
import { useAuth } from "../context/AuthContext";

export default function PedidosScreen({ route }) {
  const { usuario, getToken } = useAuth();

  // ============================================
  // REPARTIDOR
  // ============================================

  const repartidorId =
    route?.params?.repartidorId ??
    usuario?.id ??
    usuario?.idUsuario ??
    usuario?.id_usuario;

  // ============================================
  // ESTADOS DE LA RUTA
  // ============================================

  const [clientes, setClientes] = useState([]);
  const [atendidos, setAtendidos] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sinRuta, setSinRuta] = useState(false);

  // ============================================
  // ESTADO DE LA CAMIONETA
  // ============================================

  const [
    garrafonesCamioneta,
    setGarrafonesCamioneta,
  ] = useState(
    Number(route?.params?.cantidadCarga ?? 0)
  );

  const [
    envasesVaciosCamioneta,
    setEnvasesVaciosCamioneta,
  ] = useState(0);

  const [monedero, setMonedero] = useState(0);

  // ============================================
  // MODAL DE VENTA
  // ============================================

  const [modalVisible, setModalVisible] = useState(false);
  const [clienteActivo, setClienteActivo] = useState(null);

  const [
    garrafonesEntregados,
    setGarrafonesEntregados,
  ] = useState("1");

  const [
    envasesVacios,
    setEnvasesVacios,
  ] = useState("0");

  const [
    precioUnitario,
    setPrecioUnitario,
  ] = useState("");

  const [
    metodoCobro,
    setMetodoCobro,
  ] = useState("EFECTIVO");

  const [
    observaciones,
    setObservaciones,
  ] = useState("");

  const [procesando, setProcesando] = useState(false);

  // ============================================
  // CARGAR CLIENTES DE LA RUTA ACTIVA
  // ============================================

  const cargarClientes = async (
    mostrarCarga = true
  ) => {
    if (!repartidorId) {
      setLoading(false);

      Alert.alert(
        "Error",
        "No se pudo identificar al repartidor."
      );

      return [];
    }

    try {
      if (mostrarCarga) {
        setLoading(true);
      }

      setSinRuta(false);

      const token = await getToken();

      const response = await api.get(
        `/rutas/repartidor/${repartidorId}/activa/clientes`,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      const data = response?.data;

      const listaClientes = Array.isArray(data)
        ? data
        : [];

      setClientes(listaClientes);

      return listaClientes;
    } catch (error) {
      const status = error?.response?.status;

      const mensaje =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.response?.data?.mensaje;

      console.log(
        "Error cargando ruta:",
        status,
        mensaje
      );

      if (status === 404) {
        setSinRuta(true);
        setClientes([]);
      } else {
        Alert.alert(
          "Error",
          mensaje || "No se pudo cargar la ruta."
        );
      }

      return [];
    } finally {
      if (mostrarCarga) {
        setLoading(false);
      }
    }
  };

  // ============================================
  // CARGAR GARRAFONES REALES DE LA CAMIONETA
  // ============================================

  const cargarCargaActiva = async () => {
    if (!repartidorId) {
      return;
    }

    try {
      const token = await getToken();

      const response = await api.get(
        `/cargas/repartidor/${repartidorId}`,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      const respuesta = response?.data;

      let listaCargas = [];

      if (Array.isArray(respuesta)) {
        listaCargas = respuesta;
      } else if (Array.isArray(respuesta?.data)) {
        listaCargas = respuesta.data;
      } else if (Array.isArray(respuesta?.cargas)) {
        listaCargas = respuesta.cargas;
      }

      const cargasActivas = listaCargas.filter(
        (carga) => {
          const estado = String(
            carga?.estado || ""
          )
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          return estado === "CARGA EN TRANSITO";
        }
      );

      const disponibleTotal = cargasActivas.reduce(
        (total, carga) => {
          const disponible = Number(
            carga?.cantidadDisponible ??
              carga?.cantidad ??
              0
          );

          return (
            total +
            (Number.isFinite(disponible)
              ? disponible
              : 0)
          );
        },
        0
      );

      console.log(
        "Garrafones disponibles:",
        disponibleTotal
      );

      setGarrafonesCamioneta(
        disponibleTotal
      );
    } catch (error) {
      console.log(
        "Error cargando carga activa:",
        error?.response?.status,
        error?.response?.data
      );
    }
  };

  // ============================================
  // CARGAR ENTREGAS REALIZADAS HOY
  // ============================================

  const cargarEntregasHoy = async (
    listaClientes = clientes
  ) => {
    if (!repartidorId) {
      return;
    }

    try {
      const token = await getToken();

      const response = await api.get(
        `/ventas/repartidor/${repartidorId}/entregas-hoy`,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      const respuesta = response?.data;

      const entregas = Array.isArray(respuesta)
        ? respuesta
        : [];

      console.log(
        "Entregas de hoy:",
        entregas
      );

      // ========================================
      // RECONSTRUIR CLIENTES ATENDIDOS
      // ========================================

      const atendidosHoy = {};

      entregas.forEach((entrega) => {
        if (
          String(entrega?.resultado || "")
            .toUpperCase() !== "ENTREGADO"
        ) {
          return;
        }

        let clienteId = entrega?.clienteId;

        /*
         * Compatibilidad con las ventas realizadas
         * antes de agregar clienteRutaId.
         *
         * Si no existe clienteId, intentamos localizar
         * al cliente por nombre.
         */
        if (
          !clienteId &&
          entrega?.clienteNombre
        ) {
          const clienteEncontrado =
            listaClientes.find(
              (cliente) =>
                String(cliente?.nombre || "")
                  .trim()
                  .toLowerCase() ===
                String(
                  entrega.clienteNombre
                )
                  .trim()
                  .toLowerCase()
            );

          clienteId =
            clienteEncontrado?.id;
        }

        if (!clienteId) {
          return;
        }

        const cantidad = Number(
          entrega?.garrafonesEntregados ?? 0
        );

        const vacios = Number(
          entrega?.envasesVaciosRecibidos ?? 0
        );

        const total = Number(
          entrega?.montoCobrado ?? 0
        );

        const precio =
          cantidad > 0
            ? total / cantidad
            : 0;

        atendidosHoy[clienteId] = {
          cantidad,
          vacios,
          total,
          precio,
          metodoCobro:
            entrega?.metodoCobro || "",
        };
      });

      setAtendidos(atendidosHoy);

      // ========================================
      // RECONSTRUIR ENVASES VACÍOS
      // ========================================

      const totalVacios = entregas.reduce(
        (total, entrega) => {
          if (
            String(entrega?.resultado || "")
              .toUpperCase() !== "ENTREGADO"
          ) {
            return total;
          }

          return (
            total +
            Number(
              entrega?.envasesVaciosRecibidos ??
                0
            )
          );
        },
        0
      );

      setEnvasesVaciosCamioneta(
        totalVacios
      );

      // ========================================
      // RECONSTRUIR MONEDERO
      // SOLO EFECTIVO
      // ========================================

      const totalEfectivo = entregas.reduce(
        (total, entrega) => {
          if (
            String(entrega?.resultado || "")
              .toUpperCase() !== "ENTREGADO"
          ) {
            return total;
          }

          if (
            String(entrega?.metodoCobro || "")
              .toUpperCase() !== "EFECTIVO"
          ) {
            return total;
          }

          return (
            total +
            Number(
              entrega?.montoCobrado ?? 0
            )
          );
        },
        0
      );

      setMonedero(totalEfectivo);
    } catch (error) {
      console.log(
        "Error cargando entregas de hoy:",
        error?.response?.status,
        error?.response?.data
      );
    }
  };

  // ============================================
  // CARGAR TODO AL ENTRAR A MI RUTA
  // ============================================

  useFocusEffect(
    useCallback(() => {
      const cargarTodo = async () => {
        const listaClientes =
          await cargarClientes();

        await cargarCargaActiva();

        await cargarEntregasHoy(
          listaClientes || []
        );
      };

      cargarTodo();

      return () => {};
    }, [repartidorId])
  );

  // ============================================
  // ACTUALIZAR DESLIZANDO
  // ============================================

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      const listaClientes =
        await cargarClientes(false);

      await cargarCargaActiva();

      await cargarEntregasHoy(
        listaClientes || []
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================
  // ABRIR GOOGLE MAPS
  // ============================================

  const abrirMapa = async (cliente) => {
    try {
      if (cliente?.linkGoogleMaps) {
        await Linking.openURL(
          cliente.linkGoogleMaps
        );

        return;
      }

      if (cliente?.domicilio) {
        const url =
          "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(
            cliente.domicilio
          );

        await Linking.openURL(url);

        return;
      }

      Alert.alert(
        "Sin dirección",
        "Este cliente no tiene dirección registrada."
      );
    } catch {
      Alert.alert(
        "Error",
        "No se pudo abrir Google Maps."
      );
    }
  };

  // ============================================
  // ABRIR MODAL DE VENTA
  // ============================================

  const abrirModalVenta = (cliente) => {
    setClienteActivo(cliente);

    setGarrafonesEntregados("1");
    setEnvasesVacios("0");

    setPrecioUnitario(
      String(
        cliente?.precioPorGarrafon ?? ""
      )
    );

    setMetodoCobro("EFECTIVO");
    setObservaciones("");

    setModalVisible(true);
  };

  // ============================================
  // TOTAL DE LA VENTA
  // ============================================

  const cantidadNumerica = Number(
    garrafonesEntregados || 0
  );

  const precioNumerico = Number(
    precioUnitario || 0
  );

  const totalVenta =
    cantidadNumerica *
    precioNumerico;

  // ============================================
  // CONFIRMAR VENTA
  // ============================================

  const confirmarVenta = async () => {
    if (!clienteActivo) {
      Alert.alert(
        "Error",
        "No hay un cliente seleccionado."
      );

      return;
    }

    if (!repartidorId) {
      Alert.alert(
        "Error",
        "No se pudo identificar al repartidor."
      );

      return;
    }

    const cantidad = Number(
      garrafonesEntregados
    );

    const vacios = Number(
      envasesVacios
    );

    const precio = Number(
      precioUnitario
    );

    // ========================================
    // VALIDACIONES
    // ========================================

    if (
      !Number.isFinite(cantidad) ||
      cantidad <= 0
    ) {
      Alert.alert(
        "Dato inválido",
        "Ingresa una cantidad válida de garrafones."
      );

      return;
    }

    if (!Number.isInteger(cantidad)) {
      Alert.alert(
        "Dato inválido",
        "Los garrafones deben manejarse en unidades completas."
      );

      return;
    }

    if (
      !Number.isFinite(vacios) ||
      vacios < 0
    ) {
      Alert.alert(
        "Dato inválido",
        "Los envases vacíos no pueden ser negativos."
      );

      return;
    }

    if (!Number.isInteger(vacios)) {
      Alert.alert(
        "Dato inválido",
        "Los envases vacíos deben manejarse en unidades completas."
      );

      return;
    }

    if (
      !Number.isFinite(precio) ||
      precio <= 0
    ) {
      Alert.alert(
        "Dato inválido",
        "Ingresa un precio válido."
      );

      return;
    }

    if (
      cantidad >
      Number(garrafonesCamioneta)
    ) {
      Alert.alert(
        "Carga insuficiente",
        `Solo tienes ${garrafonesCamioneta} garrafón(es) disponibles.`
      );

      return;
    }

    // ========================================
    // DATOS PARA LA API
    // ========================================

    const payload = {
      clienteId: Number(
        clienteActivo.id
      ),

      repartidorId: Number(
        repartidorId
      ),

      garrafonesEntregados:
        cantidad,

      envasesVaciosRecibidos:
        vacios,

      precioUnitario:
        precio,

      metodoCobro,

      observaciones:
        observaciones.trim(),
    };

    try {
      setProcesando(true);

      console.log(
        "Registrando venta en ruta:",
        payload
      );

      const token = await getToken();

      const response = await api.post(
        "/ventas/ruta/registrar",
        payload,
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      console.log(
        "Venta registrada:",
        response.data
      );

      setModalVisible(false);

      /*
       * IMPORTANTE:
       * Ya no incrementamos manualmente
       * monedero/vacíos/atendidos.
       *
       * Volvemos a consultar la API y la API
       * se convierte en la fuente real.
       */
      await cargarCargaActiva();

      await cargarEntregasHoy(
        clientes
      );

      const total =
        cantidad * precio;

      Alert.alert(
        "✅ Venta registrada",
        [
          `Cliente: ${clienteActivo.nombre}`,
          `Garrafones: ${cantidad}`,
          `Precio: $${precio.toFixed(2)}`,
          `Total: $${total.toFixed(2)}`,
          `Método: ${metodoCobro}`,
        ].join("\n")
      );
    } catch (error) {
      const data =
        error?.response?.data;

      console.log(
        "Venta rechazada por la API:",
        data || error?.message
      );

      const mensaje =
        data?.error ||
        data?.message ||
        data?.mensaje ||
        "No fue posible registrar la venta.";

      Alert.alert(
        "No se pudo registrar",
        mensaje
      );
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // CLIENTE AUSENTE
  // ============================================

  const marcarAusente = (cliente) => {
    Alert.alert(
      "Cliente ausente",
      `¿Confirmas que ${cliente.nombre} no se encontró disponible?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",

          onPress: () => {
            /*
             * Por ahora este estado sigue siendo
             * local. Después podemos registrar
             * también la incidencia en Java.
             */
            setAtendidos(
              (actual) => ({
                ...actual,
                [cliente.id]:
                  "ausente",
              })
            );
          },
        },
      ]
    );
  };

  // ============================================
  // CLIENTES PENDIENTES / ATENDIDOS
  // ============================================

  const pendientes =
    clientes.filter(
      (cliente) =>
        !atendidos[cliente.id]
    );

  const completados =
    clientes.filter(
      (cliente) =>
        atendidos[cliente.id]
    );

  // ============================================
  // CARGANDO
  // ============================================

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[
            "#0F1B2D",
            "#0073BB",
          ]}
          style={styles.header}
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
            🗺️ Mi Ruta
          </Text>
        </LinearGradient>

        <View style={styles.centered}>
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
            Cargando ruta...
          </Text>
        </View>
      </View>
    );
  }

  // ============================================
  // INTERFAZ
  // ============================================

  return (
    <View style={styles.container}>
      {/* ======================================
          HEADER
      ====================================== */}

      <LinearGradient
        colors={[
          "#0F1B2D",
          "#0073BB",
        ]}
        style={styles.header}
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
            🗺️ Mi Ruta
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            {pendientes.length} pendientes
            {" · "}
            {completados.length} atendidos
          </Text>
        </View>

        <View style={styles.counter}>
          <Text
            style={
              styles.counterText
            }
          >
            {pendientes.length}
          </Text>
        </View>
      </LinearGradient>

      {/* ======================================
          ESTADO CAMIONETA
      ====================================== */}

      <View
        style={
          styles.panelCamioneta
        }
      >
        <View
          style={styles.panelItem}
        >
          <Text
            style={
              styles.panelEmoji
            }
          >
            🚰
          </Text>

          <Text
            style={
              styles.panelValor
            }
          >
            {garrafonesCamioneta}
          </Text>

          <Text
            style={
              styles.panelLabel
            }
          >
            Llenos
          </Text>
        </View>

        <View
          style={
            styles.panelDivider
          }
        />

        <View
          style={styles.panelItem}
        >
          <Text
            style={
              styles.panelEmoji
            }
          >
            ♻️
          </Text>

          <Text
            style={
              styles.panelValor
            }
          >
            {envasesVaciosCamioneta}
          </Text>

          <Text
            style={
              styles.panelLabel
            }
          >
            Vacíos
          </Text>
        </View>

        <View
          style={
            styles.panelDivider
          }
        />

        <View
          style={styles.panelItem}
        >
          <Text
            style={
              styles.panelEmoji
            }
          >
            💵
          </Text>

          <Text
            style={[
              styles.panelValor,
              {
                color:
                  "#3AC87A",
              },
            ]}
          >
            $
            {Number(
              monedero
            ).toFixed(2)}
          </Text>

          <Text
            style={
              styles.panelLabel
            }
          >
            Monedero
          </Text>
        </View>
      </View>

      {/* ======================================
          LISTA DE CLIENTES
      ====================================== */}

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
        {sinRuta ? (
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
              🗺️
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Sin ruta activa
            </Text>

            <Text
              style={
                styles.emptySubtitle
              }
            >
              El encargado aún no ha
              activado una ruta para ti.
            </Text>
          </View>
        ) : clientes.length === 0 ? (
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
              📦
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No hay clientes
            </Text>

            <Text
              style={
                styles.emptySubtitle
              }
            >
              La ruta no tiene clientes
              asignados.
            </Text>
          </View>
        ) : (
          clientes.map(
            (cliente, index) => {
              const estado =
                atendidos[
                  cliente.id
                ];

              const yaAtendido =
                Boolean(estado);

              return (
                <View
                  key={
                    cliente.id
                  }
                  style={[
                    styles.clienteCard,

                    yaAtendido &&
                      styles.clienteCardAtendido,
                  ]}
                >
                  {/* ==========================
                      CLIENTE
                  ========================== */}

                  <View
                    style={
                      styles.clienteHeader
                    }
                  >
                    <View
                      style={
                        styles.ordenBadge
                      }
                    >
                      <Text
                        style={
                          styles.ordenTexto
                        }
                      >
                        #
                        {cliente.ordenEnRuta ??
                          index + 1}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={
                          styles.clienteNombre
                        }
                      >
                        {
                          cliente.nombre
                        }
                      </Text>

                      <Text
                        style={
                          styles.clienteDomicilio
                        }
                      >
                        📍{" "}
                        {cliente.domicilio ||
                          "Sin domicilio"}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.estadoBadge,

                        yaAtendido &&
                          styles.estadoBadgeAtendido,
                      ]}
                    >
                      <Text
                        style={[
                          styles.estadoText,

                          yaAtendido &&
                            styles.estadoTextAtendido,
                        ]}
                      >
                        {estado ===
                        "ausente"
                          ? "🚫 AUSENTE"
                          : yaAtendido
                            ? "✅ ATENDIDO"
                            : "⏳ PENDIENTE"}
                      </Text>
                    </View>
                  </View>

                  {/* ==========================
                      INFORMACIÓN
                  ========================== */}

                  <View
                    style={
                      styles.infoRow
                    }
                  >
                    <View
                      style={
                        styles.infoItem
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        💰 Precio
                      </Text>

                      <Text
                        style={
                          styles.infoValor
                        }
                      >
                        $
                        {Number(
                          cliente
                            .precioPorGarrafon ??
                            0
                        ).toFixed(2)}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.infoItem
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        🚰 Preferencia
                      </Text>

                      <Text
                        style={
                          styles.infoValor
                        }
                      >
                        {cliente
                          ?.garrafonPreferencia
                          ?.nombre ||
                          "—"}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.infoItem
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        📅 Días
                      </Text>

                      <Text
                        style={
                          styles.infoValor
                        }
                      >
                        {cliente.diasReparto ||
                          "—"}
                      </Text>
                    </View>
                  </View>

                  {/* ==========================
                      RESUMEN ATENDIDO
                  ========================== */}

                  {yaAtendido &&
                    typeof estado ===
                      "object" && (
                      <View
                        style={
                          styles.resumenAtendido
                        }
                      >
                        <Text
                          style={
                            styles.resumenAtendidoTexto
                          }
                        >
                          ✅ Entregados:{" "}
                          {
                            estado.cantidad
                          }
                          {" · "}
                          Vacíos:{" "}
                          {
                            estado.vacios
                          }
                          {" · "}$
                          {Number(
                            estado.total
                          ).toFixed(2)}
                          {" · "}
                          {
                            estado.metodoCobro
                          }
                        </Text>
                      </View>
                    )}

                  {/* ==========================
                      BOTONES
                  ========================== */}

                  {!yaAtendido && (
                    <>
                      <View
                        style={
                          styles.botonesRow
                        }
                      >
                        <TouchableOpacity
                          style={
                            styles.btnMapa
                          }
                          onPress={() =>
                            abrirMapa(
                              cliente
                            )
                          }
                        >
                          <Text
                            style={
                              styles.btnMapaText
                            }
                          >
                            📍 Navegar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            styles.btnEntregar
                          }
                          onPress={() =>
                            abrirModalVenta(
                              cliente
                            )
                          }
                        >
                          <Text
                            style={
                              styles.btnEntregarText
                            }
                          >
                            💧 Vender
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={
                          styles.btnAusente
                        }
                        onPress={() =>
                          marcarAusente(
                            cliente
                          )
                        }
                      >
                        <Text
                          style={
                            styles.btnAusenteText
                          }
                        >
                          🚫 Cliente ausente
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            }
          )
        )}
      </ScrollView>

      {/* ======================================
          MODAL DE VENTA
      ====================================== */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent:
                "flex-end",
            }}
          >
            <View
              style={
                styles.modalContainer
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Registrar venta
              </Text>

              {clienteActivo && (
                <>
                  <Text
                    style={
                      styles.modalCliente
                    }
                  >
                    {
                      clienteActivo.nombre
                    }
                  </Text>

                  <Text
                    style={
                      styles.modalDomicilio
                    }
                  >
                    📍{" "}
                    {
                      clienteActivo.domicilio
                    }
                  </Text>

                  <Text
                    style={
                      styles.modalPreferencia
                    }
                  >
                    🚰{" "}
                    {clienteActivo
                      ?.garrafonPreferencia
                      ?.nombre ||
                      "Garrafón"}
                  </Text>
                </>
              )}

              {/* CANTIDAD */}

              <Text
                style={
                  styles.modalLabel
                }
              >
                Garrafones a entregar
              </Text>

              <TextInput
                style={
                  styles.modalInput
                }
                value={
                  garrafonesEntregados
                }
                onChangeText={
                  setGarrafonesEntregados
                }
                keyboardType="numeric"
                placeholder="Cantidad"
                placeholderTextColor={
                  colors.textSecondary
                }
              />

              <Text
                style={
                  styles.modalHint
                }
              >
                Disponibles en camioneta:{" "}
                {
                  garrafonesCamioneta
                }
              </Text>

              {/* PRECIO */}

              <Text
                style={
                  styles.modalLabel
                }
              >
                Precio por garrafón
              </Text>

              <TextInput
                style={
                  styles.modalInput
                }
                value={
                  precioUnitario
                }
                onChangeText={
                  setPrecioUnitario
                }
                keyboardType="decimal-pad"
                placeholder="Precio"
                placeholderTextColor={
                  colors.textSecondary
                }
              />

              {/* VACÍOS */}

              <Text
                style={
                  styles.modalLabel
                }
              >
                Envases vacíos recibidos
              </Text>

              <TextInput
                style={
                  styles.modalInput
                }
                value={
                  envasesVacios
                }
                onChangeText={
                  setEnvasesVacios
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={
                  colors.textSecondary
                }
              />

              {/* MÉTODO */}

              <Text
                style={
                  styles.modalLabel
                }
              >
                Método de cobro
              </Text>

              <View
                style={
                  styles.metodosRow
                }
              >
                <TouchableOpacity
                  style={[
                    styles.metodoBtn,

                    metodoCobro ===
                      "EFECTIVO" &&
                      styles.metodoBtnActivo,
                  ]}
                  onPress={() =>
                    setMetodoCobro(
                      "EFECTIVO"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.metodoBtnText,

                      metodoCobro ===
                        "EFECTIVO" &&
                        styles.metodoBtnTextActivo,
                    ]}
                  >
                    💵 Efectivo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.metodoBtn,

                    metodoCobro ===
                      "TRANSFERENCIA" &&
                      styles.metodoBtnActivo,
                  ]}
                  onPress={() =>
                    setMetodoCobro(
                      "TRANSFERENCIA"
                    )
                  }
                >
                  <Text
                    style={[
                      styles.metodoBtnText,

                      metodoCobro ===
                        "TRANSFERENCIA" &&
                        styles.metodoBtnTextActivo,
                    ]}
                  >
                    🏦 Transferencia
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TOTAL */}

              <View
                style={
                  styles.totalBox
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Total estimado
                </Text>

                <Text
                  style={
                    styles.totalValue
                  }
                >
                  $
                  {Number(
                    totalVenta
                  ).toFixed(2)}
                </Text>
              </View>

              {/* OBSERVACIONES */}

              <Text
                style={
                  styles.modalLabel
                }
              >
                Observaciones
              </Text>

              <TextInput
                style={[
                  styles.modalInput,
                  styles.observacionesInput,
                ]}
                value={
                  observaciones
                }
                onChangeText={
                  setObservaciones
                }
                placeholder="Opcional"
                placeholderTextColor={
                  colors.textSecondary
                }
                multiline
              />

              {/* BOTONES */}

              <View
                style={
                  styles.modalBotones
                }
              >
                <TouchableOpacity
                  style={
                    styles.modalBtnCancelar
                  }
                  onPress={() =>
                    setModalVisible(
                      false
                    )
                  }
                  disabled={
                    procesando
                  }
                >
                  <Text
                    style={
                      styles.modalBtnCancelarText
                    }
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtnConfirmar,

                    procesando && {
                      opacity: 0.6,
                    },
                  ]}
                  onPress={
                    confirmarVenta
                  }
                  disabled={
                    procesando
                  }
                >
                  {procesando ? (
                    <ActivityIndicator
                      color={
                        colors.white
                      }
                    />
                  ) : (
                    <Text
                      style={
                        styles.modalBtnConfirmarText
                      }
                    >
                      Confirmar venta
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  header: {
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color:
      "rgba(255,255,255,0.7)",
    marginTop: 3,
    fontSize: 12,
  },

  counter: {
    minWidth: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor:
      "rgba(255,255,255,0.15)",

    alignItems: "center",
    justifyContent: "center",
  },

  counterText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "bold",
  },

  panelCamioneta: {
    flexDirection: "row",

    backgroundColor:
      colors.surface,

    marginHorizontal: 16,
    marginTop: 12,

    borderRadius: 14,

    borderWidth: 1,
    borderColor:
      colors.border,

    padding: 12,
  },

  panelItem: {
    flex: 1,
    alignItems: "center",
  },

  panelEmoji: {
    fontSize: 20,
  },

  panelValor: {
    fontSize: 18,
    fontWeight: "800",

    color:
      colors.textPrimary,

    marginTop: 2,
  },

  panelLabel: {
    fontSize: 10,

    color:
      colors.textSecondary,

    marginTop: 2,
  },

  panelDivider: {
    width: 1,

    backgroundColor:
      colors.border,

    marginVertical: 4,
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,

    color:
      colors.textSecondary,
  },

  emptyContainer: {
    paddingTop: 80,
    alignItems: "center",
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
    fontWeight: "bold",
    textAlign: "center",
  },

  emptySubtitle: {
    color:
      colors.textSecondary,

    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },

  clienteCard: {
    backgroundColor:
      colors.surface,

    borderRadius: 20,

    padding: 16,
    marginBottom: 16,

    borderWidth: 1,
    borderColor:
      colors.border,
  },

  clienteCardAtendido: {
    opacity: 0.65,
    borderColor:
      "#3AC87A44",
  },

  clienteHeader: {
    flexDirection: "row",
    alignItems:
      "flex-start",

    gap: 10,
    marginBottom: 12,
  },

  ordenBadge: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor:
      colors.primary,

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  ordenTexto: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },

  clienteNombre: {
    color:
      colors.textPrimary,

    fontSize: 16,
    fontWeight: "700",
  },

  clienteDomicilio: {
    color:
      colors.textSecondary,

    fontSize: 12,
    marginTop: 3,
  },

  estadoBadge: {
    backgroundColor:
      "#1A1500",

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 20,

    borderWidth: 1,
    borderColor:
      "#FF990044",
  },

  estadoBadgeAtendido: {
    backgroundColor:
      "#0D2B1A",

    borderColor:
      "#3AC87A44",
  },

  estadoText: {
    color:
      colors.secondary,

    fontSize: 10,
    fontWeight: "bold",
  },

  estadoTextAtendido: {
    color: "#3AC87A",
  },

  infoRow: {
    flexDirection: "row",

    backgroundColor:
      colors.surfaceAlt,

    borderRadius: 12,

    padding: 10,
    marginBottom: 10,
  },

  infoItem: {
    flex: 1,
    alignItems: "center",
  },

  infoLabel: {
    color:
      colors.textSecondary,

    fontSize: 9,
    textAlign: "center",
  },

  infoValor: {
    color:
      colors.textPrimary,

    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },

  resumenAtendido: {
    backgroundColor:
      "#0D2B1A",

    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },

  resumenAtendidoTexto: {
    color: "#3AC87A",
    fontSize: 12,
    fontWeight: "600",
  },

  botonesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },

  btnMapa: {
    flex: 1,

    backgroundColor:
      colors.primary,

    borderRadius: 12,
    paddingVertical: 11,

    alignItems: "center",
  },

  btnMapaText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  btnEntregar: {
    flex: 1,

    backgroundColor:
      colors.success,

    borderRadius: 12,
    paddingVertical: 11,

    alignItems: "center",
  },

  btnEntregarText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  btnAusente: {
    backgroundColor:
      colors.errorLight,

    borderRadius: 12,
    paddingVertical: 9,

    alignItems: "center",

    borderWidth: 1,
    borderColor:
      "#E0525233",
  },

  btnAusenteText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.75)",

    justifyContent:
      "flex-end",
  },

  modalContainer: {
    backgroundColor:
      colors.surface,

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    padding: 24,
    paddingBottom: 40,

    borderWidth: 1,
    borderColor:
      colors.border,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",

    color:
      colors.textPrimary,

    marginBottom: 4,
  },

  modalCliente: {
    fontSize: 15,
    fontWeight: "700",

    color:
      colors.secondary,

    marginBottom: 2,
  },

  modalDomicilio: {
    fontSize: 12,

    color:
      colors.textSecondary,

    marginBottom: 4,
  },

  modalPreferencia: {
    fontSize: 12,

    color:
      colors.textSecondary,

    marginBottom: 10,
  },

  modalLabel: {
    fontSize: 11,
    fontWeight: "700",

    color:
      colors.textSecondary,

    letterSpacing: 0.5,
    textTransform:
      "uppercase",

    marginBottom: 6,
    marginTop: 14,
  },

  modalInput: {
    backgroundColor:
      colors.surfaceAlt,

    borderWidth: 1,
    borderColor:
      colors.border,

    borderRadius: 10,

    paddingHorizontal: 14,
    paddingVertical: 11,

    fontSize: 15,

    color:
      colors.textPrimary,
  },

  modalHint: {
    fontSize: 11,

    color:
      colors.textSecondary,

    marginTop: 4,
  },

  metodosRow: {
    flexDirection: "row",
    gap: 10,
  },

  metodoBtn: {
    flex: 1,

    paddingVertical: 10,

    borderRadius: 10,

    backgroundColor:
      colors.surfaceAlt,

    borderWidth: 1,
    borderColor:
      colors.border,

    alignItems: "center",
  },

  metodoBtnActivo: {
    backgroundColor:
      `${colors.primary}22`,

    borderColor:
      colors.primary,
  },

  metodoBtnText: {
    fontSize: 13,

    color:
      colors.textSecondary,

    fontWeight: "600",
  },

  metodoBtnTextActivo: {
    color:
      colors.primary,
  },

  totalBox: {
    marginTop: 18,

    backgroundColor:
      colors.surfaceAlt,

    borderWidth: 1,
    borderColor:
      colors.border,

    borderRadius: 12,
    padding: 14,

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",
  },

  totalLabel: {
    color:
      colors.textSecondary,

    fontSize: 13,
    fontWeight: "600",
  },

  totalValue: {
    color: "#3AC87A",

    fontSize: 22,
    fontWeight: "800",
  },

  observacionesInput: {
    minHeight: 70,

    textAlignVertical:
      "top",
  },

  modalBotones: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },

  modalBtnCancelar: {
    flex: 1,

    paddingVertical: 13,

    borderRadius: 12,

    backgroundColor:
      colors.surfaceAlt,

    borderWidth: 1,
    borderColor:
      colors.border,

    alignItems: "center",
  },

  modalBtnCancelarText: {
    color:
      colors.textSecondary,

    fontWeight: "600",
  },

  modalBtnConfirmar: {
    flex: 1,

    paddingVertical: 13,

    borderRadius: 12,

    backgroundColor:
      colors.success,

    alignItems: "center",
  },

  modalBtnConfirmarText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});