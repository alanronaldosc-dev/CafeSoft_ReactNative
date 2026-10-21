import api from '../config/api';

const ProveedorService = {
  getAll: async () => {
    const response =
      await api.get('/proveedores');

    return response.data;
  },

  getActivos: async () => {
    const data =
      await ProveedorService.getAll();

    return (
      Array.isArray(data)
        ? data
        : []
    ).filter(
      (proveedor) =>
        proveedor.activo !== false
    );
  },

  getById: async (id) => {
    const response =
      await api.get(
        `/proveedores/${id}`
      );

    return response.data;
  },

  create: async (data) => {
    const response =
      await api.post(
        '/proveedores',
        data
      );

    return response.data;
  },

  darDeBaja: async (id) => {
    const response =
      await api.put(
        `/proveedores/${id}/baja`
      );

    return response.data;
  },

  delete: async (id) => {
    await api.delete(
      `/proveedores/${id}`
    );

    return true;
  },
};

export default ProveedorService;