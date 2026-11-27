import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";

import RecomendacionesCliente from "../components/RecomendacionesCliente";
import api from "../config/api";

// ============================================
// SIMULACION DE LA API
// ============================================

jest.mock("../config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// ============================================
// DATOS DE PRUEBA
// ============================================

const recomendaciones = [
  {
    productoId: 1,
    nombre: "Garrafon Bonafont",
    precio: 50,
    motivo: "Comprado junto con productos del historial",
  },
  {
    productoId: 2,
    nombre: "Garrafon Ciel",
    precio: 45,
    motivo: "Comprado junto con productos del historial",
  },
  {
    productoId: 3,
    nombre: "Agua mineral",
    precio: 25,
    motivo: "Comprado junto con productos del historial",
  },
];

// ============================================
// HU-056 - RECOMENDACIONES DE PRODUCTOS
// AQUASOFT
// ============================================

describe("HU-056 - Recomendaciones de productos", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ==========================================
  // CP-01: CLIENTE NO SELECCIONADO
  // ==========================================

  test("No consulta recomendaciones sin cliente", () => {
    const { toJSON } = render(
      <RecomendacionesCliente clienteId={null} />
    );

    expect(toJSON()).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  // ==========================================
  // CP-02: CONSULTA DE RECOMENDACIONES
  // ==========================================

  test("Consulta las recomendaciones del cliente", async () => {
    api.get.mockResolvedValueOnce({
      data: recomendaciones,
    });

    const { findByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(
      await findByText("Garrafon Bonafont")
    ).toBeTruthy();

    expect(api.get).toHaveBeenCalledWith(
      "/analitica/recomendaciones/10",
      {
        params: { limite: 5 },
      }
    );
  });

  // ==========================================
  // CP-03: MINIMO TRES RECOMENDACIONES
  // ==========================================

  test("Muestra tres productos recomendados", async () => {
    api.get.mockResolvedValueOnce({
      data: recomendaciones,
    });

    const { findByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(
      await findByText("Garrafon Bonafont")
    ).toBeTruthy();

    expect(
      await findByText("Garrafon Ciel")
    ).toBeTruthy();

    expect(
      await findByText("Agua mineral")
    ).toBeTruthy();
  });

  // ==========================================
  // CP-04: VISUALIZACION DEL PRECIO
  // ==========================================

  test("Muestra el precio del producto", async () => {
    api.get.mockResolvedValueOnce({
      data: recomendaciones,
    });

    const { findByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(
      await findByText(/\$50\.00/)
    ).toBeTruthy();
  });

  // ==========================================
  // CP-05: CLIENTE SIN HISTORIAL
  // ==========================================

  test("Muestra mensaje cuando no hay historial", async () => {
    api.get.mockResolvedValueOnce({
      data: [],
    });

    const { findByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(
      await findByText(
        "No hay historial suficiente para recomendar productos."
      )
    ).toBeTruthy();
  });

  // ==========================================
  // CP-06: RESPUESTA JSON INCORRECTA
  // ==========================================

  test("Controla respuestas que no son arreglos", async () => {
    api.get.mockResolvedValueOnce({
      data: null,
    });

    const { findByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(
      await findByText(
        "No hay historial suficiente para recomendar productos."
      )
    ).toBeTruthy();
  });

  // ==========================================
  // CP-07: ERROR DEL SERVIDOR
  // ==========================================

  test("Muestra error cuando falla el servidor", async () => {
    api.get.mockRejectedValueOnce(
      new Error("Error de conexion")
    );

    const { findByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(
      await findByText(
        "No fue posible consultar recomendaciones."
      )
    ).toBeTruthy();
  });

  // ==========================================
  // CP-08: ACTUALIZAR RECOMENDACIONES
  // ==========================================

  test("Permite actualizar las recomendaciones", async () => {
    api.get.mockResolvedValue({
      data: recomendaciones,
    });

    const { findByText, getByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    await findByText("Garrafon Bonafont");

    fireEvent.press(
      getByText(/Actualizar recomendaciones/)
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });

    await findByText("Garrafon Bonafont");
  });

  // ==========================================
  // CP-09: CAMBIO DE CLIENTE
  // ==========================================

  test("Consulta nuevamente al cambiar de cliente", async () => {
    api.get.mockResolvedValue({
      data: recomendaciones,
    });

    const { rerender, findByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    await findByText("Garrafon Bonafont");

    rerender(
      <RecomendacionesCliente clienteId={20} />
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith(
        "/analitica/recomendaciones/20",
        {
          params: { limite: 5 },
        }
      );
    });

    await findByText("Garrafon Bonafont");
  });

  // ==========================================
  // CP-10: PRODUCTO SIN PRECIO
  // ==========================================

  test("Controla productos sin precio", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          productoId: 4,
          nombre: "Producto sin precio",
          precio: null,
          motivo: "Recomendacion por historial",
        },
      ],
    });

    const { findByText } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(
      await findByText(/\$0\.00/)
    ).toBeTruthy();
  });

  // ==========================================
  // CP-11: RESPUESTA EXITOSA DESPUES
  // DE DESMONTAR EL COMPONENTE
  // ==========================================

  test("Ignora respuestas exitosas despues de desmontar el componente", async () => {
    let resolver;

    api.get.mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      })
    );

    const { unmount } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(api.get).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      resolver({
        data: recomendaciones,
      });
    });

    expect(api.get).toHaveBeenCalledTimes(1);
  });

  // ==========================================
  // CP-12: ERROR DESPUES DE DESMONTAR
  // EL COMPONENTE
  // ==========================================

  test("Ignora errores despues de desmontar el componente", async () => {
    let rechazar;

    api.get.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        rechazar = reject;
      })
    );

    const { unmount } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    expect(api.get).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      rechazar(
        new Error("Error de conexion")
      );
    });

    expect(api.get).toHaveBeenCalledTimes(1);
  });

  // ==========================================
  // CP-13: EVITAR RECOMENDACIONES DE
  // UN CLIENTE ANTERIOR
  // ==========================================

  test("Ignora recomendaciones antiguas al cambiar de cliente", async () => {
    let resolverAnterior;

    api.get
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolverAnterior = resolve;
        })
      )
      .mockResolvedValueOnce({
        data: [
          {
            productoId: 20,
            nombre: "Agua purificada 20L",
            precio: 55,
            motivo: "Historial del nuevo cliente",
          },
        ],
      });

    const {
      rerender,
      findByText,
      queryByText,
    } = render(
      <RecomendacionesCliente clienteId={10} />
    );

    rerender(
      <RecomendacionesCliente clienteId={20} />
    );

    expect(
      await findByText("Agua purificada 20L")
    ).toBeTruthy();

    await act(async () => {
      resolverAnterior({
        data: recomendaciones,
      });
    });

    expect(
      queryByText("Garrafon Bonafont")
    ).toBeNull();

    expect(
      queryByText("Agua purificada 20L")
    ).toBeTruthy();

    expect(api.get).toHaveBeenCalledTimes(2);

    expect(api.get).toHaveBeenLastCalledWith(
      "/analitica/recomendaciones/20",
      {
        params: { limite: 5 },
      }
    );
  });
});