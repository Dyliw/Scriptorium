import api from './config';

export const usersAPI = {
  // Obtener perfil de usuario
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Listar usuarios (si existe)
  list: async (params = {}) => {
    const response = await api.get('/users/', { params });
    return response.data;
  }
};
