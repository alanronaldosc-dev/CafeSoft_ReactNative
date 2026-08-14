import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';


const TEXT_SIZES = [
  'Pequeño',
  'Mediano',
  'Grande',
];


export default function ProfileScreen({ navigation }) {

  // =========================================
  // USUARIO CON SESIÓN INICIADA
  // =========================================

  const {
    usuario,
    cerrarSesion,
  } = useAuth();


  // =========================================
  // ACCESIBILIDAD
  // =========================================

  const [
    highContrast,
    setHighContrast,
  ] = useState(false);


  const [
    textSize,
    setTextSize,
  ] = useState('Mediano');


  const [
    accessibilityOpen,
    setAccessibilityOpen,
  ] = useState(false);


  // =========================================
  // OBTENER ROL DEL USUARIO
  // =========================================

  const obtenerRol = (userTipo) => {

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
  // INICIAL DEL USUARIO
  // =========================================

  const inicial = usuario?.nombre
    ? usuario.nombre
        .charAt(0)
        .toUpperCase()
    : 'U';


  // =========================================
  // CERRAR SESIÓN
  // =========================================

  const handleLogout = () => {

    cerrarSesion();

    navigation.reset({
      index: 0,

      routes: [
        {
          name: 'Login',
        },
      ],
    });

  };


  // =========================================
  // PANTALLA
  // =========================================

  return (

    <ScrollView

      style={
        styles.container
      }

      contentContainerStyle={
        styles.scroll
      }

      showsVerticalScrollIndicator={
        false
      }

    >


      {/* =====================================
          HEADER DEL USUARIO
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


        {/* AVATAR */}

        <View
          style={
            styles.avatarContainer
          }
        >

          <Text
            style={
              styles.avatarText
            }
          >
            {inicial}
          </Text>

        </View>


        {/* NOMBRE Y ROL */}

        <View
          style={
            styles.userInfo
          }
        >

          <Text
            style={
              styles.userName
            }
          >

            {
              usuario?.nombre ||
              'Usuario'
            }

          </Text>


          <View
            style={
              styles.roleRow
            }
          >

            <View
              style={
                styles.roleBadge
              }
            >

              <Text
                style={
                  styles.roleText
                }
              >
                {rol}
              </Text>

            </View>

          </View>

        </View>

      </LinearGradient>


      {/* =====================================
          INFORMACIÓN DEL USUARIO
      ===================================== */}

      <View
        style={
          styles.profileCard
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          👤 Mi información
        </Text>


        {/* ID */}

        <View
          style={
            styles.infoItem
          }
        >

          <View
            style={
              styles.infoIcon
            }
          >

            <Text>
              🆔
            </Text>

          </View>


          <View
            style={
              styles.infoContent
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              ID DE USUARIO
            </Text>


            <Text
              style={
                styles.infoValue
              }
            >

              {
                usuario?.id ||
                usuario?.idUsuario ||
                'No disponible'
              }

            </Text>

          </View>

        </View>


        {/* NOMBRE */}

        <View
          style={
            styles.infoItem
          }
        >

          <View
            style={
              styles.infoIcon
            }
          >

            <Text>
              👤
            </Text>

          </View>


          <View
            style={
              styles.infoContent
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              NOMBRE
            </Text>


            <Text
              style={
                styles.infoValue
              }
            >

              {
                usuario?.nombre ||
                'No disponible'
              }

            </Text>

          </View>

        </View>


        {/* CORREO */}

        <View
          style={
            styles.infoItem
          }
        >

          <View
            style={
              styles.infoIcon
            }
          >

            <Text>
              ✉️
            </Text>

          </View>


          <View
            style={
              styles.infoContent
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              CORREO ELECTRÓNICO
            </Text>


            <Text
              style={
                styles.infoValue
              }
            >

              {
                usuario?.email ||
                'No disponible'
              }

            </Text>

          </View>

        </View>


        {/* TELÉFONO */}

        <View
          style={
            styles.infoItem
          }
        >

          <View
            style={
              styles.infoIcon
            }
          >

            <Text>
              📱
            </Text>

          </View>


          <View
            style={
              styles.infoContent
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              TELÉFONO
            </Text>


            <Text
              style={
                styles.infoValue
              }
            >

              {
                usuario?.telefono ||
                'No disponible'
              }

            </Text>

          </View>

        </View>


        {/* DIRECCIÓN */}

        <View
          style={[
            styles.infoItem,
            styles.infoItemLast,
          ]}
        >

          <View
            style={
              styles.infoIcon
            }
          >

            <Text>
              📍
            </Text>

          </View>


          <View
            style={
              styles.infoContent
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              DIRECCIÓN
            </Text>


            <Text
              style={
                styles.infoValue
              }
            >

              {
                usuario?.direccion ||
                'No disponible'
              }

            </Text>

          </View>

        </View>

      </View>


      {/* =====================================
          PEDIDOS
      ===================================== */}

      <View
        style={
          styles.section
        }
      >

        <TouchableOpacity

          style={
            styles.menuItem
          }

          onPress={() =>
            navigation.navigate(
              'Pedidos'
            )
          }

        >

          <View
            style={
              styles.menuIconContainer
            }
          >

            <Text
              style={
                styles.menuIcon
              }
            >
              🍽️
            </Text>

          </View>


          <View
            style={
              styles.menuText
            }
          >

            <Text
              style={
                styles.menuTitle
              }
            >
              Pedidos
            </Text>


            <Text
              style={
                styles.menuSub
              }
            >
              Ver pedidos pendientes
            </Text>

          </View>


          <Text
            style={
              styles.menuArrow
            }
          >
            ›
          </Text>

        </TouchableOpacity>

      </View>


      {/* =====================================
          ACCESIBILIDAD
      ===================================== */}

      <View
        style={
          styles.section
        }
      >

        <TouchableOpacity

          style={[
            styles.menuItem,
            styles.accessibilityHeader,
          ]}

          onPress={() =>
            setAccessibilityOpen(
              !accessibilityOpen
            )
          }

        >

          <View
            style={[
              styles.menuIconContainer,
              styles.accessibilityIconContainer,
            ]}
          >

            <Text
              style={
                styles.menuIcon
              }
            >
              ♿
            </Text>

          </View>


          <Text
            style={
              styles.accessibilityTitle
            }
          >
            Accesibilidad
          </Text>


          <Text
            style={
              styles.menuArrow
            }
          >

            {
              accessibilityOpen
                ? '∧'
                : '∨'
            }

          </Text>

        </TouchableOpacity>


        {
          accessibilityOpen && (

            <View
              style={
                styles.accessibilityContent
              }
            >


              {/* ALTO CONTRASTE */}

              <View
                style={
                  styles.accessibilityItem
                }
              >

                <View
                  style={
                    styles.menuIconContainer
                  }
                >

                  <Text
                    style={
                      styles.menuIcon
                    }
                  >
                    🖥️
                  </Text>

                </View>


                <View
                  style={
                    styles.menuText
                  }
                >

                  <Text
                    style={
                      styles.menuTitle
                    }
                  >
                    Alto Contraste
                  </Text>


                  <Text
                    style={
                      styles.menuSub
                    }
                  >
                    Mejora visibilidad
                  </Text>

                </View>


                <Switch

                  value={
                    highContrast
                  }

                  onValueChange={
                    setHighContrast
                  }

                  trackColor={{

                    false:
                      colors.surface,

                    true:
                      colors.secondary,

                  }}

                  thumbColor={
                    colors.white
                  }

                />

              </View>


              {/* TAMAÑO DE TEXTO */}

              <View
                style={
                  styles.accessibilityItem
                }
              >

                <View
                  style={
                    styles.menuIconContainer
                  }
                >

                  <Text
                    style={
                      styles.menuIcon
                    }
                  >
                    T
                  </Text>

                </View>


                <View
                  style={
                    styles.menuText
                  }
                >

                  <Text
                    style={
                      styles.menuTitle
                    }
                  >
                    Tamaño de Texto
                  </Text>


                  <Text
                    style={
                      styles.menuSub
                    }
                  >
                    Actual: {textSize}
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.textSizeRow
                }
              >

                {
                  TEXT_SIZES.map(
                    (size) => (

                      <TouchableOpacity

                        key={
                          size
                        }

                        style={[
                          styles.textSizeButton,

                          textSize ===
                            size &&
                            styles.textSizeButtonActive,
                        ]}

                        onPress={() =>
                          setTextSize(
                            size
                          )
                        }

                      >

                        <Text

                          style={[
                            styles.textSizeText,

                            textSize ===
                              size &&
                              styles.textSizeTextActive,
                          ]}

                        >
                          {size}
                        </Text>

                      </TouchableOpacity>

                    )
                  )
                }

              </View>

            </View>

          )
        }

      </View>


      {/* =====================================
          CERRAR SESIÓN
      ===================================== */}

      <TouchableOpacity

        onPress={
          handleLogout
        }

        style={
          styles.buttonWrapper
        }

      >

        <LinearGradient

          colors={[
            colors.error,
            '#C62828',
          ]}

          style={
            styles.logoutButton
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
              styles.logoutText
            }
          >
            Cerrar Sesión
          </Text>

        </LinearGradient>

      </TouchableOpacity>

    </ScrollView>

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


    scroll: {

      paddingBottom: 40,

    },


    header: {

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingTop:
        55,

      paddingBottom:
        26,

      paddingHorizontal:
        20,

      gap:
        16,

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
        220,

      height:
        220,

      backgroundColor:
        colors.secondary,

      top:
        -70,

      right:
        -50,

    },


    headerCircle2: {

      width:
        130,

      height:
        130,

      backgroundColor:
        '#fff',

      top:
        30,

      left:
        -30,

    },


    avatarContainer: {

      width:
        68,

      height:
        68,

      borderRadius:
        34,

      backgroundColor:
        colors.secondary,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        2,

      borderColor:
        'rgba(255,255,255,0.5)',

    },


    avatarText: {

      fontSize:
        30,

      fontWeight:
        'bold',

      color:
        colors.white,

    },


    userInfo: {

      flex:
        1,

    },


    userName: {

      fontSize:
        21,

      fontWeight:
        'bold',

      color:
        colors.textLight,

      marginBottom:
        7,

    },


    roleRow: {

      flexDirection:
        'row',

      alignItems:
        'center',

    },


    roleBadge: {

      backgroundColor:
        colors.secondary,

      borderRadius:
        10,

      paddingHorizontal:
        10,

      paddingVertical:
        4,

    },


    roleText: {

      color:
        colors.white,

      fontSize:
        12,

      fontWeight:
        '600',

    },


    // =====================================
    // INFORMACIÓN DEL PERFIL
    // =====================================

    profileCard: {

      backgroundColor:
        colors.white,

      marginHorizontal:
        16,

      marginTop:
        16,

      borderRadius:
        18,

      paddingHorizontal:
        16,

      paddingTop:
        17,

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


    sectionTitle: {

      fontSize:
        17,

      fontWeight:
        'bold',

      color:
        colors.textPrimary,

      marginBottom:
        10,

    },


    infoItem: {

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingVertical:
        14,

      borderBottomWidth:
        1,

      borderBottomColor:
        colors.background,

    },


    infoItemLast: {

      borderBottomWidth:
        0,

    },


    infoIcon: {

      width:
        42,

      height:
        42,

      borderRadius:
        21,

      backgroundColor:
        colors.surface,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        12,

    },


    infoContent: {

      flex:
        1,

    },


    infoLabel: {

      fontSize:
        10,

      color:
        colors.textSecondary,

      fontWeight:
        '700',

      letterSpacing:
        0.8,

      marginBottom:
        3,

    },


    infoValue: {

      fontSize:
        15,

      color:
        colors.textPrimary,

      fontWeight:
        '500',

    },


    // =====================================
    // MENÚ
    // =====================================

    section: {

      backgroundColor:
        colors.white,

      borderRadius:
        16,

      marginHorizontal:
        16,

      marginTop:
        16,

      overflow:
        'hidden',

    },


    menuItem: {

      flexDirection:
        'row',

      alignItems:
        'center',

      padding:
        16,

      borderBottomWidth:
        1,

      borderBottomColor:
        colors.background,

      gap:
        12,

    },


    menuIconContainer: {

      width:
        36,

      height:
        36,

      backgroundColor:
        colors.surface,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',

    },


    menuIcon: {

      fontSize:
        16,

    },


    menuText: {

      flex:
        1,

    },


    menuTitle: {

      fontSize:
        15,

      fontWeight:
        '500',

      color:
        colors.textPrimary,

    },


    menuSub: {

      fontSize:
        13,

      color:
        colors.textSecondary,

      marginTop:
        2,

    },


    menuArrow: {

      fontSize:
        20,

      color:
        colors.textSecondary,

    },


    // =====================================
    // ACCESIBILIDAD
    // =====================================

    accessibilityHeader: {

      backgroundColor:
        colors.primary,

      borderBottomWidth:
        0,

    },


    accessibilityIconContainer: {

      backgroundColor:
        colors.secondary,

    },


    accessibilityTitle: {

      flex:
        1,

      fontSize:
        15,

      fontWeight:
        '600',

      color:
        colors.white,

    },


    accessibilityContent: {

      backgroundColor:
        colors.white,

    },


    accessibilityItem: {

      flexDirection:
        'row',

      alignItems:
        'center',

      padding:
        16,

      borderBottomWidth:
        1,

      borderBottomColor:
        colors.background,

      gap:
        12,

    },


    textSizeRow: {

      flexDirection:
        'row',

      padding:
        16,

      paddingTop:
        0,

      gap:
        8,

    },


    textSizeButton: {

      flex:
        1,

      paddingVertical:
        8,

      borderRadius:
        20,

      backgroundColor:
        colors.surface,

      alignItems:
        'center',

    },


    textSizeButtonActive: {

      backgroundColor:
        colors.primary,

    },


    textSizeText: {

      fontSize:
        13,

      color:
        colors.textSecondary,

      fontWeight:
        '500',

    },


    textSizeTextActive: {

      color:
        colors.white,

      fontWeight:
        '700',

    },


    // =====================================
    // LOGOUT
    // =====================================

    buttonWrapper: {

      marginHorizontal:
        16,

      marginTop:
        24,

      borderRadius:
        14,

    },


    logoutButton: {

      borderRadius:
        14,

      paddingVertical:
        16,

      alignItems:
        'center',

    },


    logoutText: {

      fontSize:
        15,

      fontWeight:
        '600',

      color:
        colors.white,

    },

  });