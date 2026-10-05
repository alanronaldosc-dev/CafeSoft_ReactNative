// App.js
// Ahora envuelve toda la app con CartProvider y AuthProvider,
// igual que en Laravel envolvés rutas con middleware.

import React from 'react';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
