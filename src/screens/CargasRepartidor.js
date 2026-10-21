
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import api from "../config/api";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  primary: "#008FB5",
  turquoise: "#29C9D4",
  deep: "#07556B",
  ice: "#E6F8FA",
  background: "#EFFAFF",
  white: "#FFFFFF",
  text: "#173C4A",
  muted: "#668491",
  border: "#D3ECF2",
  success: "#13856E",
  successBg: "#E0F7EF",
  warning: "#B77B17",
  warningBg: "#FFF5D9",
  danger: "#B83D4B",
  dangerBg: "#FFF0F1",
};

export default function CargasRepartidor({ navigation }) {
  const { usuario, cerrarSesion } = useAuth();

  const repartidorId =
    usuario?.id ??
    usuario?.idUsuario ??
    usuario?.id_usuario;

  const nombreUsuario =
    usuario?.nombre || usuario?.name || "Repartidor";

  const emailUsuario =
    usuario?.email || usuario?.correo || "Sin correo";

  const rolUsuario =
    usuario?.rol || usuario?.role || "Repartidor";

  const [cargas, setCargas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [aceptandoId, setAceptandoId] = useState(null);
  const [error, setError] = useState("");

  // Evita solicitudes duplicadas por doble pulsación.
  const aceptacionEnProceso = useRef(false);

  const getEstadoCarga = (carga) => {
    const estado =
      carga?.estado ??
      carga?.status ??
      carga?.estadoCarga ??
      carga?.situacion ??
      "PENDIENTE";

    const texto = String(estado).toUpperCase();

    if (
      texto.includes("TRANSITO") ||
      texto.includes("TRÁNSITO") ||
      texto.includes("TRANSIT")
    ) {
      return "EN TRÁNSITO";
    }

    return texto || "PENDIENTE";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    try {
      const valor = new Date(fecha);

      if (Number.isNaN(valor.getTime())) {
        return String(fecha);
      }

      return valor.toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return String(fecha);
    }
  };

  const obtenerNombreGarrafon = (carga) =>
    carga?.inventarioNombre ||
    carga?.tipoGarrafon ||
    carga?.inventario?.nombre ||
    "Garrafón";

  const obtenerUnidad = (carga) =>
    carga?.unidadMedida ||
    carga?.inventario?.unidadMedida ||
    "unidades";

  const obtenerMensajeError = (err) => {
    const datos = err?.response?.data;

    if (typeof datos === "string") {
      return datos;
    }

    return (
      datos?.message ||
      datos?.mensaje ||
      datos?.error ||
      err?.message ||
      "Error desconocido"
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas salir de AquaRuta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            try {
              await cerrarSesion();
            } catch {
              Alert.alert(
                "Error",
                "No se pudo cerrar la sesión."
              );
            }
          },
        },
      ]
    );
  };

  const cargarCargas = async (esActualizacion = false) => {
    if (!repartidorId) {
      setError("No se pudo identificar al repartidor.");
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

      const response = await api.get(
        `/cargas/repartidor/${repartidorId}/pendientes`
      );

      const respuesta = response.data;

      let listaCargas = [];

      if (Array.isArray(respuesta)) {
        listaCargas = respuesta;
      } else if (Array.isArray(respuesta?.data)) {
        listaCargas = respuesta.data;
      } else if (Array.isArray(respuesta?.cargas)) {
        listaCargas = respuesta.cargas;
      }

      const pendientes = listaCargas.filter((carga) => {
        const estado = getEstadoCarga(carga);

        return !estado.includes("TRÁNSITO");
      });

      setCargas(pendientes);
    } catch (err) {
      console.error("Error al cargar las cargas:", err);

      setError(obtenerMensajeError(err));

      if (!esActualizacion) {
        setCargas([]);
      }
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCargas();
    }, [repartidorId])
  );

  const aceptarCarga = (carga) => {
    if (aceptacionEnProceso.current) return;

    Alert.alert(
      "Confirmar recepción",
      `¿Recibiste ${carga.cantidad} ${obtenerUnidad(
        carga
      )} de ${obtenerNombreGarrafon(carga)}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar carga",
          onPress: () => confirmarAceptacion(carga),
        },
      ]
    );
  };

  const confirmarAceptacion = async (carga) => {
    if (aceptacionEnProceso.current) return;

    aceptacionEnProceso.current = true;
    setAceptandoId(carga.id);
    setError("");

    try {
      await api.put(`/cargas/${carga.id}/aceptar`);

      Alert.alert(
        "¡Carga recibida!",
        "Tu carga fue aceptada correctamente y ahora está en tránsito.",
        [
          {
            text: "Continuar",
            onPress: () => cargarCargas(true),
          },
        ]
      );
    } catch (err) {
      Alert.alert("No se pudo aceptar", obtenerMensajeError(err));
    } finally {
      aceptacionEnProceso.current = false;
      setAceptandoId(null);
    }
  };

  if (!repartidorId) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar
          backgroundColor={COLORS.deep}
          barStyle="light-content"
        />

        <Text style={styles.centerIcon}>💧</Text>

        <Text style={styles.centerTitle}>
          Sesión no disponible
        </Text>

        <Text style={styles.centerDescription}>
          No se pudo identificar al repartidor.
          Cierra sesión e inicia nuevamente.
        </Text>
      </View>
    );
  }

  if (cargando) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar
          backgroundColor={COLORS.deep}
          barStyle="light-content"
        />

        <View style={styles.loadingCircle}>
          <Text style={styles.loadingIcon}>💧</Text>
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.centerTitle}>
          AquaRuta
        </Text>

        <Text style={styles.centerDescription}>
          Preparando tus cargas...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.deep}
        barStyle="light-content"
      />

      {/* ENCABEZADO */}

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandEmoji}>💧</Text>
          </View>

          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>
              AquaRuta
            </Text>

            <Text style={styles.brandSubtitle}>
              Purificadora · Repartidores
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>
              Salir
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerBottom}>
          <Text style={styles.headerGreeting}>
            Hola, {nombreUsuario} 👋
          </Text>

          <Text style={styles.headerDescription}>
            Tu agua, tu ruta, tus entregas.
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => cargarCargas(true)}
            colors={[COLORS.primary, COLORS.turquoise]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* PERFIL DEL REPARTIDOR */}

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {nombreUsuario.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {nombreUsuario}
              </Text>

              <Text style={styles.profileRole}>
                {String(rolUsuario)}
              </Text>

              <Text
                style={styles.profileEmail}
                numberOfLines={1}
              >
                {emailUsuario}
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>
                ● Activo
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {cargas.length}
              </Text>

              <Text style={styles.statLabel}>
                Pendientes
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                🚚
              </Text>

              <Text style={styles.statLabel}>
                Mi ruta
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                💧
              </Text>

              <Text style={styles.statLabel}>
                AquaRuta
              </Text>
            </View>
          </View>
        </View>

        {/* MENSAJE DE BIENVENIDA */}

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeEmoji}>
              🚰
            </Text>
          </View>

          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              ¡Prepara tu ruta!
            </Text>

            <Text style={styles.welcomeDescription}>
              Verifica los garrafones asignados
              antes de salir de la purificadora.
            </Text>
          </View>
        </View>

        {/* ERRORES */}

        {error !== "" && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              ⚠️ No se pudieron consultar las cargas
            </Text>

            <Text style={styles.errorDescription}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => cargarCargas()}
            >
              <Text style={styles.retryText}>
                Intentar nuevamente
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TÍTULO DE LA LISTA */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Mis cargas
            </Text>

            <Text style={styles.sectionSubtitle}>
              Asignaciones por confirmar
            </Text>
          </View>

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {cargas.length}
            </Text>
          </View>
        </View>

        {/* LISTA DE CARGAS */}

        {cargas.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>
                📦
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              Todo está al día
            </Text>

            <Text style={styles.emptyDescription}>
              No tienes cargas pendientes.
              Cuando el encargado te asigne una
              nueva carga, aparecerá aquí.
            </Text>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => cargarCargas(true)}
              disabled={actualizando}
            >
              <Text style={styles.refreshText}>
                ↻ Actualizar cargas
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          cargas.map((carga) => {
            const estaAceptando =
              aceptandoId === carga.id;

            const estadoCarga =
              getEstadoCarga(carga);

            const enTransito =
              estadoCarga.includes("TRÁNSITO");

            return (
              <View
                key={String(carga.id)}
                style={styles.loadCard}
              >
                <View style={styles.loadHeader}>
                  <View style={styles.loadTitleGroup}>
                    <View style={styles.loadIconBox}>
                      <Text style={styles.loadIcon}>
                        💧
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.loadTitle}>
                        Carga #{carga.id}
                      </Text>

                      <Text style={styles.loadDate}>
                        {formatearFecha(
                          carga.fechaHora
                        )}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      enTransito
                        ? styles.statusTransit
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        enTransito
                          ? styles.statusTransitText
                          : styles.statusPendingText,
                      ]}
                    >
                      {estadoCarga}
                    </Text>
                  </View>
                </View>

                <View style={styles.line} />

                <View style={styles.detailRow}>
                  <View style={styles.detailIconBox}>
                    <Text style={styles.detailIcon}>
                      🚰
                    </Text>
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      Tipo de garrafón
                    </Text>

                    <Text style={styles.detailValue}>
                      {obtenerNombreGarrafon(carga)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIconBox}>
                    <Text style={styles.detailIcon}>
                      📦
                    </Text>
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      Cantidad asignada
                    </Text>

                    <Text style={styles.quantityValue}>
                      {carga.cantidad}{" "}
                      {obtenerUnidad(carga)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIconBox}>
                    <Text style={styles.detailIcon}>
                      👤
                    </Text>
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      Repartidor asignado
                    </Text>

                    <Text style={styles.detailValue}>
                      {carga.repartidorNombre ||
                        carga.repartidor?.nombre ||
                        nombreUsuario}
                    </Text>
                  </View>
                </View>

                <View style={styles.notice}>
                  <Text style={styles.noticeText}>
                    ℹ️ Verifica físicamente los
                    garrafones antes de confirmar
                    la recepción.
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.acceptButton,
                    aceptandoId !== null &&
                      styles.disabledButton,
                  ]}
                  onPress={() => aceptarCarga(carga)}
                  disabled={aceptandoId !== null}
                >
                  {estaAceptando ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color={COLORS.white}
                      />

                      <Text style={styles.acceptText}>
                        Confirmando...
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.acceptText}>
                      ✓ Aceptar carga
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* INFORMACIÓN FINAL */}

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>
            💧 Antes de iniciar tu ruta
          </Text>

          <Text style={styles.footerDescription}>
            Confirma que la cantidad de garrafones
            registrada coincida con la carga
            física que recibiste en planta.
          </Text>
        </View>

        <Text style={styles.footerBrand}>
          AQUARUTA · AGUA PURIFICADA
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 48,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  brandEmoji: {
    fontSize: 27,
  },

  brandText: {
    flex: 1,
  },

  brandTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  brandSubtitle: {
    color: "#D9F8FF",
    fontSize: 11,
    marginTop: 2,
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  logoutText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 12,
  },

  headerBottom: {
    marginTop: 26,
  },

  headerGreeting: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
  },

  headerDescription: {
    color: "#D9F8FF",
    fontSize: 13,
    marginTop: 5,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    marginTop: -25,
  },

  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: COLORS.deep,
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.ice,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "800",
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    color: COLORS.deep,
    fontSize: 17,
    fontWeight: "800",
  },

  profileRole: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 3,
  },

  profileEmail: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  activeBadge: {
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 5,
  },

  activeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "800",
  },

  statsRow: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  statDivider: {
    height: 35,
    width: 1,
    backgroundColor: COLORS.border,
  },

  welcomeCard: {
    backgroundColor: COLORS.ice,
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  welcomeIcon: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  welcomeEmoji: {
    fontSize: 25,
  },

  welcomeContent: {
    flex: 1,
  },

  welcomeTitle: {
    color: COLORS.deep,
    fontSize: 16,
    fontWeight: "800",
  },

  welcomeDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.deep,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },

  counter: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  counterText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },

  loadCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: COLORS.deep,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  loadHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  loadTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  loadIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.ice,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  loadIcon: {
    fontSize: 23,
  },

  loadTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.deep,
  },

  loadDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusPending: {
    backgroundColor: COLORS.warningBg,
  },

  statusTransit: {
    backgroundColor: COLORS.successBg,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  statusPendingText: {
    color: COLORS.warning,
  },

  statusTransitText: {
    color: COLORS.success,
  },

  line: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 17,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  detailIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  detailIcon: {
    fontSize: 21,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  quantityValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
  },

  notice: {
    backgroundColor: COLORS.ice,
    padding: 13,
    borderRadius: 13,
    marginBottom: 15,
  },

  noticeText: {
    color: COLORS.deep,
    fontSize: 12,
    lineHeight: 19,
  },

  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  acceptText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    marginHorizontal: 5,
  },

  disabledButton: {
    opacity: 0.5,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 22,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: COLORS.ice,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyIcon: {
    fontSize: 39,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.deep,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
  },

  refreshButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },

  refreshText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
  },

  errorCard: {
    backgroundColor: COLORS.dangerBg,
    padding: 17,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F8CCD1",
  },

  errorTitle: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "800",
  },

  errorDescription: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 7,
    lineHeight: 18,
  },

  retryButton: {
    marginTop: 13,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  retryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  footerCard: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 18,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.turquoise,
  },

  footerTitle: {
    color: COLORS.deep,
    fontSize: 14,
    fontWeight: "800",
  },

  footerDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  footerBrand: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 26,
    fontWeight: "700",
  },

  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  centerIcon: {
    fontSize: 45,
    marginBottom: 16,
  },

  centerTitle: {
    color: COLORS.deep,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 16,
    textAlign: "center",
  },

  centerDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },

  loadingCircle: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.ice,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  loadingIcon: {
    fontSize: 43,
  },
});
