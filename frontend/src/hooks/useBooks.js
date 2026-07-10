import { useState, useEffect } from 'react';
import { booksAPI } from '../api/books';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksAPI.list(params);
      setBooks(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData) => {
    setLoading(true);
    try {
      const newBook = await booksAPI.create(bookData);
      setBooks(prev => [...prev, newBook]);
      return newBook;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (bookId, bookData) => {
    setLoading(true);
    try {
      const updated = await booksAPI.update(bookId, bookData);
      setBooks(prev => prev.map(b => b.id_book === bookId ? updated : b));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (bookId) => {
    setLoading(true);
    try {
      await booksAPI.delete(bookId);
      setBooks(prev => prev.filter(b => b.id_book !== bookId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    books,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook
  };
};

// Hook para capítulos
export const useChapters = (bookId) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChapters = async (params = {}) => {
    setLoading(true);
    try {
      const data = await booksAPI.listChapters(bookId, params);
      setChapters(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createChapter = async (chapterData) => {
    setLoading(true);
    try {
      const newChapter = await booksAPI.createChapter(bookId, chapterData);
      setChapters(prev => [...prev, newChapter]);
      return newChapter;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    chapters,
    loading,
    error,
    fetchChapters,
    createChapter
  };
};
