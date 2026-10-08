// ProveedorService.js
import { BASE_URL } from '../config/api';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const ProveedorService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/proveedores`, { headers });
    if (!response.ok) throw new Error('Error al obtener proveedores');
    return response.json();
  },

  getActivos: async () => {
    const data = await ProveedorService.getAll();
    return (Array.isArray(data) ? data : []).filter((p) => p.activo !== false);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/proveedores/${id}`, { headers });
    if (!response.ok) throw new Error('Proveedor no encontrado');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${BASE_URL}/proveedores`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear proveedor');
    return response.json();
  },

  darDeBaja: async (id) => {
    const response = await fetch(`${BASE_URL}/proveedores/${id}/baja`, {
      method: 'PUT',
      headers,
    });
    if (!response.ok) throw new Error('Error al dar de baja');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/proveedores/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error al eliminar proveedor');
    return true;
  },
};

export default ProveedorService;