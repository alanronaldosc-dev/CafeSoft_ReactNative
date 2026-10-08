
// HU-015: Venta durante la ruta del repartidor
// Venta por tipo de garrafón (desglosada por carga)
// y recepción de envases vacíos por tipo de garrafón.

// historia HU-013: Lista interactiva de pedidos
// Objetivo: Mostrar pedidos agrupados por estado (Pendiente, En Ruta, Entregado, Cancelado)
// y permitir asignarlos a repartidores en tiempo real.

// HU-014: Botón Navegar en pedido
// Objetivo: Permitir al repartidor abrir la dirección en Google Maps/Waze
// desde la tarjeta del pedido, evitando copiar manualmente la dirección.


import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';



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

// ============================================
// HELPERS
// ============================================

/**
 * Normaliza un texto para comparaciones
 * sin importar mayúsculas ni acentos.
 */
const normalizarTexto = (texto) =>
  String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * HU-015
 * Los garrafones vacíos son insumos registrados
 * en inventario cuyo nombre o tipo contiene
 * la palabra "vacío" (ej. "Garrafón vacío Ciel").
 */
const esGarrafonVacio = (item) =>
  normalizarTexto(item?.nombre).includes("vac") ||
  normalizarTexto(item?.tipo).includes("vac");

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
  // ESTADO DE LA CAMIONETA (POR TIPO)
  // ============================================

  /**
   * Garrafones llenos disponibles en carga,
   * agrupados por tipo de garrafón (inventario).
   * Ejemplo: [{ inventarioId: 1, inventarioNombre: "Bonafont", disponible: 20 }]
   */
  const [cargasPorTipo, setCargasPorTipo] = useState([]);

  /**
   * Envases vacíos recibidos hoy,
   * agrupados por tipo de garrafón (inventario).
   */
  const [vaciosPorTipo, setVaciosPorTipo] = useState([]);

  /**
   * Todos los insumos registrados en inventario.
   * Se usan para elegir los garrafones vacíos
   * que el cliente devuelve.
   */
  const [inventarioTodos, setInventarioTodos] = useState([]);

  /**
   * Cuando está activo se muestra todo el
   * inventario en la lista de vacíos.
   * Por defecto solo se muestran los insumos
   * con "vacío" en su nombre o tipo.
   */
  const [mostrarTodosInsumos, setMostrarTodosInsumos] = useState(false);

  /**
   * Muestra el desglose por tipo de garrafón
   * del panel de la camioneta.
   */
  const [panelExpandido, setPanelExpandido] = useState(false);

  const [monedero, setMonedero] = useState(0);

  // ============================================
  // MODAL DE VENTA
  // ============================================

  const [modalVisible, setModalVisible] = useState(false);
  const [clienteActivo, setClienteActivo] = useState(null);

  /**
   * Cantidad de garrafones llenos seleccionados
   * por tipo de garrafón. { [inventarioId]: "5" }
   */
  const [garrafonesSeleccionados, setGarrafonesSeleccionados] = useState({});

  /**
   * Cantidad de envases vacíos recibidos
   * por tipo de garrafón. { [inventarioId]: "2" }
   */
  const [vaciosSeleccionados, setVaciosSeleccionados] = useState({});

  const [precioUnitario, setPrecioUnitario] = useState("");

  const [metodoCobro, setMetodoCobro] = useState("EFECTIVO");

  const [observaciones, setObservaciones] = useState("");

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
  // (POR TIPO DE GARRAFÓN)
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
        (carga) =>
          normalizarTexto(carga?.estado).includes(
            "carga en transito"
          )
      );

      // ========================================
      // AGRUPAR POR TIPO DE GARRAFÓN
      // ========================================

      const agrupadas = {};

      cargasActivas.forEach((carga) => {
        const inventarioId =
          carga?.inventarioId ??
          carga?.inventario?.id;

        if (inventarioId == null) {
          return;
        }

        const disponible = Number(
          carga?.cantidadDisponible ??
            carga?.cantidad ??
            0
        );

        if (!agrupadas[inventarioId]) {
          agrupadas[inventarioId] = {
            inventarioId,
            inventarioNombre:
              carga.inventarioNombre ||
              carga.tipoGarrafon ||
              carga.inventario?.nombre ||
              "Garrafón",
            tipoGarrafon:
              carga.tipoGarrafon ||
              carga.inventario?.tipo ||
              "",
            unidadMedida:
              carga.unidadMedida ||
              carga.inventario?.unidadMedida ||
              "unidades",
            disponible: 0,
          };
        }

        agrupadas[inventarioId].disponible +=
          Number.isFinite(disponible) ? disponible : 0;
      });

      setCargasPorTipo(Object.values(agrupadas));

      console.log(
        "Garrafones disponibles por tipo:",
        Object.values(agrupadas)
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
      // RECONSTRUIR ENVASES VACÍOS POR TIPO
      // ========================================

      const vaciosAgrupados = {};

      entregas.forEach((entrega) => {
        if (
          String(entrega?.resultado || "")
            .toUpperCase() !== "ENTREGADO"
        ) {
          return;
        }

        const detalles = Array.isArray(
          entrega?.envasesVaciosDetalle
        )
          ? entrega.envasesVaciosDetalle
          : [];

        detalles.forEach((detalle) => {
          const inventarioId =
            detalle?.inventarioId;

          if (inventarioId == null) {
            return;
          }

          const cantidad = Number(
            detalle?.cantidad ?? 0
          );

          if (!vaciosAgrupados[inventarioId]) {
            vaciosAgrupados[inventarioId] = {
              inventarioId,
              inventarioNombre:
                detalle?.inventarioNombre ||
                "Garrafón vacío",
              cantidad: 0,
            };
          }

          vaciosAgrupados[inventarioId].cantidad +=
            Number.isFinite(cantidad)
              ? cantidad
              : 0;
        });
      });

      setVaciosPorTipo(
        Object.values(vaciosAgrupados)
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
  // CARGAR INVENTARIO (GARRAFONES VACÍOS)
  // ============================================

  const cargarInventario = async () => {
    try {
      const token = await getToken();

      const response = await api.get(
        "/inventario",
        {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      const respuesta = response?.data;

      let listaInventario = [];

      if (Array.isArray(respuesta)) {
        listaInventario = respuesta;
      } else if (Array.isArray(respuesta?.data)) {
        listaInventario = respuesta.data;
      } else if (Array.isArray(respuesta?.inventario)) {
        listaInventario = respuesta.inventario;
      }

      setInventarioTodos(listaInventario);
    } catch (error) {
      console.log(
        "Error cargando inventario:",
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

        await cargarInventario();
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

      await cargarInventario();
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

    setGarrafonesSeleccionados({});
    setVaciosSeleccionados({});

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
  // LISTA DE VACÍOS MOSTRADA
  // ============================================

  const listaVaciosMostrada = mostrarTodosInsumos
    ? inventarioTodos
    : inventarioTodos.filter(esGarrafonVacio);

  // ============================================
  // TOTAL DE LA VENTA
  // ============================================

  const cantidadTotalSeleccionada = Object.values(
    garrafonesSeleccionados
  ).reduce(
    (total, valor) =>
      total + (Number(valor) || 0),
    0
  );

  const precioNumerico = Number(
    precioUnitario || 0
  );

  const totalVenta =
    cantidadTotalSeleccionada *
    precioNumerico;

  // ============================================
  // TOTALES DEL PANEL
  // ============================================

  const totalLlenos = cargasPorTipo.reduce(
    (total, carga) =>
      total + (Number(carga.disponible) || 0),
    0
  );

  const totalVaciosHoy = vaciosPorTipo.reduce(
    (total, vacio) =>
      total + (Number(vacio.cantidad) || 0),
    0
  );

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

    // ========================================
    // GARRAFONES LLENOS SELECCIONADOS
    // ========================================

    const garrafones = [];

    for (const carga of cargasPorTipo) {
      const valorTexto =
        garrafonesSeleccionados[
          carga.inventarioId
        ] || "";

      const valor = Number(valorTexto);

      if (
        valorTexto !== "" &&
        (
          !Number.isFinite(valor) ||
          !Number.isInteger(valor) ||
          valor < 0
        )
      ) {
        Alert.alert(
          "Dato inválido",
          `La cantidad de ${carga.inventarioNombre} debe ser un número entero.`
        );

        return;
      }

      if (valor > carga.disponible) {
        Alert.alert(
          "Carga insuficiente",
          `Solo tienes ${carga.disponible} ${carga.inventarioNombre} disponibles.`
        );

        return;
      }

      if (valor > 0) {
        garrafones.push({
          inventarioId: carga.inventarioId,
          cantidad: valor,
        });
      }
    }

    if (garrafones.length === 0) {
      Alert.alert(
        "Sin garrafones",
        "Selecciona al menos un garrafón para entregar."
      );

      return;
    }

    // ========================================
    // ENVASES VACÍOS RECIBIDOS
    // ========================================

    const envasesVacios = [];

    for (const item of listaVaciosMostrada) {
      const valorTexto =
        vaciosSeleccionados[item.id] || "";

      const valor = Number(valorTexto);

      if (
        valorTexto !== "" &&
        (
          !Number.isFinite(valor) ||
          !Number.isInteger(valor) ||
          valor < 0
        )
      ) {
        Alert.alert(
          "Dato inválido",
          `La cantidad de envases vacíos de ${item.nombre} debe ser un número entero.`
        );

        return;
      }

      if (valor > 0) {
        envasesVacios.push({
          inventarioId: item.id,
          cantidad: valor,
        });
      }
    }

    if (
      !Number.isFinite(precioNumerico) ||
      precioNumerico <= 0
    ) {
      Alert.alert(
        "Dato inválido",
        "Ingresa un precio válido."
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

      garrafones,

      envasesVacios,

      precioUnitario:
        precioNumerico,

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

      // ========================================
      // RESUMEN PARA EL REPARTIDOR
      // ========================================

      const resumenGarrafones = garrafones
        .map((garrafon) => {
          const carga = cargasPorTipo.find(
            (item) =>
              item.inventarioId ===
              garrafon.inventarioId
          );

          const nombre =
            carga?.inventarioNombre || "garrafón";

          return `${garrafon.cantidad} ${nombre}`;
        })
        .join(", ");

      const resumenVacios =
        envasesVacios.length > 0
          ? envasesVacios
              .map((vacio) => {
                const item = inventarioTodos.find(
                  (inv) =>
                    inv.id === vacio.inventarioId
                );

                const nombre =
                  item?.nombre || "garrafón vacío";

                return `${vacio.cantidad} ${nombre}`;
              })
              .join(", ")
          : "ninguno";

      Alert.alert(
        "✅ Venta registrada",
        [
          `Cliente: ${clienteActivo.nombre}`,
          `Garrafones: ${resumenGarrafones}`,
          `Precio: $${precioNumerico.toFixed(2)}`,
          `Total: $${(
            garrafones.reduce(
              (total, garrafon) =>
                total + garrafon.cantidad,
              0
            ) * precioNumerico
          ).toFixed(2)}`,
          `Envases vacíos recibidos: ${resumenVacios}`,
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
            {totalLlenos}
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
          style={styles.panelDivider}
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
            {totalVaciosHoy}
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
          style={styles.panelDivider}
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
          DETALLE POR GARRAFÓN (DESPLEGABLE)
      ====================================== */}

      <TouchableOpacity
        style={styles.detalleToggle}
        onPress={() =>
          setPanelExpandido(
            !panelExpandido
          )
        }
        activeOpacity={0.8}
      >
        <Text
          style={
            styles.detalleToggleTexto
          }
        >
          {panelExpandido
            ? "▾ Ocultar detalle por garrafón"
            : "▸ Ver detalle por garrafón"}
        </Text>
      </TouchableOpacity>

      {panelExpandido && (
        <View
          style={
            styles.detalleCard
          }
        >
          <Text
            style={
              styles.detalleSeccionTitulo
            }
          >
            🚰 Llenos en carga
          </Text>

          {cargasPorTipo.length ===
          0 ? (
            <Text
              style={
                styles.detalleVacio
              }
            >
              Sin carga activa de
              garrafones
            </Text>
          ) : (
            cargasPorTipo.map(
              (carga) => (
                <View
                  key={
                    carga.inventarioId
                  }
                  style={
                    styles.detalleFila
                  }
                >
                  <Text
                    style={
                      styles.detalleNombre
                    }
                  >
                    {
                      carga.inventarioNombre
                    }
                  </Text>

                  <Text
                    style={
                      styles.detalleCantidad
                    }
                  >
                    {
                      carga.disponible
                    }
                    {" "}
                    {
                      carga.unidadMedida ||
                      "unidades"
                    }
                  </Text>
                </View>
              )
            )
          )}

          <View
            style={
              styles.detalleSeparador
            }
          />

          <Text
            style={
              styles.detalleSeccionTitulo
            }
          >
            ♻️ Vacíos recibidos hoy
          </Text>

          {vaciosPorTipo.length ===
          0 ? (
            <Text
              style={
                styles.detalleVacio
              }
            >
              No se han recibido
              envases hoy
            </Text>
          ) : (
            vaciosPorTipo.map(
              (vacio) => (
                <View
                  key={
                    vacio.inventarioId
                  }
                  style={
                    styles.detalleFila
                  }
                >
                  <Text
                    style={
                      styles.detalleNombre
                    }
                  >
                    {
                      vacio.inventarioNombre
                    }
                  </Text>

                  <Text
                    style={
                      styles.detalleCantidad
                    }
                  >
                    {vacio.cantidad}
                  </Text>
                </View>
              )
            )
          )}
        </View>
      )}

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

              {/* GARRAFONES A ENTREGAR */}

              <Text
                style={
                  styles.modalLabel
                }
              >
                Garrafones a entregar
              </Text>

              {cargasPorTipo.length ===
              0 ? (
                <View
                  style={
                    styles.modalAviso
                  }
                >
                  <Text
                    style={
                      styles.modalAvisoTexto
                    }
                  >
                    ⚠️ No tienes carga
                    activa de garrafones.
                    Acepta tu carga en
                    "Mis cargas" antes
                    de vender.
                  </Text>
                </View>
              ) : (
                cargasPorTipo.map(
                  (carga) => (
                    <View
                      key={
                        carga.inventarioId
                      }
                      style={
                        styles.filaGarrafon
                      }
                    >
                      <View
                        style={
                          styles.filaInfo
                        }
                      >
                        <Text
                          style={
                            styles.filaNombre
                          }
                        >
                          {
                            carga.inventarioNombre
                          }
                        </Text>

                        <Text
                          style={
                            styles.filaSub
                          }
                        >
                          Disponibles:{" "}
                          {
                            carga.disponible
                          }
                          {" "}
                          {
                            carga.unidadMedida ||
                            "unidades"
                          }
                        </Text>
                      </View>

                      <TextInput
                        style={
                          styles.filaInput
                        }
                        value={
                          garrafonesSeleccionados[
                            carga.inventarioId
                          ] || ""
                        }
                        onChangeText={
                          (texto) =>
                            setGarrafonesSeleccionados(
                              (actual) => ({
                                ...actual,
                                [carga.inventarioId]:
                                  texto,
                              })
                            )
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={
                          colors.textSecondary
                        }
                      />
                    </View>
                  )
                )
              )}

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

              {/* ENVASES VACÍOS RECIBIDOS */}

              <Text
                style={
                  styles.modalLabel
                }
              >
                Envases vacíos recibidos
              </Text>

              {/* Cabecera desplegable */}
              <TouchableOpacity
                style={styles.vaciosHeader}
                onPress={() =>
                  setMostrarTodosInsumos(
                    !mostrarTodosInsumos
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={styles.vaciosHeaderTexto}
                >
                  {mostrarTodosInsumos
                    ? "▲ Ocultar insumos"
                    : "▼ Seleccionar envases vacíos"}
                </Text>
              </TouchableOpacity>

              {mostrarTodosInsumos && (
                inventarioTodos.length === 0 ? (
                  <View style={styles.modalAviso}>
                    <Text style={styles.modalAvisoTexto}>
                      No hay insumos registrados en inventario.
                    </Text>
                  </View>
                ) : (
                  inventarioTodos.map((item) => (
                    <View
                      key={item.id}
                      style={styles.filaGarrafon}
                    >
                      <View style={styles.filaInfo}>
                        <Text style={styles.filaNombre}>
                          {item.nombre}
                        </Text>
                        <Text style={styles.filaSub}>
                          En planta:{" "}
                          {item.cantidad}{" "}
                          {item.unidadMedida || "unidades"}
                        </Text>
                      </View>

                      <TextInput
                        style={styles.filaInput}
                        value={
                          vaciosSeleccionados[item.id] || ""
                        }
                        onChangeText={(texto) =>
                          setVaciosSeleccionados(
                            (actual) => ({
                              ...actual,
                              [item.id]: texto,
                            })
                          )
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={
                          colors.textSecondary
                        }
                      />
                    </View>
                  ))
                )
              )}


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

  // ================================================
  // DETALLE POR GARRAFÓN (DESPLEGABLE)
  // ================================================

  detalleToggle: {
    marginHorizontal: 16,
    marginTop: 8,

    backgroundColor:
      colors.surface,

    borderWidth: 1,
    borderColor:
      colors.border,

    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },

  detalleToggleTexto: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  detalleCard: {
    marginHorizontal: 16,
    marginTop: 8,

    backgroundColor:
      colors.surface,

    borderWidth: 1,
    borderColor:
      colors.border,

    borderRadius: 14,
    padding: 14,
  },

  detalleSeccionTitulo: {
    color:
      colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },

  detalleFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    paddingVertical: 5,
  },

  detalleNombre: {
    color:
      colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },

  detalleCantidad: {
    color:
      colors.secondary,
    fontSize: 13,
    fontWeight: "800",
  },

  detalleVacio: {
    color:
      colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    paddingVertical: 4,
  },

  detalleSeparador: {
    height: 1,
    backgroundColor:
      colors.border,
    marginVertical: 12,
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

    color: colors.textSecondary,
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
    alignItems: "flex-start",

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

  // ================================================
  // MODAL
  // ================================================

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

  modalAviso: {
    backgroundColor:
      colors.surfaceAlt,

    borderWidth: 1,
    borderColor:
      colors.border,

    borderRadius: 10,
    padding: 12,
  },

  modalAvisoTexto: {
    fontSize: 12,

    color:
      colors.textSecondary,
    lineHeight: 18,
  },

  // ================================================
  // FILAS DE GARRAFONES (POR TIPO)
  // ================================================

  filaGarrafon: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      colors.surfaceAlt,

    borderWidth: 1,
    borderColor:
      colors.border,

    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },

  filaInfo: {
    flex: 1,
    marginRight: 10,
  },

  filaNombre: {
    color:
      colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

  filaSub: {
    color:
      colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  filaInput: {
    width: 70,

    backgroundColor:
      colors.surface,

    borderWidth: 1,
    borderColor:
      colors.border,

    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: "700",

    color:
      colors.textPrimary,

    textAlign: "center",
  },

  // ================================================
  // LISTA DE VACÍOS
  // ================================================

  vaciosHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    marginBottom: 8,
  },

  vaciosHeaderTexto: {
    flex: 1,
    marginRight: 8,

    color:
      colors.textSecondary,
    fontSize: 11,
  },

  vaciosToggle: {
    backgroundColor:
      colors.surfaceAlt,

    borderWidth: 1,
    borderColor:
      colors.border,

    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  vaciosToggleTexto: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: "700",
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
    color: colors.primary,
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
