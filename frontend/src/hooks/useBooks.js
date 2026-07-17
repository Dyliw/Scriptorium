import { useState, useEffect, useCallback } from 'react';
import { booksAPI } from '../api/books';

export const useBookContent = (initialBookId = null) => {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [practiceContent, setPracticeContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('es');

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const books = await booksAPI.list({ limit: 100 });
      console.log('Books loaded:', books); 
      setBooks(books);
      return books;
    } catch (err) {
      setError(err.message || 'Error al cargar libros');
      console.error('Error loading books:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChapters = useCallback(async (bookId) => {
    setLoading(true);
    setError(null);
    try {
      const chapters = await booksAPI.listChapters(bookId);
      setChapters(chapters);
      return chapters;
    } catch (err) {
      setError(err.message || 'Error al cargar capítulos');
      console.error('Error loading chapters:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPracticeContent = useCallback(async (chapterId, lang = language) => {
    setLoading(true);
    setError(null);
    try {
      const practice = await booksAPI.getPracticeContent(chapterId, lang);
      const content = practice?.content || '';
      setPracticeContent(content);
      return content;
    } catch (err) {
      setError(err.message || 'Error al cargar contenido');
      console.error('Error loading practice content:', err);
      return '';
    } finally {
      setLoading(false);
    }
  }, [language]);

  const selectBook = useCallback(async (bookId) => {
    if (!bookId) {
      console.warn('selectBook called with null/undefined bookId');
      return null;
    }

    try {
      const book = books.find(b => b.id_book === bookId);
      if (!book) {
        console.warn(`Book with id ${bookId} not found`);
        setCurrentBook(null);
        return null;
      }
      
      setCurrentBook(book);
      await loadChapters(bookId);
      return book;
    } catch (err) {
      console.error('Error selecting book:', err);
      setError(err.message || 'Error al seleccionar libro');
      return null;
    }
  }, [books, loadChapters]);

  const selectChapter = useCallback(async (chapterId) => {
    if (!chapterId) {
      console.warn('selectChapter called with null/undefined chapterId');
      return { chapter: null, content: '' };
    }

    try {
      const chapter = chapters.find(c => c.id_chapter === chapterId);
      if (!chapter) {
        console.warn(`Chapter with id ${chapterId} not found`);
        setCurrentChapter(null);
        return { chapter: null, content: '' };
      }
      
      setCurrentChapter(chapter);
      const content = await loadPracticeContent(chapterId);
      
      return {
        chapter: chapter,
        content: content || ''
      };
    } catch (err) {
      console.error('Error selecting chapter:', err);
      setError(err.message || 'Error al seleccionar capítulo');
      return {
        chapter: null,
        content: ''
      };
    }
  }, [chapters, loadPracticeContent]);

  const changeLanguage = useCallback(async (lang) => {
    if (!lang) return;
    
    setLanguage(lang);
    if (currentChapter?.id_chapter) {
      await loadPracticeContent(currentChapter.id_chapter, lang);
    }
  }, [currentChapter, loadPracticeContent]);

  // Inicializar: cargar libros al montar
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Si se proporciona initialBookId, seleccionar ese libro
  useEffect(() => {
    if (initialBookId && books.length > 0) {
      selectBook(initialBookId);
    }
  }, [initialBookId, books, selectBook]);

  // Limpiar error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // Estado
    books,
    chapters,
    currentBook,
    currentChapter,
    practiceContent,
    loading,
    error,
    language,

    // Acciones
    loadBooks,
    loadChapters,
    loadPracticeContent,
    selectBook,
    selectChapter,
    changeLanguage,

    getBookById: (id) => books.find(b => b.id_book === id),
    getChapterById: (id) => chapters.find(c => c.id_chapter === id),
    
    // Reset 
    reset: () => {
      setBooks([]);
      setChapters([]);
      setCurrentBook(null);
      setCurrentChapter(null);
      setPracticeContent('');
      setError(null);
      setLanguage('es');
    }
  };
};
