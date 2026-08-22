// InsumoService.js
// Capa de comunicación con la API. Equivalente a un Repository en Laravel.
// Todas las llamadas HTTP a /insumos van aquí centralizadas.

const BASE_URL = 'http://192.168.100.5:8080/api';
// Si usás Expo Go en celular físico, reemplazá por la IP local de tu PC:
// const BASE_URL = 'http://192.168.1.X:8080';

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const InsumoService = {

  // GET /insumos — equivalente a Insumo::all()
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/insumos`, { headers });
    if (!response.ok) throw new Error('Error al obtener insumos');
    return response.json();
  },

  // GET /insumos/:id — equivalente a Insumo::findOrFail($id)
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/insumos/${id}`, { headers });
    if (!response.ok) throw new Error('Insumo no encontrado');
    return response.json();
  },

  // POST /insumos — equivalente a Insumo::create($data)
  create: async (data) => {
    const response = await fetch(`${BASE_URL}/insumos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear insumo');
    return response.json();
  },

  // PUT /insumos/:id — equivalente a $insumo->update($data)
  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/insumos/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar insumo');
    return response.json();
  },

  // DELETE /insumos/:id — equivalente a $insumo->delete()
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/insumos/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error al eliminar insumo');
    return true;
  },
};

export default InsumoService;
