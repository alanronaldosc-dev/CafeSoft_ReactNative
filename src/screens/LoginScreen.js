import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';


const { width, height } = Dimensions.get('window');

const ROLES = [
  'Cliente',
  'Administrador',
  'Empleado',
];


// IMPORTANTE:
// Cambia esta IP si tu computadora tiene otra IP local.
import { BASE_URL } from '../config/api';


export default function LoginScreen({ navigation }) {

  // Usuario global
  const { iniciarSesion } = useAuth();

  const [selectedRole, setSelectedRole] =
    useState('Cliente');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showRoleDropdown,
    setShowRoleDropdown,
  ] = useState(false);

  const [cargando, setCargando] =
    useState(false);


  // =====================================================
  // OBTENER NOMBRE DEL ROL SEGÚN userTipo
  // =====================================================
  const obtenerRolUsuario = (userTipo) => {

    if (userTipo === 0) {
      return 'Administrador';
    }

    if (userTipo === 1) {
      return 'Empleado';
    }

    return 'Cliente';
  };


  // =====================================================
  // LOGIN
  // =====================================================
  const handleLogin = async () => {

    // Validar campos
    if (!email.trim()) {

      Alert.alert(
        'Correo requerido',
        'Ingresa tu correo electrónico.'
      );

      return;
    }


    if (!password.trim()) {

      Alert.alert(
        'Contraseña requerida',
        'Ingresa tu contraseña.'
      );

      return;
    }


    try {

      setCargando(true);


      // ===============================================
      // PETICIÓN A LA API
      // ===============================================
      const response = await fetch(
        `${BASE_URL}/usuarios/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },

          body: JSON.stringify({

            email:
              email.trim().toLowerCase(),

            password: password,

          }),
        }
      );


      // Intentar leer respuesta
      let data = {};

      try {

        data = await response.json();

      } catch (error) {

        console.log(
          'La API no devolvió JSON:',
          error
        );

      }


      // ===============================================
      // LOGIN INCORRECTO
      // ===============================================
      if (!response.ok) {

        throw new Error(
          data.error ||
          data.message ||
          'Correo o contraseña incorrectos'
        );

      }


      // ===============================================
      // OBTENER USUARIO
      // ===============================================
      const usuario = data.usuario;


      if (!usuario) {

        throw new Error(
          'La API no devolvió los datos del usuario.'
        );

      }


      // ===============================================
      // VALIDAR ROL
      // ===============================================
      const rolUsuario =
        obtenerRolUsuario(
          usuario.userTipo
        );


      if (
        selectedRole !== rolUsuario
      ) {

        Alert.alert(
          'Rol incorrecto',
          `Este usuario está registrado como ${rolUsuario}.`
        );

        return;
      }


      // ===============================================
      // GUARDAR USUARIO GLOBALMENTE
      // ===============================================
      iniciarSesion(usuario);


      console.log(
        'Usuario conectado:',
        usuario
      );


      // ===============================================
      // ENTRAR AL SISTEMA
      // ===============================================
      navigation.reset({

        index: 0,

        routes: [
          {
            name: 'Main',
          },
        ],

      });


    } catch (error) {

      console.error(
        'Error al iniciar sesión:',
        error
      );


      Alert.alert(
        'Inicio de sesión',
        error.message ||
        'No se pudo iniciar sesión.'
      );


    } finally {

      setCargando(false);

    }

  };


  return (

    <View style={styles.container}>


      {/* ============================================
          FONDO
      ============================================ */}

      <LinearGradient

        colors={[
          '#3D1A00',
          '#6B3A1F',
          '#3D1A00',
        ]}

        style={styles.gradient}

        start={{
          x: 0,
          y: 0,
        }}

        end={{
          x: 1,
          y: 1,
        }}

      />


      {/* Círculos decorativos */}

      <View
        style={[
          styles.decorCircle,
          styles.decorCircle1,
        ]}
      />

      <View
        style={[
          styles.decorCircle,
          styles.decorCircle2,
        ]}
      />

      <View
        style={[
          styles.decorCircle,
          styles.decorCircle3,
        ]}
      />


      <ScrollView

        contentContainerStyle={
          styles.scroll
        }

        showsVerticalScrollIndicator={
          false
        }

        keyboardShouldPersistTaps="handled"

      >


        {/* ============================================
            LOGO
        ============================================ */}

        <View
          style={
            styles.illustrationSection
          }
        >

          <View
            style={
              styles.illustrationMain
            }
          >

            <Text
              style={
                styles.illustrationEmoji
              }
            >
              ☕
            </Text>

          </View>


          {/* Elementos decorativos */}

          <View
            style={[
              styles.floatingEl,
              styles.floatingEl1,
            ]}
          >

            <Text
              style={{
                fontSize: 20,
              }}
            >
              ✨
            </Text>

          </View>


          <View
            style={[
              styles.floatingEl,
              styles.floatingEl2,
            ]}
          >

            <Text
              style={{
                fontSize: 16,
              }}
            >
              🫘
            </Text>

          </View>


          <View
            style={[
              styles.floatingEl,
              styles.floatingEl3,
            ]}
          >

            <Text
              style={{
                fontSize: 18,
              }}
            >
              🍂
            </Text>

          </View>


          <Text
            style={styles.appName}
          >
            CafeSoft
          </Text>


          <Text
            style={styles.appTagline}
          >
            Tu café favorito, donde quieras
          </Text>

        </View>


        {/* ============================================
            FORMULARIO
        ============================================ */}

        <View
          style={
            styles.formCard
          }
        >

          <Text
            style={styles.title}
          >
            Bienvenido de nuevo
          </Text>


          <Text
            style={styles.subtitle}
          >
            Inicia sesión para continuar
          </Text>


          {/* =========================================
              ROL
          ========================================= */}

          <Text
            style={styles.label}
          >
            ROL DE ACCESO
          </Text>


          <TouchableOpacity

            style={styles.input}

            onPress={() =>
              setShowRoleDropdown(
                !showRoleDropdown
              )
            }

            activeOpacity={0.8}

            disabled={cargando}

          >

            <View
              style={styles.roleDot}
            />


            <Text
              style={
                styles.inputText
              }
            >
              {selectedRole}
            </Text>


            <Text
              style={
                styles.dropdownArrow
              }
            >

              {showRoleDropdown
                ? '▴'
                : '▾'}

            </Text>

          </TouchableOpacity>


          {/* LISTA DE ROLES */}

          {showRoleDropdown && (

            <View
              style={
                styles.dropdown
              }
            >

              {ROLES.map(
                (role) => (

                  <TouchableOpacity

                    key={role}

                    style={[
                      styles.dropdownItem,

                      selectedRole === role &&
                        styles.dropdownItemActive,
                    ]}

                    onPress={() => {

                      setSelectedRole(
                        role
                      );

                      setShowRoleDropdown(
                        false
                      );

                    }}

                  >

                    <Text

                      style={[
                        styles.dropdownText,

                        selectedRole ===
                          role &&
                          styles.dropdownTextActive,
                      ]}

                    >
                      {role}
                    </Text>


                    {selectedRole ===
                      role && (

                      <Text
                        style={
                          styles.checkIcon
                        }
                      >
                        ✓
                      </Text>

                    )}

                  </TouchableOpacity>

                )
              )}

            </View>

          )}


          {/* =========================================
              CORREO
          ========================================= */}

          <Text
            style={styles.label}
          >
            CORREO ELECTRÓNICO
          </Text>


          <View
            style={styles.input}
          >

            <Text
              style={
                styles.inputIcon
              }
            >
              ✉️
            </Text>


            <TextInput

              style={
                styles.textInput
              }

              placeholder="tu@correo.com"

              placeholderTextColor={
                colors.textSecondary
              }

              value={email}

              onChangeText={
                setEmail
              }

              keyboardType="email-address"

              autoCapitalize="none"

              autoCorrect={false}

              editable={!cargando}

            />

          </View>


          {/* =========================================
              CONTRASEÑA
          ========================================= */}

          <Text
            style={styles.label}
          >
            CONTRASEÑA
          </Text>


          <View
            style={styles.input}
          >

            <Text
              style={
                styles.inputIcon
              }
            >
              🔒
            </Text>


            <TextInput

              style={
                styles.textInput
              }

              placeholder="••••••••"

              placeholderTextColor={
                colors.textSecondary
              }

              value={password}

              onChangeText={
                setPassword
              }

              secureTextEntry={
                !showPassword
              }

              autoCapitalize="none"

              editable={!cargando}

            />


            <TouchableOpacity

              onPress={() =>
                setShowPassword(
                  !showPassword
                )
              }

              disabled={cargando}

            >

              <Text
                style={
                  styles.inputIcon
                }
              >

                {showPassword
                  ? '🙈'
                  : '👁️'}

              </Text>

            </TouchableOpacity>

          </View>


          {/* =========================================
              OLVIDÉ CONTRASEÑA
          ========================================= */}

          <TouchableOpacity

            style={
              styles.forgotPassword
            }

            disabled={cargando}

          >

            <Text
              style={
                styles.forgotPasswordText
              }
            >
              ¿Olvidé mi contraseña?
            </Text>

          </TouchableOpacity>


          {/* =========================================
              BOTÓN LOGIN
          ========================================= */}

          <TouchableOpacity

            onPress={handleLogin}

            activeOpacity={0.85}

            style={
              styles.buttonWrapper
            }

            disabled={cargando}

          >

            <LinearGradient

              colors={[
                colors.secondary,
                '#A0522D',
                colors.primary,
              ]}

              style={
                styles.loginButton
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

              {cargando ? (

                <>

                  <ActivityIndicator
                    color={colors.white}
                  />

                  <Text
                    style={
                      styles.loginButtonText
                    }
                  >
                    Iniciando...
                  </Text>

                </>

              ) : (

                <>

                  <Text
                    style={
                      styles.loginButtonText
                    }
                  >
                    Iniciar Sesión
                  </Text>


                  <Text
                    style={
                      styles.loginButtonArrow
                    }
                  >
                    →
                  </Text>

                </>

              )}

            </LinearGradient>

          </TouchableOpacity>


          {/* =========================================
              REGISTRO
          ========================================= */}

          <View
            style={
              styles.registerLink
            }
          >

            <Text
              style={
                styles.registerText
              }
            >
              ¿No tienes cuenta?{' '}
            </Text>


            <TouchableOpacity

              onPress={() =>
                navigation.navigate(
                  'Register'
                )
              }

              disabled={cargando}

            >

              <Text
                style={
                  styles.registerLinkText
                }
              >
                Regístrate
              </Text>

            </TouchableOpacity>

          </View>


        </View>

      </ScrollView>

    </View>

  );

}


// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor:
      colors.primary,

  },


  gradient: {

    position: 'absolute',

    top: 0,

    left: 0,

    right: 0,

    bottom: 0,

  },


  // Círculos decorativos

  decorCircle: {

    position: 'absolute',

    borderRadius: 999,

    opacity: 0.15,

  },


  decorCircle1: {

    width: 300,

    height: 300,

    backgroundColor:
      '#C8763A',

    top: -80,

    right: -80,

  },


  decorCircle2: {

    width: 200,

    height: 200,

    backgroundColor:
      '#3D1A00',

    top: 100,

    left: -60,

  },


  decorCircle3: {

    width: 150,

    height: 150,

    backgroundColor:
      '#3D1A00',

    top: 220,

    right: 20,

  },


  scroll: {

    flexGrow: 1,

    paddingBottom: 40,

  },


  // Sección ilustrativa

  illustrationSection: {

    alignItems: 'center',

    paddingTop: 70,

    paddingBottom: 30,

    position: 'relative',

  },


  illustrationMain: {

    width: 110,

    height: 110,

    borderRadius: 35,

    backgroundColor:
      'rgba(245, 166, 35, 0.3)',

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 2,

    borderColor:
      'rgba(245, 166, 35, 0.5)',

    marginBottom: 16,

  },


  illustrationEmoji: {

    fontSize: 56,

  },


  floatingEl: {

    position: 'absolute',

    backgroundColor:
      'rgba(255,255,255,0.15)',

    borderRadius: 20,

    padding: 8,

  },


  floatingEl1: {

    top: 60,

    right: 60,

  },


  floatingEl2: {

    top: 130,

    left: 50,

  },


  floatingEl3: {

    top: 80,

    left: 80,

  },


  appName: {

    fontSize: 34,

    fontWeight: 'bold',

    color:
      colors.textLight,

    letterSpacing: 2,

  },


  appTagline: {

    fontSize: 14,

    color:
      'rgba(255,255,255,0.7)',

    marginTop: 4,

  },


  // Card formulario

  formCard: {

    backgroundColor:
      colors.background,

    borderTopLeftRadius: 36,

    borderTopRightRadius: 36,

    padding: 28,

    paddingTop: 36,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: -4,
    },

    shadowOpacity: 0.15,

    shadowRadius: 20,

    elevation: 10,

  },


  title: {

    fontSize: 28,

    fontWeight: 'bold',

    color:
      colors.primary,

    marginBottom: 4,

  },


  subtitle: {

    fontSize: 14,

    color:
      colors.textSecondary,

    marginBottom: 24,

  },


  label: {

    fontSize: 11,

    fontWeight: '800',

    color:
      colors.textSecondary,

    letterSpacing: 1.5,

    marginBottom: 8,

    marginTop: 16,

  },


  input: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      colors.surface,

    borderRadius: 16,

    paddingHorizontal: 16,

    paddingVertical: 14,

    shadowColor:
      colors.primary,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 8,

    elevation: 2,

  },


  roleDot: {

    width: 10,

    height: 10,

    borderRadius: 5,

    backgroundColor:
      colors.secondary,

    marginRight: 10,

  },


  inputIcon: {

    fontSize: 16,

    marginRight: 10,

  },


  inputText: {

    flex: 1,

    fontSize: 15,

    color:
      colors.textPrimary,

    fontWeight: '500',

  },


  textInput: {

    flex: 1,

    fontSize: 15,

    color:
      colors.textPrimary,

  },


  dropdownArrow: {

    color:
      colors.textSecondary,

    fontSize: 14,

  },


  dropdown: {

    backgroundColor:
      colors.white,

    borderRadius: 16,

    marginTop: 6,

    overflow: 'hidden',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.1,

    shadowRadius: 12,

    elevation: 5,

  },


  dropdownItem: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,

    paddingVertical: 14,

    borderBottomWidth: 1,

    borderBottomColor:
      colors.background,

  },


  dropdownItemActive: {

    backgroundColor:
      colors.surface,

  },


  dropdownText: {

    flex: 1,

    fontSize: 15,

    color:
      colors.textPrimary,

  },


  dropdownTextActive: {

    fontWeight: '700',

    color:
      colors.secondary,

  },


  checkIcon: {

    color:
      colors.secondary,

    fontWeight: 'bold',

  },


  forgotPassword: {

    alignSelf: 'flex-end',

    marginTop: 12,

    marginBottom: 8,

  },


  forgotPasswordText: {

    color:
      colors.secondary,

    fontSize: 14,

    fontWeight: '600',

  },


  buttonWrapper: {

    marginTop: 20,

    borderRadius: 18,

    shadowColor:
      colors.primary,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.35,

    shadowRadius: 12,

    elevation: 8,

  },


  loginButton: {

    borderRadius: 18,

    paddingVertical: 17,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 10,

  },


  loginButtonText: {

    color:
      colors.white,

    fontSize: 17,

    fontWeight: 'bold',

    letterSpacing: 0.5,

  },


  loginButtonArrow: {

    color:
      colors.white,

    fontSize: 18,

    fontWeight: 'bold',

  },


  registerLink: {

    flexDirection: 'row',

    justifyContent: 'center',

    marginTop: 24,

  },


  registerText: {

    color:
      colors.textSecondary,

    fontSize: 14,

  },


  registerLinkText: {

    color:
      colors.secondary,

    fontSize: 14,

    fontWeight: 'bold',

  },

});