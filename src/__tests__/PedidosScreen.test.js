import React from "react";
import {
  render,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

import PedidosScreen from "../screens/PedidosScreen";
import api from "../config/api";

// ============================================
// SIMULACION DE LA API
// ============================================

jest.mock("../config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

// ============================================
// SIMULACION DE AUTENTICACION
// ============================================

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: {
      id: 1,
      nombre: "Repartidor de prueba",
      sucursalId: 1,
    },
    getToken: async () => "token-prueba-hu056",
  }),
}));

// ============================================
// SIMULACION DE NAVEGACION
// ============================================

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback) => {
    const React = require("react");
    React.useEffect(callback, [callback]);
  },
}));

// ============================================
// SIMULACION DE LINEAR GRADIENT
// ============================================

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children, style }) => {
    const React = require("react");
    const { View } = require("react-native");

    return React.createElement(
      View,
      { style },
      children
    );
  },
}));

// ============================================
// CLIENTES DE PRUEBA
// ============================================

const clientes = [
  {
    id: 10,
    nombre: "Cliente de prueba uno",
    domicilio: "Domicilio de prueba 1",
    precioPorGarrafon: 50,
    ordenEnRuta: 1,
    diasReparto: "Lunes",
    garrafonPreferencia: {
      nombre: "Bonafont",
    },
    ruta: {
      id: 1,
    },
  },
  {
    id: 20,
    nombre: "Cliente de prueba dos",
    domicilio: "Domicilio de prueba 2",
    precioPorGarrafon: 45,
    ordenEnRuta: 2,
    diasReparto: "Viernes",
    garrafonPreferencia: {
      nombre: "Ciel",
    },
    ruta: {
      id: 1,
    },
  },
];

// ============================================
// RECOMENDACIONES SIMULADAS
// ============================================

const recomendaciones = [
  {
    productoId: 101,
    nombre: "Garrafon Bonafont 20L",
    precio: 50,
    puntuacion: 10,
    motivo: "Basado en historial de compras",
  },
  {
    productoId: 102,
    nombre: "Garrafon Ciel 20L",
    precio: 45,
    puntuacion: 8,
    motivo: "Producto complementario",
  },
  {
    productoId: 103,
    nombre: "Agua mineral 1L",
    precio: 25,
    puntuacion: 6,
    motivo: "Comprado frecuentemente",
  },
];

const recomendacionesSegundoCliente = [
  {
    productoId: 201,
    nombre: "Agua purificada 10L",
    precio: 30,
    puntuacion: 9,
    motivo: "Historial del segundo cliente",
  },
  {
    productoId: 202,
    nombre: "Agua natural 1L",
    precio: 15,
    puntuacion: 7,
    motivo: "Producto complementario",
  },
  {
    productoId: 203,
    nombre: "Agua purificada 5L",
    precio: 20,
    puntuacion: 5,
    motivo: "Compra frecuente",
  },
];

// ============================================
// RESPUESTAS DE LOS ENDPOINTS
// ============================================

const simularApi = (url) => {
  if (
    url === "/rutas/repartidor/1/en-curso/clientes"
  ) {
    return Promise.resolve({
      data: clientes,
    });
  }

  if (url === "/cargas/repartidor/1") {
    return Promise.resolve({
      data: [],
    });
  }

  if (
    url === "/ventas/repartidor/1/entregas-hoy"
  ) {
    return Promise.resolve({
      data: [],
    });
  }

  if (
    url === "/liquidaciones/repartidor/1/hoy"
  ) {
    return Promise.reject({
      response: {
        status: 404,
      },
    });
  }

  if (url === "/inventario") {
    return Promise.resolve({
      data: [],
    });
  }

  if (url.includes("/puntos")) {
    return Promise.resolve({
      data: {
        saldo: 10,
      },
    });
  }

  if (url.includes("/promociones/vigentes")) {
    return Promise.resolve({
      data: [],
    });
  }

  if (
    url === "/analitica/recomendaciones/10"
  ) {
    return Promise.resolve({
      data: recomendaciones,
    });
  }

  if (
    url === "/analitica/recomendaciones/20"
  ) {
    return Promise.resolve({
      data: recomendacionesSegundoCliente,
    });
  }

  return Promise.reject(
    new Error(`Endpoint no simulado: ${url}`)
  );
};

// ============================================
// FUNCION PARA RENDERIZAR LA PANTALLA
// ============================================

const renderizarPantalla = () =>
  render(
    <PedidosScreen
      route={{
        params: {
          repartidorId: 1,
        },
      }}
    />
  );

// ============================================
// SIT-RECMOV-01
// HU-056 - PRUEBAS DE INTEGRACION
// ============================================

describe("SIT-RECMOV-01 - Integracion HU-056", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    api.get.mockImplementation(simularApi);
  });

  // ==========================================
  // SIT-01: CARGAR CLIENTES DE LA RUTA
  // ==========================================

  test("Carga correctamente los clientes de la ruta", async () => {
    const { findByText } = renderizarPantalla();

    expect(
      await findByText("Cliente de prueba uno")
    ).toBeTruthy();

    expect(
      await findByText("Cliente de prueba dos")
    ).toBeTruthy();

    expect(api.get).toHaveBeenCalledWith(
      "/rutas/repartidor/1/en-curso/clientes",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer token-prueba-hu056",
        },
      })
    );
  });

  // ==========================================
  // SIT-02: SELECCIONAR CLIENTE
  // ==========================================

  test("Consulta recomendaciones al seleccionar un cliente", async () => {
    const {
      findByText,
      getAllByText,
    } = renderizarPantalla();

    await findByText("Cliente de prueba uno");

    fireEvent.press(
      getAllByText(/Vender/)[0]
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/analitica/recomendaciones/10",
        {
          params: {
            limite: 5,
          },
        }
      );
    });

    expect(
      await findByText("Garrafon Bonafont 20L")
    ).toBeTruthy();
  });

  // ==========================================
  // SIT-03: MOSTRAR TRES RECOMENDACIONES
  // ==========================================

  test("Renderiza tres recomendaciones dentro del modal de venta", async () => {
    const {
      findByText,
      getAllByText,
    } = renderizarPantalla();

    await findByText("Cliente de prueba uno");

    fireEvent.press(
      getAllByText(/Vender/)[0]
    );

    for (const producto of recomendaciones) {
      expect(
        await findByText(producto.nombre)
      ).toBeTruthy();
    }
  });

  // ==========================================
  // SIT-04: RECOMENDACIONES PERSONALIZADAS
  // ==========================================

  test("Muestra recomendaciones correspondientes al segundo cliente", async () => {
    const {
      findByText,
      getAllByText,
      queryByText,
    } = renderizarPantalla();

    await findByText("Cliente de prueba dos");

    fireEvent.press(
      getAllByText(/Vender/)[1]
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/analitica/recomendaciones/20",
        {
          params: {
            limite: 5,
          },
        }
      );
    });

    for (
      const producto of recomendacionesSegundoCliente
    ) {
      expect(
        await findByText(producto.nombre)
      ).toBeTruthy();
    }

    expect(
      queryByText("Garrafon Bonafont 20L")
    ).toBeNull();
  });

  // ==========================================
  // SIT-05: PRECIOS Y MOTIVOS
  // ==========================================

  test("Muestra los precios y motivos de las recomendaciones", async () => {
    const {
      findByText,
      getAllByText,
    } = renderizarPantalla();

    await findByText("Cliente de prueba uno");

    fireEvent.press(
      getAllByText(/Vender/)[0]
    );

    expect(
      await findByText(
        /\$50\.00.*Basado en historial de compras/
      )
    ).toBeTruthy();

    expect(
      await findByText(
        /\$45\.00.*Producto complementario/
      )
    ).toBeTruthy();

    expect(
      await findByText(
        /\$25\.00.*Comprado frecuentemente/
      )
    ).toBeTruthy();
  });

  // ==========================================
  // SIT-06: CLIENTE SIN HISTORIAL
  // ==========================================

  test("Muestra mensaje cuando el cliente no tiene recomendaciones", async () => {
    api.get.mockImplementation((url) => {
      if (
        url === "/analitica/recomendaciones/10"
      ) {
        return Promise.resolve({
          data: [],
        });
      }

      return simularApi(url);
    });

    const {
      findByText,
      getAllByText,
    } = renderizarPantalla();

    await findByText("Cliente de prueba uno");

    fireEvent.press(
      getAllByText(/Vender/)[0]
    );

    expect(
      await findByText(
        "No hay historial suficiente para recomendar productos."
      )
    ).toBeTruthy();
  });

  // ==========================================
  // SIT-07: ERROR DEL SERVIDOR
  // ==========================================

  test("Controla errores de la API dentro del modal de venta", async () => {
    api.get.mockImplementation((url) => {
      if (
        url === "/analitica/recomendaciones/10"
      ) {
        return Promise.reject(
          new Error("Error HTTP 500")
        );
      }

      return simularApi(url);
    });

    const {
      findByText,
      getAllByText,
    } = renderizarPantalla();

    await findByText("Cliente de prueba uno");

    fireEvent.press(
      getAllByText(/Vender/)[0]
    );

    expect(
      await findByText(
        "No fue posible consultar recomendaciones."
      )
    ).toBeTruthy();
  });

  // ==========================================
  // SIT-08: ACTUALIZAR RECOMENDACIONES
  // ==========================================

  test("Permite actualizar recomendaciones desde el modal de venta", async () => {
    const {
      findByText,
      getAllByText,
      getByText,
    } = renderizarPantalla();

    await findByText("Cliente de prueba uno");

    fireEvent.press(
      getAllByText(/Vender/)[0]
    );

    await findByText("Garrafon Bonafont 20L");

    fireEvent.press(
      getByText(/Actualizar recomendaciones/)
    );

    await waitFor(() => {
      const consultas = api.get.mock.calls.filter(
        ([url]) =>
          url === "/analitica/recomendaciones/10"
      );

      expect(consultas).toHaveLength(2);
    });

    expect(
      await findByText("Garrafon Bonafont 20L")
    ).toBeTruthy();
  });
});