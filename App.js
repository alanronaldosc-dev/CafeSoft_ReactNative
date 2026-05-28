// App.js
// Ahora envuelve toda la app con CartProvider,
// igual que en Laravel envolvés rutas con middleware.

import React from 'react';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <CartProvider>
      <AppNavigator />
    </CartProvider>
  );
}
