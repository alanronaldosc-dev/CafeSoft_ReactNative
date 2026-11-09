import api from '../config/api';
import { requestApi } from './apiRequest';

const ProductoService = {
  getAll: () =>
    requestApi(async () => {
      const response = await api.get('/productos');
      if (!Array.isArray(response.data)) {
        throw new Error('La API devolvió una lista de productos inválida.');
      }
      return response.data;
    }, 'No se pudieron consultar los productos.'),

  getById: (id) =>
    requestApi(
      async () => (await api.get(`/productos/${id}`)).data,
      'No se encontró el producto.'
    ),

  create: (data) =>
    requestApi(
      async () => (await api.post('/productos', data)).data,
      'No se pudo registrar el producto.'
    ),

  update: (id, data) =>
    requestApi(
      async () => (await api.put(`/productos/${id}`, data)).data,
      'No se pudo actualizar el producto.'
    ),

  delete: (id) =>
    requestApi(async () => {
      await api.delete(`/productos/${id}`);
      return true;
    }, 'No se pudo eliminar el producto.'),
};

export default ProductoService;
