// InventarioService.js
// Comunicación con /api/inventario
// El inventario es la fuente de insumos disponibles para los productos

const BASE_URL = 'http://192.168.92.198:8080/api';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const InventarioService = {

  // GET /api/inventario
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/inventario`, { headers });
    if (!response.ok) throw new Error('Error al obtener inventario');
    return response.json();
  },

  // GET /api/inventario/:id
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/inventario/${id}`, { headers });
    if (!response.ok) throw new Error('Registro no encontrado');
    return response.json();
  },

  // POST /api/inventario
  create: async (data) => {
    const response = await fetch(`${BASE_URL}/inventario`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear registro');
    return response.json();
  },

  // PUT /api/inventario/:id
  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/inventario/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar registro');
    return response.json();
  },

  // DELETE /api/inventario/:id
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/inventario/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error al eliminar registro');
    return true;
  },
};

export default InventarioService;
