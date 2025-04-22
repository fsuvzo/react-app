import axios from 'axios';

const API_URL = 'https://testzone.cvx-r.cl/backend/backend.php';

export async function obtenerClientes() {
  try {
    const res = await axios.get(`${API_URL}?action=get_clientes`);

    // ✅ VERIFICAR AQUÍ:
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.warn('Respuesta inesperada:', res.data);
      return [];
    }
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
}
