import api from '../config/api';
import { requestApi } from './apiRequest';

const InventarioService = {
  getAll: () =>
    requestApi(async () => {
      const response = await api.get('/inventario');
      if (!Array.isArray(response.data)) {
        throw new Error('La API devolvió una lista de inventario inválida.');
      }
      return response.data;
    }, 'No se pudo consultar el inventario.'),

  getById: (id) =>
    requestApi(
      async () => (await api.get(`/inventario/${id}`)).data,
      'No se encontró el registro de inventario.'
    ),

  create: (data) =>
    requestApi(
      async () => (await api.post('/inventario', data)).data,
      'No se pudo registrar el elemento de inventario.'
    ),

  update: (id, data) =>
    requestApi(
      async () => (await api.put(`/inventario/${id}`, data)).data,
      'No se pudo actualizar el elemento de inventario.'
    ),

  delete: (id) =>
    requestApi(async () => {
      await api.delete(`/inventario/${id}`);
      return true;
    }, 'No se pudo eliminar el elemento de inventario.'),
};

export default InventarioService;
