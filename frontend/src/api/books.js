import apiClient from './client';

export const booksAPI = {
  // Crear libro
  create: async (bookData) => {
    const response = await api.post('/books/', bookData);
    return response.data;
  },

  // Listar libros
  list: async (params = {}) => {
    const response = await api.get('/books/', { params });
    return response.data;
  },

  // Obtener libro por ID
  getById: async (bookId) => {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  },

  // Actualizar libro
  update: async (bookId, bookData) => {
    const response = await api.put(`/books/${bookId}`, bookData);
    return response.data;
  },

  // Eliminar libro
  delete: async (bookId) => {
    const response = await api.delete(`/books/${bookId}`);
    return response.data;
  },

  // --- Capítulos ---

  // Crear capítulo
  createChapter: async (bookId, chapterData) => {
    const response = await api.post(`/books/${bookId}/chapters`, chapterData);
    return response.data;
  },

  // Listar capítulos de un libro
  listChapters: async (bookId, params = {}) => {
    const response = await api.get(`/books/${bookId}/chapters`, { params });
    return response.data;
  },

  // Obtener capítulo por ID
  getChapter: async (chapterId, language = 'es') => {
    const response = await api.get(`/books/chapters/${chapterId}`, {
      params: { language }
    });
    return response.data;
  },

  // Obtener contenido de práctica
  getPracticeContent: async (chapterId, language = 'es') => {
    const response = await api.get(`/books/chapters/${chapterId}/practice`, {
      params: { language }
    });
    return response.data;
  },

  // Actualizar capítulo
  updateChapter: async (chapterId, chapterData) => {
    const response = await api.put(`/books/chapters/${chapterId}`, chapterData);
    return response.data;
  },

  // Eliminar capítulo
  deleteChapter: async (chapterId) => {
    const response = await api.delete(`/books/chapters/${chapterId}`);
    return response.data;
  }
};
