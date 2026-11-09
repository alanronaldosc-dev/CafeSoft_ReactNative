import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { navigationRef, navegarDesdeNotificacion } from './navigationRef';
import { registrarToken, escucharNotificaciones } from '../services/NotificationService';
import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  Text,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================
// CONTEXTO DE AUTENTICACIÓN
// ============================================

import {
  useAuth,
} from '../context/AuthContext';

// ============================================
// PANTALLAS
// ============================================

import LoginScreen
  from '../screens/LoginScreen';

import RegisterScreen
  from '../screens/RegisterScreen';

import HomeScreen
  from '../screens/HomeScreen';

import CartScreen
  from '../screens/CartScreen';

import ProfileScreen
  from '../screens/ProfileScreen';

import ActionsScreen
  from '../screens/ActionsScreen';

import InsumosListScreen
  from '../screens/InsumosListScreen';

import InsumoFormScreen
  from '../screens/InsumoFormScreen';

import LotesListScreen
  from '../screens/LotesListScreen';

import LoteFormScreen
  from '../screens/LoteFormScreen';

import ProductosListScreen
  from '../screens/ProductosListScreen';

import ProductoFormScreen
  from '../screens/ProductoFormScreen';

import CategoriasListScreen
  from '../screens/CategoriasListScreen';

import CategoriaFormScreen
  from '../screens/CategoriaFormScreen';

// HU-013 - PROVEEDORES

import ProveedoresListScreen
  from '../screens/ProveedoresListScreen';

import ProveedorFormScreen
  from '../screens/ProveedorFormScreen';

// HU-006 - CARGAS

import CargasRepartidor
  from '../screens/CargasRepartidor';

import RutasAsignadasScreen
  from '../screens/RutasAsignadasScreen';

import PedidosScreen
  from '../screens/PedidosScreen';

import RepartidorHomeScreen
  from '../screens/RepartidorHomeScreen';

import colors
  from '../theme/colors';

// ============================================
// NAVEGADORES
// ============================================

const Stack =
  createNativeStackNavigator();

const Tab =
  createBottomTabNavigator();

// ============================================
// TABS PRINCIPALES
// ============================================

function TabIcon({ emoji, focused, color }) {
  return (
    <View
      style={{
        width: 38,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused
          ? 'rgba(41, 201, 212, 0.16)'
          : 'transparent',
      }}
    >
      <Text style={{ color, fontSize: 19 }}>{emoji}</Text>
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (

    <Tab.Navigator

      screenOptions={{

        tabBarActiveTintColor:
          colors.primary,

        tabBarInactiveTintColor:
          colors.textMuted,

        tabBarStyle: {
          backgroundColor:
            colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 58 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
          shadowColor: '#043A4C',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 12,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },

        tabBarHideOnKeyboard: true,

        // Cambiar de pestaña no es una transición jerárquica:
        // sin deslizamiento, sin animación.
        animation: 'none',

        headerShown: false,

      }}
    >

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{

          tabBarLabel:
            'Inicio',

          tabBarIcon:
            ({ color, focused }) => (
              <TabIcon emoji="🏠" focused={focused} color={color} />
            ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{

          tabBarLabel:
            'Carrito',

          tabBarIcon:
            ({ color, focused }) => (
              <TabIcon emoji="🛒" focused={focused} color={color} />
            ),
        }}
      />

      <Tab.Screen
        name="Actions"
        component={ActionsScreen}
        options={{

          tabBarLabel:
            'Acciones',

          tabBarIcon:
            ({ color, focused }) => (
              <TabIcon emoji="⚙️" focused={focused} color={color} />
            ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{

          tabBarLabel:
            'Perfil',

          tabBarIcon:
            ({ color, focused }) => (
              <TabIcon emoji="👤" focused={focused} color={color} />
            ),
        }}
      />

    </Tab.Navigator>
  );
}

// ============================================
// NAVEGACIÓN PRINCIPAL
// ============================================

export default function AppNavigator() {

  // Obtener usuario del contexto
  const { usuario } =
    useAuth();

    const rolActual =
  String(
    usuario?.rol ??
    usuario?.role ??
    ''
  )
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');


  useEffect(() => {
    if (!usuario?.id) return;

    registrarToken(usuario.id).then((resultado) => {
      if (resultado.ok) {
        // Útil como evidencia en la práctica y para probar el envío.
        console.log('Expo push token:', resultado.token);
      } else {
        console.warn('Push no registrado:', resultado.motivo);
      }
    });

    // Si la app se abrió desde una notificación antes de iniciar
    // sesión, la respuesta sigue pendiente y se procesa aquí.
    const respuestaPendiente =
      Notifications.getLastNotificationResponse();

    if (respuestaPendiente) {
      navegarDesdeNotificacion(
        respuestaPendiente.notification.request.content.data
      );

      Notifications.clearLastNotificationResponse();
    }

    return escucharNotificaciones({
      onRecibida: (notificacion) => {
        const { title, body, data } = notificacion.request.content;
        console.log('Notificación recibida:', { title, body, data });
      },
      onAbierta: (respuesta) => {
        const data = respuesta.notification.request.content.data;
        console.log('Notificación abierta:', data);
        navegarDesdeNotificacion(data);
      },
    });
  }, [usuario?.id]);


  const esRepartidor =
    rolActual.includes('repart');

  return (

    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        const respuesta =
          Notifications.getLastNotificationResponse();

        if (respuesta && usuario) {
          navegarDesdeNotificacion(
            respuesta.notification.request.content.data
          );

          Notifications.clearLastNotificationResponse();
        }
      }}
    >

    <Stack.Navigator
  key={
    !usuario
      ? 'guest'
      : esRepartidor
        ? 'repartidor'
        : 'usuario'
  }
  initialRouteName={
    !usuario
      ? 'Login'
      : esRepartidor
        ? 'RepartidorHome'
        : 'Main'
  }
  screenOptions={{
    headerShown: false,
    animation: 'slide_from_right',
    contentStyle: { backgroundColor: colors.background },
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: colors.white,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
  }}
>

        {/* ======================================
            USUARIO NO AUTENTICADO
        ====================================== */}

        {!usuario ? (

          <>

            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />

          </>

        ) : (

          /* ======================================
             USUARIO AUTENTICADO
          ====================================== */

          <>

            {/* NAVEGACIÓN PRINCIPAL */}

            <Stack.Screen
              name="Main"
              component={MainTabs}
            />

            {/* INSUMOS */}

            <Stack.Screen
              name="InsumosList"
              component={
                InsumosListScreen
              }
            />

            <Stack.Screen
              name="InsumoForm"
              component={
                InsumoFormScreen
              }
            />

            {/* LOTES */}

            <Stack.Screen
              name="LotesList"
              component={
                LotesListScreen
              }
            />

            <Stack.Screen
              name="LoteForm"
              component={
                LoteFormScreen
              }
            />

            {/* PRODUCTOS */}

            <Stack.Screen
              name="ProductosList"
              component={
                ProductosListScreen
              }
            />

            <Stack.Screen
              name="ProductoForm"
              component={
                ProductoFormScreen
              }
            />

            {/* CATEGORÍAS */}

            <Stack.Screen
              name="CategoriasList"
              component={
                CategoriasListScreen
              }
            />

            <Stack.Screen
              name="CategoriaForm"
             component={
  CategoriaFormScreen
}
            />

            {/* PROVEEDORES */}

            <Stack.Screen
              name="ProveedoresList"
              component={
                ProveedoresListScreen
              }
            />

            <Stack.Screen
              name="ProveedorForm"
              component={
                ProveedorFormScreen
              }
            />

            {/* REPARTIDOR */}

            <Stack.Screen
              name="RepartidorHome"
              component={
                RepartidorHomeScreen
              }
            />

            <Stack.Screen
              name="PedidosRepartidor"
              component={
                PedidosScreen
              }
              options={{

                headerShown:
                  true,

                title:
                  'Pedidos por entregar',

                headerBackTitle:
                  'Regresar',

              }}
            />

            <Stack.Screen
              name="CargasRepartidor"
              component={
                CargasRepartidor
              }
              options={{

                headerShown:
                  true,

                title:
                  'Mis cargas',

                headerBackTitle:
                  'Regresar',

              }}
            />

            <Stack.Screen
              name="RutasAsignadas"
              component={
                RutasAsignadasScreen
              }
              options={{
                headerShown:
                  true,
                title:
                  'Rutas asignadas',
                headerBackTitle:
                  'Regresar',
              }}
            />

          </>

        )}

      </Stack.Navigator>

    </NavigationContainer>
  );
}