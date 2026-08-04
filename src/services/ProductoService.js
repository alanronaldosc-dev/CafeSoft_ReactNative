// ProductoService.js
// Comunicación con /api/productos
// Los productos usan insumos del inventario (no de /api/insumos)

const BASE_URL = 'http://192.168.101.116:8080/api';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const ProductoService = {

  // GET /api/productos
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/productos`, { headers });
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
  },

  // GET /api/productos/:id
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/productos/${id}`, { headers });
    if (!response.ok) throw new Error('Producto no encontrado');
    return response.json();
  },

  // POST /api/productos
  // Body: { nombre, precio, descripcion, imagen, insumos: [{ insumoId, cantidad, unidadMedida }] }
  create: async (data) => {
    const response = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return response.json();
  },

  // PUT /api/productos/:id
  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
  },

  // DELETE /api/productos/:id
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    return true;
  },
};

export default ProductoService;
