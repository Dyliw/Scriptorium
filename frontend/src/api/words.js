import api from './config';

export const wordsAPI = {
  // Guardar palabra
  save: async (wordData) => {
    const response = await api.post('/words/', wordData);
    return response.data;
  },

  // Mis palabras
  getMyWords: async (params = {}) => {
    const response = await api.get('/words/me', { params });
    return response.data;
  },

  // Contar palabras
  countMyWords: async (params = {}) => {
    const response = await api.get('/words/me/count', { params });
    return response.data;
  },

  // Palabra aleatoria
  getRandomWord: async () => {
    const response = await api.get('/words/me/random');
    return response.data;
  },

  // Eliminar palabra
  delete: async (wordId) => {
    const response = await api.delete(`/words/${wordId}`);
    return response.data;
  }
};
