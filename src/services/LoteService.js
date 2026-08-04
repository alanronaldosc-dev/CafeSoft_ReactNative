// LoteService.js
// Capa de comunicación con /api/lotes
// Los lotes son los "registros de entrada" de insumos al inventario

const BASE_URL = 'http://192.168.101.116:8080/api';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const LoteService = {

  // GET /api/lotes — todos los lotes registrados
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/lotes`, { headers });
    if (!response.ok) throw new Error('Error al obtener lotes');
    return response.json();
  },

  // POST /api/lotes — registrar un nuevo lote
  // Body: { insumoId, cantidad, fechaCaducidad, observaciones }
  create: async (data) => {
    const response = await fetch(`${BASE_URL}/lotes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al registrar lote');
    return response.json();
  },

  // DELETE /api/lotes/:id
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/lotes/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error al eliminar lote');
    return true;
  },
};

export default LoteService;
