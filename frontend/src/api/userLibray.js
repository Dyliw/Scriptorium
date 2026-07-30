import api from './config';

export const userLibraryAPI = {
  addBook: async (bookId, data = {}) => {
    const response = await api.post('/library/books', { id_book: bookId, ...data });
    return response.data;
  },

  // Obtener todos los libros de la biblioteca del usuario
  getBooks: async (params = {}) => {
    const { 
      skip = 0, 
      limit = 20, 
      only_favorites = false,
      only_completed = false,
      only_in_progress = false,
      search = ''
    } = params;
    
    const response = await api.get('/library/books', {
      params: { skip, limit, only_favorites, only_completed, only_in_progress, search }
    });
    return response.data;
  },

  // Obtener un libro específico de la biblioteca
  getBook: async (bookId) => {
    const response = await api.get(`/library/books/${bookId}`);
    return response.data;
  },

  // Actualizar estado de un libro
  updateBook: async (bookId, data) => {
    const response = await api.put(`/library/books/${bookId}`, data);
    return response.data;
  },

  // Eliminar libro de la biblioteca
  removeBook: async (bookId) => {
    const response = await api.delete(`/library/books/${bookId}`);
    return response.data;
  },

  // Alternar favorito
  toggleFavorite: async (bookId) => {
    const response = await api.post(`/library/books/${bookId}/favorite`);
    return response.data;
  },
// Obtener estadísticas de un libro
  getBookStats: async (bookId) => {
    const response = await api.get(`/library/books/${bookId}/stats`);
    return response.data;
  },

  // Actualizar estadísticas de un libro
  updateBookStats: async (bookId, data) => {
    const response = await api.put(`/library/books/${bookId}/stats`, data);
    return response.data;
  },

  // Obtener resumen de la biblioteca
  getSummary: async () => {
    const response = await api.get('/library/summary');
    return response.data;
  }
};
