import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ActionsScreen from '../screens/ActionsScreen';

import InsumosListScreen from '../screens/InsumosListScreen';
import InsumoFormScreen from '../screens/InsumoFormScreen';

import LotesListScreen from '../screens/LotesListScreen';
import LoteFormScreen from '../screens/LoteFormScreen';

import ProductosListScreen from '../screens/ProductosListScreen';
import ProductoFormScreen from '../screens/ProductoFormScreen';

import CategoriasListScreen from '../screens/CategoriasListScreen';
import CategoriaFormScreen from '../screens/CategoriaFormScreen';

// HU-013 - PROVEEDORES
import ProveedoresListScreen from '../screens/ProveedoresListScreen';
import ProveedorFormScreen from '../screens/ProveedorFormScreen';

// HU-006 - CONFIRMACIÓN DE CARGAS POR REPARTIDOR
import CargasRepartidor from '../screens/CargasRespartidor';
import PedidosScreen from '../screens/PedidosScreen';
import RepartidorHomeScreen from '../screens/RepartidorHomeScreen';

import colors from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏠</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🛒</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Actions"
        component={ActionsScreen}
        options={{
          tabBarLabel: 'Acciones',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>⚙️</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* LOGIN */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        {/* REGISTRO */}
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        {/* NAVEGACIÓN PRINCIPAL */}
        <Stack.Screen
          name="Main"
          component={MainTabs}
        />

        {/* INSUMOS */}
        <Stack.Screen
          name="InsumosList"
          component={InsumosListScreen}
        />

        <Stack.Screen
          name="InsumoForm"
          component={InsumoFormScreen}
        />

        {/* LOTES */}
        <Stack.Screen
          name="LotesList"
          component={LotesListScreen}
        />

        <Stack.Screen
          name="LoteForm"
          component={LoteFormScreen}
        />

        {/* PRODUCTOS */}
        <Stack.Screen
          name="ProductosList"
          component={ProductosListScreen}
        />

        <Stack.Screen
          name="ProductoForm"
          component={ProductoFormScreen}
        />

        {/* CATEGORÍAS */}
        <Stack.Screen
          name="CategoriasList"
          component={CategoriasListScreen}
        />

        <Stack.Screen
          name="CategoriaForm"
          component={CategoriaFormScreen}
        />

        {/* HU-013 - PROVEEDORES */}
        <Stack.Screen
          name="ProveedoresList"
          component={ProveedoresListScreen}
        />

        <Stack.Screen
          name="ProveedorForm"
          component={ProveedorFormScreen}
        />

        {/* PANEL DEL REPARTIDOR */}
        <Stack.Screen
          name="RepartidorHome"
          component={RepartidorHomeScreen}
        />

        {/* HU-015 - PEDIDOS DEL REPARTIDOR */}
        <Stack.Screen
          name="PedidosRepartidor"
          component={PedidosScreen}
          options={{
            headerShown: true,
            title: 'Pedidos por entregar',
            headerBackTitle: 'Regresar',
          }}
        />

        {/* HU-006 - CONFIRMACIÓN DE CARGA DEL REPARTIDOR */}
        <Stack.Screen
          name="CargasRepartidor"
          component={CargasRepartidor}
          options={{
            headerShown: true,
            title: 'Mis cargas',
            headerBackTitle: 'Regresar',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}