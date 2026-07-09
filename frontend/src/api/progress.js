import api from './config';

export const progressAPI = {
  // Mi progreso general
  getMyProgress: async () => {
    const response = await api.get('/progress/me');
    return response.data;
  },

  // Progreso en un libro
  getBookProgress: async (bookId) => {
    const response = await api.get(`/progress/me/books/${bookId}`);
    return response.data;
  },

  // Progreso en un capítulo
  getChapterProgress: async (chapterId) => {
    const response = await api.get(`/progress/me/chapters/${chapterId}`);
    return response.data;
  },

  // Línea de tiempo
  getTimeline: async (days = 30) => {
    const response = await api.get('/progress/me/timeline', {
      params: { days }
    });
    return response.data;
  },

  // Estadísticas detalladas
  getStats: async () => {
    const response = await api.get('/progress/me/stats');
    return response.data;
  },

  // Actividad reciente
  getRecentActivity: async (limit = 10) => {
    const response = await api.get('/progress/me/recent', {
      params: { limit }
    });
    return response.data;
  },

  // Progreso de otro usuario
  getUserProgress: async (username) => {
    const response = await api.get(`/progress/users/${username}`);
    return response.data;
  }
};
