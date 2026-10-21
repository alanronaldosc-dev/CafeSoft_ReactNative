import api from '../config/api';

const ProductoService = {
  getAll: async () => {
    const response =
      await api.get('/productos');

    return response.data;
  },

  getById: async (id) => {
    const response =
      await api.get(`/productos/${id}`);

    return response.data;
  },

  create: async (data) => {
    const response =
      await api.post(
        '/productos',
        data
      );

    return response.data;
  },

  update: async (id, data) => {
    const response =
      await api.put(
        `/productos/${id}`,
        data
      );

    return response.data;
  },

  delete: async (id) => {
    await api.delete(
      `/productos/${id}`
    );

    return true;
  },
};

export default ProductoService;