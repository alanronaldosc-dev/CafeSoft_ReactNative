import React from 'react';

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
} from 'react-native';

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

function MainTabs() {

  return (

    <Tab.Navigator

      screenOptions={{

        tabBarActiveTintColor:
          colors.secondary,

        tabBarInactiveTintColor:
          colors.textSecondary,

        tabBarStyle: {
          backgroundColor:
            colors.white,
        },

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
            ({ color }) => (

              <Text
                style={{
                  color,
                  fontSize: 20,
                }}
              >
                🏠
              </Text>
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
            ({ color }) => (

              <Text
                style={{
                  color,
                  fontSize: 20,
                }}
              >
                🛒
              </Text>
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
            ({ color }) => (

              <Text
                style={{
                  color,
                  fontSize: 20,
                }}
              >
                ⚙️
              </Text>
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
            ({ color }) => (

              <Text
                style={{
                  color,
                  fontSize: 20,
                }}
              >
                👤
              </Text>
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

const esRepartidor =
  rolActual.includes('repart');

  return (

    <NavigationContainer>

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

          </>

        )}

      </Stack.Navigator>

    </NavigationContainer>
  );
}