
import React from "react";
import {
  render,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

import RecomendacionesCliente from "../components/RecomendacionesCliente";
import api from "../config/api";

jest.mock("../config/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

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

describe("HU-056 - Recomendaciones de productos", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("No consulta recomendaciones sin cliente", () => {
    const { toJSON } = render(
      <RecomendacionesCliente clienteId={null} />
    );

    expect(toJSON()).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

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
});
