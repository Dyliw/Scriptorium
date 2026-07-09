import api from './config';

export const sessionsAPI = {
  // Guardar sesión
  save: async (sessionData) => {
    const response = await api.post('/session/', sessionData);
    return response.data;
  },

  // Mis sesiones
  getMySessions: async (params = {}) => {
    const response = await api.get('/session/me', { params });
    return response.data;
  },

  // Mis estadísticas
  getMyStats: async () => {
    const response = await api.get('/session/me/stats');
    return response.data;
  },

  // Detalle de sesión
  getDetail: async (sessionId) => {
    const response = await api.get(`/session/${sessionId}`);
    return response.data;
  },

  // Eliminar sesión
  delete: async (sessionId) => {
    const response = await api.delete(`/session/${sessionId}`);
    return response.data;
  },

  // Estadísticas de capítulo
  getChapterStats: async (chapterId) => {
    const response = await api.get(`/session/chapters/${chapterId}/stats`);
    return response.data;
  }
};
