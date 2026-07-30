import { useState, useEffect, useCallback } from 'react';
import { userLibraryAPI } from '../api/userLibrary';

export const useUserLibrary = (initialParams = {}) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [params, setParams] = useState({
    skip: 0,
    limit: 20,
    only_favorites: false,
    only_completed: false,
    only_in_progress: false,
    search: '',
    ...initialParams
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userLibraryAPI.getBooks(params);
      setBooks(data.user_books || []);
      setTotal(data.total || 0);
      setFavoritesCount(data.favorites_count || 0);
      setCompletedCount(data.completed_count || 0);
      setInProgressCount(data.in_progress_count || 0);
    } catch (err) {
      setError(err.message || 'Error al cargar tu biblioteca');
      console.error('Error fetching user library:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams, skip: 0 }));
  };

  const goToPage = (page) => {
    setParams(prev => ({ ...prev, skip: (page - 1) * prev.limit }));
  };

  const toggleFavorite = async (bookId) => {
    try {
      const updated = await userLibraryAPI.toggleFavorite(bookId);
      // Actualizar la lista local
      setBooks(prev => prev.map(book => 
        book.id_book === bookId 
          ? { ...book, is_favorite: updated.is_favorite }
          : book
      ));
      return updated;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  const removeBook = async (bookId) => {
    try {
      await userLibraryAPI.removeBook(bookId);
      setBooks(prev => prev.filter(book => book.id_book !== bookId));
      setTotal(prev => prev - 1);
      return true;
    } catch (err) {
      console.error('Error removing book:', err);
      throw err;
    }
  };

  const updateBookProgress = async (bookId, data) => {
    try {
      const updated = await userLibraryAPI.updateBook(bookId, data);
      setBooks(prev => prev.map(book => 
        book.id_book === bookId ? updated : book
      ));
      return updated;
    } catch (err) {
      console.error('Error updating book:', err);
      throw err;
    }
  };

  return {
    books,
    loading,
    error,
    total,
    favoritesCount,
    completedCount,
    inProgressCount,
    params,
    updateParams,
    goToPage,
    toggleFavorite,
    removeBook,
    updateBookProgress,
    refetch: fetchBooks
  };
};

export const useLibrarySummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const data = await userLibraryAPI.getSummary();
        setSummary(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching library summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return { summary, loading, error };
};
