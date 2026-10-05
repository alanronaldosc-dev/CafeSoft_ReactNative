import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});



function CargasRepartidor({ navigation }) {
  // ============================================
  // USUARIO AUTENTICADO
  // ============================================

  const { usuario, cerrarSesion, getToken } = useAuth();

  // ============================================
  // ESTADOS
  // ============================================

  const [cargas, setCargas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [aceptandoId, setAceptandoId] = useState(null);
  const [error, setError] = useState("");

  const getEstadoCarga = (carga) => {
    const estado =
      carga?.estado ??
      carga?.status ??
      carga?.estadoCarga ??
      carga?.situacion ??
      "PENDIENTE";

    const texto = String(estado).toUpperCase();

    if (texto.includes("TRANSITO") || texto.includes("TRANSIT") || texto.includes("EN_TRAMITE")) {
      return "EN TRÁNSITO";
    }

    if (texto.includes("ACEPT") || texto.includes("CONFIRM") || texto.includes("RECIB") || texto.includes("ASIGN")) {
      return "PENDIENTE";
    }

    return texto || "PENDIENTE";
  };

  // ============================================
  // OBTENER ID DEL REPARTIDOR
  // ============================================

  const repartidorId =
    usuario?.id ??
    usuario?.idUsuario ??
    usuario?.id_usuario;

  const nombreUsuario = usuario?.nombre || usuario?.name || "Repartidor";
  const emailUsuario = usuario?.email || usuario?.correo || "sin-email@cafesoft.com";
  const rolUsuario = usuario?.rol || usuario?.role || "Repartidor";

  const handleLogout = () => {
    cerrarSesion();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  // ============================================
  // CARGAR CARGAS PENDIENTES
  // ============================================

  const cargarCargas = async (esActualizacion = false) => {
    if (!repartidorId) {
      setError(
        "No se pudo identificar al repartidor. Cierra sesión e inicia nuevamente."
      );

      setCargando(false);
      setActualizando(false);

      return;
    }

    try {
      if (esActualizacion) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      console.log(
        "Consultando cargas del repartidor:",
        repartidorId
      );

      const token = await getToken();

      const response = await api.get(
        `/cargas/repartidor/${repartidorId}/pendientes`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );



      console.log(
        "Respuesta cargas pendientes:",
        response.data
      );

      // ==========================================
      // LA API PUEDE DEVOLVER DIRECTAMENTE
      // EL ARRAY O UN OBJETO CON data/cargas
      // ==========================================

      const respuesta = response.data;

      let listaCargas = [];

      if (Array.isArray(respuesta)) {
        listaCargas = respuesta;
      } else if (Array.isArray(respuesta?.data)) {
        listaCargas = respuesta.data;
      } else if (Array.isArray(respuesta?.cargas)) {
        listaCargas = respuesta.cargas;
      }

      const cargasFiltradas = listaCargas.filter((carga) => {
        const estado = getEstadoCarga(carga);
        return !estado.includes("TRANSITO");
      });

      setCargas(cargasFiltradas);

    } catch (err) {
      console.error(
        "Error al cargar cargas pendientes:",
        err
      );

      console.error(
        "Respuesta del servidor:",
        err.response?.data
      );

      const mensaje =
        err.response?.data?.message ||
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        "No se pudieron cargar las cargas pendientes.";

      setError(mensaje);

      // Si es una actualización manual,
      // no borramos las cargas que ya estaban visibles.
      if (!esActualizacion) {
        setCargas([]);
      }

    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  // ============================================
  // CARGAR AL ENTRAR A LA PANTALLA
  // ============================================

  useFocusEffect(
    useCallback(() => {
      cargarCargas();

      return () => {};
    }, [repartidorId])
  );

  // ============================================
  // ACEPTAR CARGA
  // ============================================

  const aceptarCarga = (carga) => {
    Alert.alert(
      "Iniciar ruta",
      `¿Confirmas que recibiste ${carga.cantidad} ${
        carga.unidadMedida || "unidades"
      } de ${
        carga.inventarioNombre ||
        carga.tipoGarrafon ||
        carga.inventario?.nombre ||
        "garrafones"
      }?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: () => confirmarAceptacion(carga),
        },
      ]
    );
  };

  // ============================================
  // CONFIRMAR ACEPTACIÓN EN LA API
  // ============================================

  const confirmarAceptacion = async (carga) => {
    try {
      setAceptandoId(carga.id);
      setError("");

      console.log("Aceptando carga:", carga.id);

      const token = await getToken();

      const response = await api.put(
        `/cargas/${carga.id}/aceptar`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      console.log("Respuesta aceptar carga:", response.data);

      Alert.alert(
        "Ruta iniciada",
        "La ruta fue iniciada correctamente y ahora se encuentra en tránsito.",
        [
          {
            text: "Continuar",
            onPress: () => { cargarCargas(true); },
          },
        ]
      );

    } catch (err) {
      console.error("Error al aceptar carga:", err);
      console.error("Respuesta del servidor:", err.response?.data);

      const mensaje =
        err.response?.data?.message ||
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        "No se pudo aceptar la carga.";

      Alert.alert("Error", mensaje);

    } finally {
      setAceptandoId(null);
    }
  };

  // ============================================
  // FORMATEAR FECHA
  // ============================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    try {
      return new Date(fecha).toLocaleString(
        "es-MX",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return String(fecha);
    }
  };

  // ============================================
  // OBTENER NOMBRE DEL INVENTARIO
  // ============================================

  const obtenerNombreGarrafon = (carga) => {
    return (
      carga.inventarioNombre ||
      carga.tipoGarrafon ||
      carga.inventario?.nombre ||
      "Garrafón"
    );
  };

  // ============================================
  // OBTENER UNIDAD
  // ============================================

  const obtenerUnidad = (carga) => {
    return (
      carga.unidadMedida ||
      carga.inventario?.unidadMedida ||
      "unidades"
    );
  };

  // ============================================
  // SI NO SE IDENTIFICÓ EL USUARIO
  // ============================================

  if (!repartidorId) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.header}>
          <Text style={styles.iconoHeader}>
            🚚
          </Text>

          <View style={styles.headerTexto}>
            <Text style={styles.titulo}>
              Mis cargas
            </Text>

            <Text style={styles.subtitulo}>
              Carga inicial de garrafones
            </Text>
          </View>
        </View>

        <View style={styles.errorCard}>
          <Text style={styles.errorIcono}>
            ⚠️
          </Text>

          <Text style={styles.errorTitulo}>
            No se pudo identificar al repartidor
          </Text>

          <Text style={styles.errorTexto}>
            La sesión actual no contiene el
            identificador del usuario.
          </Text>
        </View>
      </View>
    );
  }

  // ============================================
  // PANTALLA DE CARGA
  // ============================================

  if (cargando) {
    return (
      <View style={styles.cargandoContainer}>
        <ActivityIndicator
          size="large"
          color="#FF9900"
        />

        <Text style={styles.cargandoTexto}>
          Cargando tus cargas...
        </Text>
      </View>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <View style={styles.contenedor}>

      {/* ========================================
          ENCABEZADO
      ======================================== */}

      <View style={styles.header}>

        <View style={styles.iconoHeaderContainer}>
          <Text style={styles.iconoHeader}>
            🚚
          </Text>
        </View>

        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>
            Mis cargas
          </Text>

          <Text style={styles.subtitulo}>
            Carga inicial de garrafones
          </Text>
        </View>

      </View>

      {/* ========================================
          PERFIL DEL REPARTIDOR
      ======================================== */}

      <View style={styles.perfilCard}>
        <View style={styles.perfilHeader}>
          <View style={styles.perfilAvatarContainer}>
            <Text style={styles.perfilAvatarText}>
              {nombreUsuario.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.perfilInfo}>
            <Text style={styles.perfilNombre}>{nombreUsuario}</Text>
            <Text style={styles.perfilRol}>{rolUsuario}</Text>
            <Text style={styles.perfilEmail}>{emailUsuario}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.perfilResumen}>
          <View style={styles.resumenMiniCard}>
            <Text style={styles.resumenMiniNumero}>{cargas.length}</Text>
            <Text style={styles.resumenMiniLabel}>Pendientes</Text>
          </View>

          <View style={styles.resumenMiniCard}>
            <Text style={styles.resumenMiniNumero}>1</Text>
            <Text style={styles.resumenMiniLabel}>Ruta</Text>
          </View>

          <View style={styles.resumenMiniCard}>
            <Text style={styles.resumenMiniNumero}>✓</Text>
            <Text style={styles.resumenMiniLabel}>Listo</Text>
          </View>
        </View>
      </View>

      {/* ========================================
          SALUDO
      ======================================== */}

      <View style={styles.bienvenida}>
        <Text style={styles.bienvenidaTitulo}>
          Hola, {nombreUsuario} 👋
        </Text>

        <Text style={styles.bienvenidaTexto}>
          Revisa la ruta asignada por el encargado
          antes de iniciar tu ruta.
        </Text>
      </View>

      {/* ========================================
          ERROR
      ======================================== */}

      {error !== "" && (
        <View style={styles.errorCard}>
          <Text style={styles.errorIcono}>
            ⚠️
          </Text>

          <View style={styles.errorContenido}>
            <Text style={styles.errorTitulo}>
              Ocurrió un problema
            </Text>

            <Text style={styles.errorTexto}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.reintentarBoton}
              onPress={() => cargarCargas()}
            >
              <Text style={styles.reintentarTexto}>
                🔄 Intentar nuevamente
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========================================
          LISTA DE CARGAS
      ======================================== */}

      <ScrollView
        contentContainerStyle={styles.scrollContenido}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => cargarCargas(true)}
            colors={["#FF9900"]}
            tintColor="#FF9900"
          />
        }
        showsVerticalScrollIndicator={false}
      >

        {/* ======================================
            CONTADOR
        ====================================== */}

        <View style={styles.resumenCard}>

          <View>
            <Text style={styles.resumenTitulo}>
              Rutas pendientes de iniciar
            </Text>

            <Text style={styles.resumenSubtitulo}>
              Rutas por iniciar
            </Text>
          </View>

          <View style={styles.contador}>
            <Text style={styles.contadorTexto}>
              {cargas.length}
            </Text>
          </View>

        </View>

        {/* ======================================
            SIN CARGAS
        ====================================== */}

        {cargas.length === 0 ? (

          <View style={styles.vacioCard}>

            <Text style={styles.vacioIcono}>
              📦
            </Text>

            <Text style={styles.vacioTitulo}>
              No tienes rutas pendientes de iniciar
            </Text>

            <Text style={styles.vacioTexto}>
              Cuando el encargado registre una
              ruta para ti, aparecerá aquí para
              que puedas iniciarla.
            </Text>

            <TouchableOpacity
              style={styles.actualizarBoton}
              onPress={() => cargarCargas(true)}
              disabled={actualizando}
            >
              <Text style={styles.actualizarTexto}>
                🔄 Actualizar
              </Text>
            </TouchableOpacity>

          </View>

        ) : (

          cargas.map((carga) => {

            const estaAceptando =
              aceptandoId === carga.id;
            const estadoCarga = getEstadoCarga(carga);

            return (
              <View
                key={carga.id}
                style={styles.cargaCard}
              >

                {/* ==============================
                    CABECERA DE LA CARGA
                ============================== */}

                <View style={styles.cargaHeader}>

                  <View>
                    <Text style={styles.cargaTitulo}>
                      🚰 Carga #{carga.id}
                    </Text>

                    <Text style={styles.cargaFecha}>
                      {formatearFecha(
                        carga.fechaHora
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      estadoCarga.includes("TRÁNSITO") || estadoCarga.includes("TRANSITO")
                        ? styles.estadoTransito
                        : styles.estadoPendiente
                    }
                  >
                    <Text
                      style={
                        estadoCarga.includes("TRÁNSITO") || estadoCarga.includes("TRANSITO")
                          ? styles.estadoTransitoTexto
                          : styles.estadoPendienteTexto
                      }
                    >
                      {estadoCarga}
                    </Text>
                  </View>

                </View>

                {/* ==============================
                    SEPARADOR
                ============================== */}

                <View style={styles.separador} />

                {/* ==============================
                    INFORMACIÓN
                ============================== */}

                <View style={styles.informacionCarga}>

                  <View style={styles.datoFila}>

                    <View style={styles.datoIcono}>
                      <Text>
                        💧
                      </Text>
                    </View>

                    <View style={styles.datoContenido}>
                      <Text style={styles.datoEtiqueta}>
                        Tipo de garrafón
                      </Text>

                      <Text style={styles.datoValor}>
                        {obtenerNombreGarrafon(carga)}
                      </Text>
                    </View>

                  </View>

                  <View style={styles.datoFila}>

                    <View style={styles.datoIcono}>
                      <Text>
                        🔢
                      </Text>
                    </View>

                    <View style={styles.datoContenido}>
                      <Text style={styles.datoEtiqueta}>
                        Cantidad asignada
                      </Text>

                      <Text style={styles.cantidadValor}>
                        {carga.cantidad}{" "}
                        {obtenerUnidad(carga)}
                      </Text>
                    </View>

                  </View>

                  <View style={styles.datoFila}>

                    <View style={styles.datoIcono}>
                      <Text>
                        👤
                      </Text>
                    </View>

                    <View style={styles.datoContenido}>
                      <Text style={styles.datoEtiqueta}>
                        Repartidor
                      </Text>

                      <Text style={styles.datoValor}>
                        {carga.repartidorNombre ||
                          carga.repartidor?.nombre ||
                          usuario?.nombre ||
                          "Sin nombre"}
                      </Text>
                    </View>

                  </View>

                </View>

                {/* ==============================
                    AVISO
                ============================== */}

                <View style={styles.avisoCard}>

                  <Text style={styles.avisoIcono}>
                    ℹ️
                  </Text>

                  <Text style={styles.avisoTexto}>
                    Confirma la ruta únicamente
                    después de verificar físicamente
                    la cantidad recibida.
                  </Text>

                </View>

                {/* ==============================
                    BOTÓN ACEPTAR
                ============================== */}

                <TouchableOpacity
                  style={[
                    styles.aceptarBoton,
                    estaAceptando &&
                      styles.botonDeshabilitado,
                  ]}
                  onPress={() =>
                    aceptarCarga(carga)
                  }
                  disabled={estaAceptando}
                  activeOpacity={0.8}
                >

                  {estaAceptando ? (

                    <>
                      <ActivityIndicator
                        size="small"
                        color="#fff"
                      />

                      <Text style={styles.aceptarTexto}>
                        Iniciando...
                      </Text>
                    </>

                  ) : (

                    <Text style={styles.aceptarTexto}>
                      ✅ Iniciar ruta
                    </Text>

                  )}

                </TouchableOpacity>

              </View>
            );
          })

        )}

        {/* ======================================
            INFORMACIÓN DE HU-006
        ====================================== */}

        {cargas.length > 0 && (
          <View style={styles.pieInfo}>

            <Text style={styles.pieInfoTitulo}>
              🚚 Antes de iniciar tu ruta
            </Text>

            <Text style={styles.pieInfoTexto}>
              Verifica que la cantidad de garrafones
              mostrada coincida con la carga física
              recibida en planta.
            </Text>

          </View>
        )}

      </ScrollView>

    </View>
  );
}

// ==================================================
// ESTILOS
// ==================================================

const styles = StyleSheet.create({

  contenedor: {
    flex: 1,
    backgroundColor: "#0e1115",
  },

  // ================================================
  // HEADER
  // ================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#101319",
    borderBottomWidth: 1,
    borderBottomColor: "#2D3B4E",
  },

  iconoHeaderContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,153,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconoHeader: {
    fontSize: 27,
  },

  headerTexto: {
    marginLeft: 12,
    flex: 1,
  },

  titulo: {
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "700",
  },

  subtitulo: {
    color: "#8D9DB6",
    fontSize: 13,
    marginTop: 2,
  },

  // ================================================
  // BIENVENIDA
  // ================================================

  perfilCard: {
    backgroundColor: "#171c24",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D3B4E",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  perfilHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  perfilAvatarContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#005E9E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  perfilAvatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },

  perfilInfo: {
    flex: 1,
  },

  perfilNombre: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },

  perfilRol: {
    marginTop: 2,
    fontSize: 12,
    color: "#FF9900",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  perfilEmail: {
    marginTop: 4,
    fontSize: 12,
    color: "#8D9DB6",
  },

  logoutButton: {
    backgroundColor: "#1A2332",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
  },

  logoutButtonText: {
    color: "#FF9900",
    fontWeight: "700",
    fontSize: 11,
  },

  perfilResumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 8,
  },

  resumenMiniCard: {
    flex: 1,
    backgroundColor: "#1A2332",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  resumenMiniNumero: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF9900",
  },

  resumenMiniLabel: {
    marginTop: 3,
    fontSize: 11,
    color: "#8D9DB6",
    fontWeight: "600",
  },

  bienvenida: {
    backgroundColor: "#101319",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3B4E",
  },

  bienvenidaTitulo: {
    fontSize: 19,
    fontWeight: "700",
    color: "#ffffff",
  },

  bienvenidaTexto: {
    marginTop: 5,
    color: "#8D9DB6",
    fontSize: 14,
    lineHeight: 20,
  },

  // ================================================
  // SCROLL
  // ================================================

  scrollContenido: {
    padding: 16,
    paddingBottom: 35,
  },

  // ================================================
  // RESUMEN
  // ================================================

  resumenCard: {
    backgroundColor: "#171c24",
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#2D3B4E",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  resumenTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },

  resumenSubtitulo: {
    marginTop: 3,
    fontSize: 12,
    color: "#8D9DB6",
  },

  contador: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#FF9900",
    alignItems: "center",
    justifyContent: "center",
  },

  contadorTexto: {
    color: "#101319",
    fontSize: 19,
    fontWeight: "700",
  },

  // ================================================
  // CARGA
  // ================================================

  cargaCard: {
    backgroundColor: "#171c24",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2D3B4E",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cargaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cargaTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },

  cargaFecha: {
    marginTop: 4,
    fontSize: 12,
    color: "#8D9DB6",
  },

  estadoPendiente: {
    backgroundColor: "rgba(255,153,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  estadoPendienteTexto: {
    color: "#FF9900",
    fontSize: 10,
    fontWeight: "700",
  },

  estadoTransito: {
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  estadoTransitoTexto: {
    color: "#4ADE80",
    fontSize: 10,
    fontWeight: "700",
  },

  separador: {
    height: 1,
    backgroundColor: "#2D3B4E",
    marginVertical: 15,
  },

  // ================================================
  // DATOS
  // ================================================

  informacionCarga: {
    gap: 14,
  },

  datoFila: {
    flexDirection: "row",
    alignItems: "center",
  },

  datoIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A2332",
    alignItems: "center",
    justifyContent: "center",
  },

  datoContenido: {
    marginLeft: 12,
    flex: 1,
  },

  datoEtiqueta: {
    fontSize: 11,
    color: "#8D9DB6",
    marginBottom: 2,
  },

  datoValor: {
    fontSize: 15,
    color: "#D4E5F5",
    fontWeight: "600",
  },

  cantidadValor: {
    fontSize: 18,
    color: "#FF9900",
    fontWeight: "700",
  },

  // ================================================
  // AVISO
  // ================================================

  avisoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1A2332",
    borderRadius: 9,
    padding: 12,
    marginTop: 18,
    marginBottom: 15,
  },

  avisoIcono: {
    fontSize: 16,
  },

  avisoTexto: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: "#8D9DB6",
    lineHeight: 18,
  },

  // ================================================
  // BOTÓN ACEPTAR
  // ================================================

  aceptarBoton: {
    backgroundColor: "#FF9900",
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  aceptarTexto: {
    color: "#101319",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },

  botonDeshabilitado: {
    opacity: 0.7,
  },

  // ================================================
  // VACÍO
  // ================================================

  vacioCard: {
    backgroundColor: "#171c24",
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2D3B4E",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  vacioIcono: {
    fontSize: 45,
    marginBottom: 12,
  },

  vacioTitulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },

  vacioTexto: {
    marginTop: 8,
    fontSize: 13,
    color: "#8D9DB6",
    lineHeight: 19,
    textAlign: "center",
  },

  actualizarBoton: {
    marginTop: 18,
    backgroundColor: "#FF9900",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },

  actualizarTexto: {
    color: "#101319",
    fontWeight: "700",
  },

  // ================================================
  // ERROR
  // ================================================

  errorCard: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    flexDirection: "row",
  },

  errorIcono: {
    fontSize: 22,
    marginRight: 10,
  },

  errorContenido: {
    flex: 1,
  },

  errorTitulo: {
    color: "#FCA5A5",
    fontSize: 15,
    fontWeight: "700",
  },

  errorTexto: {
    color: "#FCA5A5",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },

  reintentarBoton: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7,
  },

  reintentarTexto: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  // ================================================
  // CARGANDO
  // ================================================

  cargandoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0e1115",
  },

  cargandoTexto: {
    marginTop: 12,
    color: "#8D9DB6",
    fontSize: 14,
  },

  // ================================================
  // PIE
  // ================================================

  pieInfo: {
    marginTop: 5,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#171c24",
    borderWidth: 1,
    borderColor: "#2D3B4E",
  },

  pieInfoTitulo: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },

  pieInfoTexto: {
    marginTop: 5,
    color: "#8D9DB6",
    fontSize: 12,
    lineHeight: 18,
  },
});

export default CargasRepartidor;