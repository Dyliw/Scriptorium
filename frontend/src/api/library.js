
import api from './config';

export const libraryAPI = {
  getLibraryStats: async () => {
    try {
      const response = await api.get('/books/stats');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          total_books: 0,
          total_readers: 0,
          popular_books: [],
          recent_books: []
        };
      }
      throw error;
    }
  },

  // Obtener libros populares
  getPopularBooks: async (limit = 10) => {
    try {
      const response = await api.get('/books/popular', { params: { limit } });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Obtener estadísticas de un libro específico
  getBookStats: async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}/stats`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
};
