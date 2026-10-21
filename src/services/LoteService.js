import api from '../config/api';

const LoteService = {
  getAll: async () => {
    const response =
      await api.get('/lotes');

    return response.data;
  },

  create: async (data) => {
    const response =
      await api.post(
        '/lotes',
        data
      );

    return response.data;
  },

  delete: async (id) => {
    await api.delete(
      `/lotes/${id}`
    );

    return true;
  },
};

export default LoteService;