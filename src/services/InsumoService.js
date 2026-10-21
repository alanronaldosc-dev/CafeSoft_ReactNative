import api from '../config/api';

const InsumoService = {
  getAll: async () => {
    const response =
      await api.get('/insumos');

    return response.data;
  },

  getById: async (id) => {
    const response =
      await api.get(`/insumos/${id}`);

    return response.data;
  },

  create: async (data) => {
    const response =
      await api.post(
        '/insumos',
        data
      );

    return response.data;
  },

  update: async (id, data) => {
    const response =
      await api.put(
        `/insumos/${id}`,
        data
      );

    return response.data;
  },

  delete: async (id) => {
    await api.delete(
      `/insumos/${id}`
    );

    return true;
  },
};

export default InsumoService;