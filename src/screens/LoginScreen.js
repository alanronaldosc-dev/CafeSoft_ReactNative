
import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import api, { checkBackendHealth } from "../config/api";
import { useAuth } from "../context/AuthContext";

// ============================================
// COLORES AQUASOFT
// ============================================

const COLORS = {
  primary: "#008FB5",
  turquoise: "#29C9D4",
  deep: "#07556B",
  dark: "#043A4C",
  ice: "#E6F8FA",
  background: "#EFFAFF",
  white: "#FFFFFF",
  text: "#173C4A",
  muted: "#668491",
  border: "#D3ECF2",
  success: "#13856E",
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const ROLES = [
  "Cliente",
  "Administrador",
  "Empleado",
  "Repartidor",
];

const obtenerRolPorTipo = (userTipo) => {
  const tipo = Number(userTipo);

  switch (tipo) {
    case 0:
      return "Administrador";
    case 1:
      return "Empleado";
    case 2:
      return "Cliente";
    case 4:
      return "Repartidor";
    default:
      return null;
  }
};

// ============================================
// ANIMACIÓN DE CAMIONETA
// ============================================

function CamionetaAnimada() {
  const movimiento = useRef(new Animated.Value(-120)).current;
  const ruedas = useRef(new Animated.Value(0)).current;
  const gotas = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacionCamion = Animated.loop(
      Animated.timing(movimiento, {
        toValue: SCREEN_WIDTH + 120,
        duration: 5500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const animacionRuedas = Animated.loop(
      Animated.timing(ruedas, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const animacionGotas = Animated.loop(
      Animated.sequence([
        Animated.timing(gotas, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(gotas, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    animacionCamion.start();
    animacionRuedas.start();
    animacionGotas.start();

    return () => {
      animacionCamion.stop();
      animacionRuedas.stop();
      animacionGotas.stop();
    };
  }, [movimiento, ruedas, gotas]);

  const rotacion = ruedas.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const opacidadGotas = gotas.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.animationContainer}>
      <Animated.View
        style={[
          styles.waterDropOne,
          { opacity: opacidadGotas },
        ]}
      >
        <Text style={styles.waterDropText}>💧</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.waterDropTwo,
          { opacity: opacidadGotas },
        ]}
      >
        <Text style={styles.waterDropText}>💧</Text>
      </Animated.View>

      <Text style={styles.animationSubtitle}>
        Agua purificada hasta tu hogar
      </Text>

      <View style={styles.roadScene}>
        <Animated.View
          style={[
            styles.truckContainer,
            {
              transform: [
                { translateX: movimiento },
              ],
            },
          ]}
        >
          <View style={styles.truckBody}>
            <View style={styles.truckCargo}>
              <Text style={styles.truckLogo}>💧</Text>
              <Text style={styles.truckBrand}>AquaSoft</Text>
            </View>

            <View style={styles.truckCab}>
              <View style={styles.truckWindow} />
              <View style={styles.truckLight} />
            </View>
          </View>

          <View style={styles.wheelsRow}>
            <Animated.View
              style={[
                styles.wheel,
                { transform: [{ rotate: rotacion }] },
              ]}
            >
              <View style={styles.wheelCenter} />
            </Animated.View>

            <Animated.View
              style={[
                styles.wheel,
                { transform: [{ rotate: rotacion }] },
              ]}
            >
              <View style={styles.wheelCenter} />
            </Animated.View>
          </View>
        </Animated.View>

        <View style={styles.road}>
          <View style={styles.roadLines}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.roadLine} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================
// PANTALLA LOGIN AQUASOFT
// ============================================

export default function LoginScreen({ navigation }) {
  const { iniciarSesion } = useAuth();

  const [selectedRole, setSelectedRole] =
    useState("Cliente");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showRoleDropdown, setShowRoleDropdown] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);

  // ============================================
  // OBTENER DATOS DEL USUARIO
  // ============================================

  const obtenerUsuario = (responseData, fallbackEmail) => {
    const source =
      responseData?.usuario ??
      responseData?.user ??
      responseData?.data?.usuario ??
      responseData?.data?.user ??
      responseData?.data ??
      responseData?.result ??
      {};

    const usuario = Array.isArray(source)
      ? source[0]
      : source;

    const userTipo =
      usuario?.userTipo ??
      usuario?.tipoUsuario ??
      responseData?.userTipo ??
      responseData?.tipoUsuario;

    const rolBackend =
      usuario?.rol ??
      usuario?.role ??
      usuario?.tipoRol ??
      obtenerRolPorTipo(userTipo);

    return {
      ...usuario,

      id:
        usuario?.id ??
        usuario?.idUsuario ??
        usuario?.userId ??
        responseData?.id ??
        responseData?.idUsuario,

      nombre:
        usuario?.nombre ??
        usuario?.name ??
        usuario?.username ??
        "Usuario",

      email:
        usuario?.email ??
        usuario?.correo ??
        fallbackEmail,

      userTipo,

      rol: rolBackend ?? selectedRole,
    };
  };

  // ============================================
  // INICIAR SESIÓN
  // ============================================

  const handleLogin = async () => {
    if (loading) return;

    const trimmedEmail = email.trim().toLowerCase();
    const passwordValue = password;

    if (!trimmedEmail || !passwordValue) {
      Alert.alert(
        "Datos incompletos",
        "El correo y la contraseña son obligatorios."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        "Correo inválido",
        "Ingresa un correo electrónico válido."
      );
      return;
    }

    if (passwordValue.length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe contener al menos 8 caracteres."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/usuarios/login",
        {
          email: trimmedEmail,
          password: passwordValue,
        }
      );

      const usuario = obtenerUsuario(
        response.data,
        trimmedEmail
      );

      if (!usuario?.id && !usuario?.email) {
        Alert.alert(
          "Error",
          "No fue posible obtener la información del usuario."
        );
        return;
      }

      const token =
        response.data?.token ??
        response.data?.data?.token ??
        null;

      if (!token) {
        Alert.alert(
          "Error de autenticación",
          "El servidor no proporcionó un token de acceso."
        );
        return;
      }

      await iniciarSesion(usuario, token);

      // AppNavigator cambia automáticamente
      // a la pantalla correspondiente al usuario.

    } catch (error) {
      const status = error?.response?.status;

      if (status === 429) {
        Alert.alert(
          "Cuenta bloqueada",
          "Has realizado demasiados intentos fallidos. Intenta nuevamente más tarde."
        );
        return;
      }

      if (status === 401) {
        Alert.alert(
          "Acceso denegado",
          "Correo o contraseña incorrectos."
        );
        return;
      }

      if (status === 403) {
        Alert.alert(
          "Acceso no autorizado",
          "Tu usuario no tiene permiso para realizar esta operación."
        );
        return;
      }

      if (status === 400) {
        Alert.alert(
          "Datos inválidos",
          "Verifica la información ingresada."
        );
        return;
      }

      if (status >= 500) {
        Alert.alert(
          "Error del servidor",
          "Ocurrió un problema en el servidor. Intenta nuevamente."
        );
        return;
      }

      if (!error?.response) {
        Alert.alert(
          "Error de conexión",
          "No fue posible conectarse con el servidor. Verifica tu conexión y que la API esté encendida."
        );
        return;
      }

      Alert.alert(
        "Error de inicio de sesión",
        "No fue posible iniciar sesión. Intenta nuevamente."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    if (checkingConnection) return;
    setCheckingConnection(true);
    try {
      await checkBackendHealth();
      Alert.alert("Conexión disponible", "El servidor y su base de datos responden correctamente.");
    } catch {
      Alert.alert("Sin conexión", "No se pudo comprobar la conexión. Revisa tu acceso a internet e inténtalo nuevamente.");
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Recuperar contraseña",
      "La recuperación de contraseña aún no está disponible."
    );
  };

  // ============================================
  // INTERFAZ
  // ============================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.deep}
      />

      <LinearGradient
        colors={[
          COLORS.deep,
          COLORS.primary,
          COLORS.turquoise,
        ]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ENCABEZADO AQUASOFT */}

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>💧</Text>
            </View>

            <Text style={styles.appName}>
              AquaSoft
            </Text>

            <Text style={styles.appTagline}>
              Pureza que llega hasta ti
            </Text>

            {/* CAMIONETA ANIMADA */}

            <CamionetaAnimada />
          </View>

          {/* FORMULARIO */}

          <View style={styles.formCard}>
            <View style={styles.formTopLine} />

            <Text style={styles.title}>
              ¡Bienvenido!
            </Text>

            <Text style={styles.subtitle}>
              Inicia sesión y disfruta de AquaSoft.
            </Text>

            {/* ROL */}

            <Text style={styles.label}>
              TIPO DE USUARIO
            </Text>

            <TouchableOpacity
              style={styles.input}
              disabled={loading}
              activeOpacity={0.8}
              onPress={() =>
                setShowRoleDropdown((actual) => !actual)
              }
            >
              <Text style={styles.inputIcon}>👤</Text>

              <Text style={styles.inputText}>
                {selectedRole}
              </Text>

              <Text style={styles.dropdownArrow}>
                {showRoleDropdown ? "▴" : "▾"}
              </Text>
            </TouchableOpacity>

            {showRoleDropdown && (
              <View style={styles.dropdown}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role}
                    disabled={loading}
                    style={[
                      styles.dropdownItem,
                      selectedRole === role &&
                        styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedRole(role);
                      setShowRoleDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        selectedRole === role &&
                          styles.dropdownTextActive,
                      ]}
                    >
                      {role}
                    </Text>

                    {selectedRole === role && (
                      <Text style={styles.checkIcon}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* CORREO */}

            <Text style={styles.label}>
              CORREO ELECTRÓNICO
            </Text>

            <View style={styles.input}>
              <Text style={styles.inputIcon}>✉️</Text>

              <TextInput
                style={styles.textInput}
                placeholder="tu@correo.com"
                placeholderTextColor={COLORS.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            {/* CONTRASEÑA */}

            <Text style={styles.label}>
              CONTRASEÑA
            </Text>

            <View style={styles.input}>
              <Text style={styles.inputIcon}>🔒</Text>

              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                disabled={loading}
                onPress={() =>
                  setShowPassword((actual) => !actual)
                }
              >
                <Text style={styles.passwordIcon}>
                  {showPassword ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* RECUPERAR CONTRASEÑA */}

            <TouchableOpacity
              style={styles.forgotPassword}
              disabled={loading}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* BOTÓN LOGIN */}

            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.85}
              style={[
                styles.buttonWrapper,
                loading && styles.buttonDisabled,
              ]}
              disabled={loading}
            >
              <LinearGradient
                colors={
                  loading
                    ? ["#8AAFB9", "#8AAFB9"]
                    : [COLORS.primary, COLORS.turquoise]
                }
                style={styles.loginButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={COLORS.white}
                    />

                    <Text style={styles.loginButtonText}>
                      Iniciando sesión...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>
                      Iniciar sesión
                    </Text>

                    <Text style={styles.loginButtonArrow}>
                      →
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCheckConnection}
              disabled={checkingConnection || loading}
              accessibilityRole="button"
              style={{ alignItems: "center", paddingVertical: 12 }}
            >
              <Text style={styles.forgotPasswordText}>
                {checkingConnection ? "Comprobando conexión..." : "Comprobar conexión"}
              </Text>
            </TouchableOpacity>

            {/* REGISTRO */}

            <View style={styles.registerLink}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta?{" "}
              </Text>

              <TouchableOpacity
                disabled={loading}
                onPress={() =>
                  navigation.navigate("Register")
                }
              >
                <Text style={styles.registerLinkText}>
                  Regístrate
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                💧 AQUASOFT · AGUA PURIFICADA
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================
// ESTILOS AQUASOFT
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deep,
  },

  scroll: {
    flexGrow: 1,
    paddingTop: 20,
  },

  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },

  logoCircle: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  logoEmoji: {
    fontSize: 40,
  },

  appName: {
    fontSize: 37,
    fontWeight: "900",
    color: COLORS.white,
    marginTop: 12,
    letterSpacing: 1,
  },

  appTagline: {
    color: "#D8F8FC",
    fontSize: 13,
    marginTop: 5,
  },

  // ============================================
  // ANIMACIÓN
  // ============================================

  animationContainer: {
    width: "100%",
    height: 180,
    marginTop: 15,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  animationSubtitle: {
    position: "absolute",
    top: 15,
    alignSelf: "center",
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },

  waterDropOne: {
    position: "absolute",
    top: 45,
    left: 35,
  },

  waterDropTwo: {
    position: "absolute",
    top: 60,
    right: 45,
  },

  waterDropText: {
    fontSize: 23,
  },

  roadScene: {
    height: 115,
    justifyContent: "flex-end",
  },

  truckContainer: {
    position: "absolute",
    bottom: 27,
    left: 0,
    width: 125,
    height: 77,
    zIndex: 3,
  },

  truckBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 55,
  },

  truckCargo: {
    width: 82,
    height: 49,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 4,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ice,
    alignItems: "center",
    justifyContent: "center",
  },

  truckLogo: {
    fontSize: 20,
  },

  truckBrand: {
    color: COLORS.deep,
    fontSize: 10,
    fontWeight: "900",
  },

  truckCab: {
    width: 40,
    height: 39,
    backgroundColor: COLORS.turquoise,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.ice,
    justifyContent: "center",
    paddingLeft: 5,
  },

  truckWindow: {
    width: 22,
    height: 17,
    borderTopRightRadius: 7,
    backgroundColor: COLORS.deep,
  },

  truckLight: {
    position: "absolute",
    right: -3,
    bottom: 6,
    width: 6,
    height: 9,
    borderRadius: 3,
    backgroundColor: "#FFF2A8",
  },

  wheelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -6,
    width: 117,
  },

  wheel: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#16333D",
    borderWidth: 4,
    borderColor: "#0A2530",
    alignItems: "center",
    justifyContent: "center",
  },

  wheelCenter: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },

  road: {
    height: 28,
    backgroundColor: COLORS.dark,
    justifyContent: "center",
    borderTopWidth: 3,
    borderTopColor: "#B5F4F9",
  },

  roadLines: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  roadLine: {
    width: 33,
    height: 3,
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },

  // ============================================
  // FORMULARIO
  // ============================================

  formCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 35,
    flexGrow: 1,
  },

  formTopLine: {
    width: 48,
    height: 5,
    borderRadius: 10,
    backgroundColor: COLORS.turquoise,
    alignSelf: "center",
    marginBottom: 23,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.deep,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 6,
    marginBottom: 23,
  },

  label: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.deep,
    letterSpacing: 1.1,
    marginBottom: 9,
    marginTop: 15,
  },

  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 15,
    paddingHorizontal: 15,
    minHeight: 55,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 11,
  },

  inputText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
  },

  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 12,
  },

  dropdownArrow: {
    fontSize: 16,
    color: COLORS.primary,
  },

  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginTop: 7,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  dropdownItemActive: {
    backgroundColor: COLORS.ice,
  },

  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  dropdownTextActive: {
    fontWeight: "800",
    color: COLORS.primary,
  },

  checkIcon: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  passwordIcon: {
    fontSize: 17,
    marginLeft: 10,
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 13,
  },

  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  buttonWrapper: {
    marginTop: 26,
    borderRadius: 16,
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.75,
  },

  loginButton: {
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },

  loginButtonArrow: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
  },

  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 26,
    alignItems: "center",
  },

  registerText: {
    color: COLORS.muted,
    fontSize: 13,
  },

  registerLinkText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  footer: {
    alignItems: "center",
    marginTop: 35,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
});
