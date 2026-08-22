// CategoriaService.js
const BASE_URL = 'http://192.168.100.5:8080/api';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const CategoriaService = {

  getAll: async () => {
    const response = await fetch(`${BASE_URL}/categorias`, { headers });
    if (!response.ok) throw new Error('Error al obtener categorías');
    return response.json();
  },

  getActivas: async () => {
    const response = await fetch(`${BASE_URL}/categorias/activas`, { headers });
    if (!response.ok) throw new Error('Error al obtener categorías activas');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/categorias/${id}`, { headers });
    if (!response.ok) throw new Error('Categoría no encontrada');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${BASE_URL}/categorias`, {
      method: 'POST', headers, body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Error al crear categoría');
    }
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/categorias/${id}`, {
      method: 'PUT', headers, body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Error al actualizar categoría');
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/categorias/${id}`, {
      method: 'DELETE', headers,
    });
    if (!response.ok) throw new Error('Error al eliminar categoría');
    return true;
  },
};

export default CategoriaService;
