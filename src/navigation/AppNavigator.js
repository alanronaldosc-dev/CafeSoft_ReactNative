// Este archivo es el equivalente a routes/web.php de Laravel.
// Define qué pantalla se muestra según la navegación del usuario.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Importamos cada pantalla, como cuando importás un Controller en las rutas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';

import colors from '../theme/colors';

// Stack = navegación lineal (pantalla sobre pantalla, con botón "atrás")
// Es como el historial del navegador web
const Stack = createNativeStackNavigator();

// Tab = el menú de íconos de abajo (Inicio, Carrito, Perfil)
const Tab = createBottomTabNavigator();

// Esta función define las 3 tabs del menú inferior
// Solo se muestra cuando el usuario ya está autenticado
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,   // color del ícono activo
        tabBarInactiveTintColor: colors.textSecondary, // color inactivo
        tabBarStyle: { backgroundColor: colors.white },
        headerShown: false, // ocultamos el header por defecto
      }}
    >
      {/* Cada Tab.Screen es como una ruta de Laravel */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛒</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// El navegador principal que envuelve toda la app
// initialRouteName define la primera pantalla, como la ruta "/" en Laravel
export default function AppNavigator() {
  return (
    // NavigationContainer es el contenedor raíz, siempre va aquí
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        {/* Pantallas públicas (sin auth) */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Pantalla principal con las tabs (requiere auth) */}
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
