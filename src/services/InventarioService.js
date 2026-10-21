import api from '../config/api';

const InventarioService = {

  // GET /api/inventario
  getAll: async () => {
    const response =
      await api.get('/inventario');

    return response.data;
  },

  // GET /api/inventario/:id
  getById: async (id) => {
    const response =
      await api.get(
        `/inventario/${id}`
      );

    return response.data;
  },

  // POST /api/inventario
  create: async (data) => {
    const response =
      await api.post(
        '/inventario',
        data
      );

    return response.data;
  },

  // PUT /api/inventario/:id
  update: async (id, data) => {
    const response =
      await api.put(
        `/inventario/${id}`,
        data
      );

    return response.data;
  },

  // DELETE /api/inventario/:id
  delete: async (id) => {
    await api.delete(
      `/inventario/${id}`
    );

    return true;
  },
};

export default InventarioService;